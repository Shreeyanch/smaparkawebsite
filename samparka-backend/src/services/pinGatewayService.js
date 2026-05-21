/**
 * PIN Gateway Service
 * 
 * Implements secure, multi-phase lockout logic for store PIN access.
 * All logic is server-side with database persistence.
 * 
 * ============================================================
 * LOCKOUT PHASES EXPLAINED:
 * ============================================================
 * 
 * PHASE 0 (Initial State):
 * - User gets 4 attempts
 * - On 4th failed attempt → 30-second lock, advance to Phase 1
 * 
 * PHASE 1 (Post-30s Lock):
 * - After 30s lock expires, user gets 1 attempt
 * - On failed attempt → 1-minute lock + warning message, advance to Phase 2
 * 
 * PHASE 2 (Final Warning):
 * - After 1-minute lock expires, user gets 1 final attempt
 * - On failed attempt → 24-hour block
 * 
 * ============================================================
 * DEVICE IDENTIFICATION:
 * ============================================================
 * 
 * We generate a client fingerprint by hashing:
 * - IP Address
 * - User-Agent header
 * - Accept-Language header
 * - Timezone (from custom header or default)
 * 
 * This prevents users from bypassing locks via:
 * - Page refresh
 * - Incognito mode (same fingerprint)
 * - Clearing cookies/localStorage
 * 
 * ============================================================
 */

const crypto = require("crypto");
const PinLockout = require("../models/pinLockoutModel.js");

// ============================================================
// CONFIGURATION CONSTANTS
// ============================================================

const CONFIG = {
  // Phase 0: Number of attempts before first lock
  PHASE_0_MAX_ATTEMPTS: 4,
  
  // Phase 0 → 1: Lock duration (30 seconds)
  PHASE_0_LOCK_DURATION: 30 * 1000,
  
  // Phase 1: Number of attempts before second lock
  PHASE_1_MAX_ATTEMPTS: 1,
  
  // Phase 1 → 2: Lock duration (1 minute)
  PHASE_1_LOCK_DURATION: 60 * 1000,
  
  // Phase 2: Number of attempts before 24h block
  PHASE_2_MAX_ATTEMPTS: 1,
  
  // Phase 2: Block duration (24 hours)
  PHASE_2_BLOCK_DURATION: 24 * 60 * 60 * 1000,
  
  // Minimum time between requests (rate limiting)
  MIN_REQUEST_INTERVAL: 1000, // 1 second
};

// ============================================================
// CLIENT FINGERPRINT GENERATION
// ============================================================

/**
 * Extracts client IP address, considering proxy headers
 * @param {Request} req - Express request object
 * @returns {string} Client IP address
 */
const getClientIP = (req) => {
  // Check X-Forwarded-For header (common for proxies/load balancers)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // Take the first IP (original client)
    return forwarded.split(",")[0].trim();
  }
  
  // Check X-Real-IP header (Nginx)
  if (req.headers["x-real-ip"]) {
    return req.headers["x-real-ip"];
  }
  
  // Direct connection
  return req.ip || req.connection?.remoteAddress || "unknown";
};

/**
 * Generates a unique client fingerprint by hashing device characteristics.
 * This fingerprint is used to identify devices without cookies/sessions.
 * 
 * @param {Request} req - Express request object
 * @returns {string} SHA-256 hash of client characteristics
 */
