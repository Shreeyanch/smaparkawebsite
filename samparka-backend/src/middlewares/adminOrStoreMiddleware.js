const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const storeModel = require("../models/storeModel");

/**
 * Middleware that accepts both admin tokens and store tokens
 * Used for endpoints that L5 sub-admins (stores) need access to
 */
module.exports = async (req, res, next) => {
  console.log('[adminOrStoreMiddleware] Request to:', req.method, req.originalUrl);
  const token = req.headers.token;

  if (!token) {
    console.log('[adminOrStoreMiddleware] No token provided');
    return res
      .status(401)
      .json({ success: false, message: "Token Not Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user (admin) first
    const user = await userModel.findById(decoded.id);
    if (user) {
      console.log('[adminOrStoreMiddleware] Authenticated as admin:', user._id.toString());
      req.user = user;
      return next();
    }
    
    // If not a user, try to find store
    const store = await storeModel.findById(decoded.id);
    if (store) {
      // Check if subscription has expired
      if (store.subscriptionEndDate && new Date(store.subscriptionEndDate) < new Date()) {
        if (store.status === "active") {
          store.status = "deactive";
          await store.save();
        }
        return res
          .status(403)
          .json({ success: false, message: "Subscription expired. Please renew your subscription." });
      }

      // Check if store is active
      if (store.status !== "active") {
        return res
          .status(403)
          .json({ success: false, message: "Store is inactive" });
      }

      console.log('[adminOrStoreMiddleware] Authenticated as store:', store._id.toString());
      req.store = store;
      return next();
    }
    
    // Neither user nor store found
    return res
      .status(401)
      .json({ success: false, message: "User or Store not found" });
      
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }
    console.error('[adminOrStoreMiddleware] Error:', err);
    return res.status(403).json({ success: false, message: "Invalid Token" });
  }
};
