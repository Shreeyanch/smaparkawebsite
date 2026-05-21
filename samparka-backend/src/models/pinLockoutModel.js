/**
 * PIN Lockout Model
 * 
 * Persists lock state per (store_id + client_key) combination.
 * Uses MongoDB TTL index for automatic cleanup after 24 hours.
 * 
 * Lock Phases:
 * - Phase 0: Initial state, allows 4 attempts before 30-second lock
 * - Phase 1: After 30s lock, allows 1 attempt before 1-minute lock + warning
 * - Phase 2: After 1-min lock, any failure triggers 24-hour block
 */

const mongoose = require("mongoose");

const pinLockoutSchema = new mongoose.Schema(
  {
    // Composite key: storeId + clientKey uniquely identifies a device-store pair
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    
    // Device fingerprint hash (IP + User-Agent + Accept-Language + Timezone)
    clientKey: {
      type: String,
      required: true,
      index: true,
    },
    
    // Number of consecutive failed attempts in current phase
    failedAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Current lock phase (0, 1, or 2)
    // Phase 0: Normal state, counting to 4 attempts
    // Phase 1: Post-30s lock, single attempt allowed
    // Phase 2: Post-1min lock, any fail = 24h block
    lockPhase: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
    },
    
    // Timestamp when temporary lock expires (30s or 1min locks)
    lockUntil: {
      type: Date,
      default: null,
    },
    
    // Timestamp when 24-hour block expires
    blockUntil: {
      type: Date,
      default: null,
    },
    
    // Last attempt timestamp for rate limiting
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    
    // IP address for logging/monitoring (not used for identification)
    ipAddress: {
      type: String,
      default: null,
    },
    
    // Auto-expire records after 24 hours of inactivity
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
pinLockoutSchema.index({ storeId: 1, clientKey: 1 }, { unique: true });

// Method to check if currently locked (30s or 1min lock)
pinLockoutSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Method to check if currently blocked (24h block)
pinLockoutSchema.methods.isBlocked = function () {
  return this.blockUntil && this.blockUntil > new Date();
};

// Method to get remaining lock/block time in seconds
pinLockoutSchema.methods.getRemainingTime = function () {
  const now = new Date();
  
  if (this.blockUntil && this.blockUntil > now) {
    return Math.ceil((this.blockUntil - now) / 1000);
  }
  
  if (this.lockUntil && this.lockUntil > now) {
    return Math.ceil((this.lockUntil - now) / 1000);
  }
  
  return 0;
};

// Static method for atomic find-and-update operations
pinLockoutSchema.statics.findOneAndUpdateAtomic = async function (
  storeId,
  clientKey,
  updateFn
) {
  // Use MongoDB's findOneAndUpdate with optimistic locking pattern
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    let doc = await this.findOne({ storeId, clientKey }).session(session);
    
    if (!doc) {
      doc = new this({ storeId, clientKey });
    }
    
    // Apply the update function
    const result = await updateFn(doc);
    
    // Refresh TTL on any activity
    doc.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await doc.save({ session });
    await session.commitTransaction();
    
    return { doc, result };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model("PinLockout", pinLockoutSchema);