const generateClientKey = (req) => {
  const ip = getClientIP(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  const acceptLanguage = req.headers["accept-language"] || "unknown";
  
  // Timezone can be sent via custom header from frontend
  const timezone = req.headers["x-timezone"] || "unknown";
  
  // Combine all factors into a single string
  const fingerprint = `${ip}|${userAgent}|${acceptLanguage}|${timezone}`;
  
  // Hash the fingerprint for privacy and consistent length
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
};

// ============================================================
// TIME FORMATTING UTILITIES
// ============================================================

/**
 * Formats remaining time into human-readable string
 * @param {number} seconds - Remaining seconds
 * @returns {string} Formatted time string
 */
const formatRemainingTime = (seconds) => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} minute${mins > 1 ? "s" : ""}`;
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
};

// ============================================================
// CORE LOCKOUT LOGIC
// ============================================================

/**
 * Checks if a device is currently locked or blocked.
 * Call this BEFORE processing a PIN attempt.
 * 
 * @param {string} storeId - Store's MongoDB ObjectId
 * @param {Request} req - Express request object
 * @returns {Object} { allowed: boolean, message?: string, remainingTime?: number }
 */
const checkLockStatus = async (storeId, req) => {
  const clientKey = generateClientKey(req);
  const now = new Date();
  
  // Find existing lockout record
  const lockout = await PinLockout.findOne({ storeId, clientKey });
  
  // No record = no lock
  if (!lockout) {
    return { allowed: true };
  }
  
  // Check for 24-hour block first (highest priority)
  if (lockout.blockUntil && lockout.blockUntil > now) {
    const remaining = Math.ceil((lockout.blockUntil - now) / 1000);
    return {
      allowed: false,
      blocked: true,
      message: `Access blocked for ${formatRemainingTime(remaining)}. Too many failed attempts.`,
      remainingTime: remaining,
      lockPhase: lockout.lockPhase,
    };
  }
  
  // Check for temporary lock (30s or 1min)
  if (lockout.lockUntil && lockout.lockUntil > now) {
    const remaining = Math.ceil((lockout.lockUntil - now) / 1000);
    
    // Phase-specific messages
    let message;
    if (lockout.lockPhase === 1) {
      message = `Locked for ${formatRemainingTime(remaining)}. Please wait.`;
    } else if (lockout.lockPhase === 2) {
      message = `Locked for ${formatRemainingTime(remaining)}. Warning: Next wrong PIN will block access for 24 hours.`;
    } else {
      message = `Please wait ${formatRemainingTime(remaining)} before trying again.`;
    }
    
    return {
      allowed: false,
      locked: true,
      message,
      remainingTime: remaining,
      lockPhase: lockout.lockPhase,
    };
  }
  
  // Rate limiting: prevent rapid requests
  if (lockout.lastAttemptAt) {
    const timeSinceLastAttempt = now - lockout.lastAttemptAt;
    if (timeSinceLastAttempt < CONFIG.MIN_REQUEST_INTERVAL) {
      return {
        allowed: false,
        message: "Too many requests. Please slow down.",
        remainingTime: 1,
      };
    }
  }
  
  // Lock has expired, request allowed
  return { allowed: true, lockPhase: lockout.lockPhase };
};

/**
 * Records a failed PIN attempt and applies appropriate lockout.
 * Uses atomic operations to prevent race conditions.
 * 
 * @param {string} storeId - Store's MongoDB ObjectId
 * @param {Request} req - Express request object
 * @returns {Object} Lockout status with message for client
 */
const recordFailedAttempt = async (storeId, req) => {
  const clientKey = generateClientKey(req);
  const ipAddress = getClientIP(req);
  const now = new Date();
  
  // Use findOneAndUpdate for atomic operation
  const lockout = await PinLockout.findOneAndUpdate(
    { storeId, clientKey },
    {
      $setOnInsert: {
        storeId,
        clientKey,
        lockPhase: 0,
        failedAttempts: 0,
      },
    },
    { upsert: true, new: true }
  );
  
  // Update last attempt time and IP
  lockout.lastAttemptAt = now;
  lockout.ipAddress = ipAddress;
  
  // Refresh TTL
  lockout.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  // ============================================================
  // PHASE-BASED LOCKOUT LOGIC
  // ============================================================
  
  let result;
  
  switch (lockout.lockPhase) {
    // ------------------------------------------------------------
    // PHASE 0: Initial state - 4 attempts allowed
    // ------------------------------------------------------------
    case 0:
      lockout.failedAttempts += 1;
      
      if (lockout.failedAttempts >= CONFIG.PHASE_0_MAX_ATTEMPTS) {
        // 4th failed attempt → 30-second lock, advance to Phase 1
        lockout.lockUntil = new Date(now.getTime() + CONFIG.PHASE_0_LOCK_DURATION);
        lockout.lockPhase = 1;
        lockout.failedAttempts = 0; // Reset for next phase
        
        result = {
          locked: true,
          message: `Incorrect PIN. Locked for 30 seconds.`,
          remainingTime: Math.ceil(CONFIG.PHASE_0_LOCK_DURATION / 1000),
          attemptsRemaining: 0,
          lockPhase: 1,
        };
      } else {
        // Still have attempts remaining
        const attemptsRemaining = CONFIG.PHASE_0_MAX_ATTEMPTS - lockout.failedAttempts;
        result = {
          locked: false,
          message: `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining > 1 ? "s" : ""} remaining.`,
          attemptsRemaining,
          lockPhase: 0,
        };
      }
      break;
    
    // ------------------------------------------------------------
    // PHASE 1: Post-30s lock - 1 attempt allowed
    // ------------------------------------------------------------
    case 1:
      lockout.failedAttempts += 1;
      
      if (lockout.failedAttempts >= CONFIG.PHASE_1_MAX_ATTEMPTS) {
        // Failed attempt → 1-minute lock with warning, advance to Phase 2
        lockout.lockUntil = new Date(now.getTime() + CONFIG.PHASE_1_LOCK_DURATION);
        lockout.lockPhase = 2;
        lockout.failedAttempts = 0; // Reset for next phase
        
        result = {
          locked: true,
          message: `Incorrect PIN. Locked for 1 minute. Warning: Next wrong PIN will block access for 24 hours.`,
          remainingTime: Math.ceil(CONFIG.PHASE_1_LOCK_DURATION / 1000),
          attemptsRemaining: 0,
          lockPhase: 2,
          warning: true,
        };
      } else {
        result = {
          locked: false,
          message: `Incorrect PIN. This is your last chance before extended lockout.`,
          attemptsRemaining: CONFIG.PHASE_1_MAX_ATTEMPTS - lockout.failedAttempts,
          lockPhase: 1,
        };
      }
      break;
    
    // ------------------------------------------------------------
    // PHASE 2: Final warning - any fail = 24h block
    // ------------------------------------------------------------
    case 2:
      // Any failed attempt here triggers 24-hour block
      lockout.blockUntil = new Date(now.getTime() + CONFIG.PHASE_2_BLOCK_DURATION);
      lockout.lockUntil = null; // Clear temporary lock
      lockout.failedAttempts = 0;
      
      result = {
        blocked: true,
        message: `Incorrect PIN. Access blocked for 24 hours due to repeated failed attempts.`,
        remainingTime: Math.ceil(CONFIG.PHASE_2_BLOCK_DURATION / 1000),
        attemptsRemaining: 0,
        lockPhase: 2,
      };
      break;
    
    default:
      // Should never reach here, but handle gracefully
      lockout.lockPhase = 0;
      lockout.failedAttempts = 1;
      result = {
        locked: false,
        message: `Incorrect PIN. ${CONFIG.PHASE_0_MAX_ATTEMPTS - 1} attempts remaining.`,
        attemptsRemaining: CONFIG.PHASE_0_MAX_ATTEMPTS - 1,
        lockPhase: 0,
      };
  }
  
  // Save the updated lockout record
  await lockout.save();
  
  // Log for monitoring (you can integrate with your logging system)
  console.log(`[PIN Gateway] Failed attempt - Store: ${storeId}, Phase: ${lockout.lockPhase}, IP: ${ipAddress}`);
  
  return result;
};

/**
 * Clears all lockout data on successful PIN entry.
 * Resets the device to a clean state.
 * 
 * @param {string} storeId - Store's MongoDB ObjectId
 * @param {Request} req - Express request object
 */
const clearLockoutOnSuccess = async (storeId, req) => {
  const clientKey = generateClientKey(req);
  
  // Delete the lockout record entirely
  await PinLockout.deleteOne({ storeId, clientKey });
  
  console.log(`[PIN Gateway] Successful login - Store: ${storeId}, Lockout cleared`);
};

/**
 * Gets current status for a device (for informational purposes)
 * 
 * @param {string} storeId - Store's MongoDB ObjectId
 * @param {Request} req - Express request object
 * @returns {Object} Current lockout status
 */
const getLockoutInfo = async (storeId, req) => {
  const clientKey = generateClientKey(req);
  const lockout = await PinLockout.findOne({ storeId, clientKey });
  
  if (!lockout) {
    return {
      phase: 0,
      failedAttempts: 0,
      attemptsRemaining: CONFIG.PHASE_0_MAX_ATTEMPTS,
      isLocked: false,
      isBlocked: false,
    };
  }
  
  const now = new Date();
  const isLocked = lockout.lockUntil && lockout.lockUntil > now;
  const isBlocked = lockout.blockUntil && lockout.blockUntil > now;
  
  let attemptsRemaining;
  switch (lockout.lockPhase) {
    case 0:
      attemptsRemaining = CONFIG.PHASE_0_MAX_ATTEMPTS - lockout.failedAttempts;
      break;
    case 1:
      attemptsRemaining = CONFIG.PHASE_1_MAX_ATTEMPTS - lockout.failedAttempts;
      break;
    case 2:
      attemptsRemaining = CONFIG.PHASE_2_MAX_ATTEMPTS - lockout.failedAttempts;
      break;
    default:
      attemptsRemaining = 0;
  }
  
  return {
    phase: lockout.lockPhase,
    failedAttempts: lockout.failedAttempts,
    attemptsRemaining: Math.max(0, attemptsRemaining),
    isLocked,
    isBlocked,
    remainingTime: lockout.getRemainingTime(),
  };
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Core functions
  checkLockStatus,
  recordFailedAttempt,
  clearLockoutOnSuccess,
  getLockoutInfo,
  
  // Utilities
  generateClientKey,
  getClientIP,
  formatRemainingTime,
  
  // Configuration (for reference)
  CONFIG,
};
