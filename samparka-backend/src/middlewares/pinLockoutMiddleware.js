/**
 * PIN Lockout Middleware
 * 
 * Server-side middleware that enforces lockout before PIN verification.
 * Uses the PIN Gateway Service for all logic - no client-side bypass possible.
 * 
 * This middleware:
 * 1. Checks if device is locked/blocked before allowing PIN attempt
 * 2. Returns appropriate error messages with remaining time
 * 3. Integrates with database-backed persistence
 */

const pinGatewayService = require("../services/pinGatewayService.js");
const storeModel = require("../models/storeModel.js");

/**
 * Middleware to check lockout status before PIN verification.
 * Blocks requests from locked/blocked devices with clear messages.
 */
const checkPinLockout = async (req, res, next) => {
  try {
    const { storeURL } = req.params;
    
    // Find store to get ObjectId
    const store = await storeModel.findOne({ url: storeURL }).select("_id");
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }
    
    // Check lock status using the gateway service
    const lockStatus = await pinGatewayService.checkLockStatus(store._id, req);
    
    if (!lockStatus.allowed) {
      // Device is locked or blocked - deny access
      return res.json({
        success: false,
        locked: lockStatus.locked || false,
        blocked: lockStatus.blocked || false,
        message: lockStatus.message,
        remainingTime: lockStatus.remainingTime,
        lockPhase: lockStatus.lockPhase,
      });
    }
    
    // Attach store ID to request for use in controller
    req.storeId = store._id;
    req.lockPhase = lockStatus.lockPhase || 0;
    
    next();
  } catch (error) {
    console.error("[PIN Lockout Middleware] Error:", error);
    // On error, allow request to proceed (fail-open for availability)
    // The controller will handle any issues
    next();
  }
};

/**
 * Utility export for direct access to gateway functions in controller
 */
module.exports = {
  checkPinLockout,
  
  // Re-export gateway functions for controller use
  recordFailedAttempt: pinGatewayService.recordFailedAttempt,
  clearLockoutOnSuccess: pinGatewayService.clearLockoutOnSuccess,
  getClientIP: pinGatewayService.getClientIP,
  getLockoutInfo: pinGatewayService.getLockoutInfo,
  CONFIG: pinGatewayService.CONFIG,
};

