const jwt = require("jsonwebtoken");
const storeModel = require("../models/storeModel");

module.exports = async (req, res, next) => {
  console.log('[storeMiddleware] Request to:', req.method, req.originalUrl);
  const token = req.headers.token;

  if (!token) {
    console.log('[storeMiddleware] No token provided');
    return res
      .status(401)
      .json({ success: false, message: "Token Not Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if expired
    const store = await storeModel.findById(decoded.id);

    if (!store) {
      return res
        .status(401)
        .json({ success: false, message: "Store not found" });
    }

    // Check if subscription has expired
    if (store.subscriptionEndDate && new Date(store.subscriptionEndDate) < new Date()) {
      // Automatically deactivate the store if subscription expired
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

    req.store = store;
    console.log('[storeMiddleware] Authenticated store:', store._id.toString());
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }
    return res.status(403).json({ success: false, message: "Invalid Token" });
  }
};
