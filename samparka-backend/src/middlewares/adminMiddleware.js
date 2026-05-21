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
    console.log(user);
    if (user.role == "admin") {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ success: false, message: "Access Denied" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }
    return res.status(403).json({ success: false, message: "Invalid Token" });
  }
};
