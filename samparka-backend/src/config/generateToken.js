// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken");

let generateToken;
generateToken = (id, time, tokenVersion) => {
  const payload = { id };
  if (tokenVersion !== undefined) payload.tokenVersion = tokenVersion;
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: time ? time : "30 days",
  });
};

module.exports = generateToken;
