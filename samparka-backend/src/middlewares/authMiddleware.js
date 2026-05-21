const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token Not Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if expired
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }
    return res.status(403).json({ success: false, message: "Invalid Token" });
  }
};
