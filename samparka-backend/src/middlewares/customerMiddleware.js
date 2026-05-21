const jwt = require("jsonwebtoken");
const customerModel = require("../models/customerModel");

module.exports = async (req, res, next) => {
  console.log('[customerMiddleware] Request to:', req.method, req.originalUrl);
  const token = req.headers.token;

  if (!token) {
    console.log('[customerMiddleware] No token provided');
    return res
      .status(401)
      .json({ success: false, message: "Token Not Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if expired
    const user = await customerModel.findById(decoded.id).populate("store");

    if (!user) {
      console.log('[customerMiddleware] User not found for decoded id:', decoded.id);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    console.log('[customerMiddleware] Authenticated customer:', user._id.toString());
    req.user = user;
    next();
  } catch (err) {
    console.log('[customerMiddleware] Auth error:', err.name, err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }
    return res.status(403).json({ success: false, message: "Invalid Token" });
  }
};
