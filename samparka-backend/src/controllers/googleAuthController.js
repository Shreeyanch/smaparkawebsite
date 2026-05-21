const { OAuth2Client } = require("google-auth-library");
const userModel = require("../models/userModel");
const generateToken = require("../config/generateToken");

const getRedirectUri = () => {
  return process.env.NODE_ENV === "production"
    ? "https://samparka.co/auth/google/callback"
    : "http://localhost:5173/auth/google/callback";
};

// Helper to check OAuth config
const isOAuthConfigured = () => {
  return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
};

// Create OAuth2Client lazily to ensure env vars are loaded
let _client = null;
const getOAuthClient = () => {
  if (!isOAuthConfigured()) {
    console.error("[GoogleAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return null;
  }
  if (!_client) {
    _client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      getRedirectUri()
    );
    console.log("[GoogleAuth] Client initialized with redirect URI:", getRedirectUri());
  }
  return _client;
};

class GoogleAuthController {
  // Generate Google OAuth URL
  getAuthUrl(req, res) {
    const client = getOAuthClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth is not configured on the server",
      });
    }

    const authorizeUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent",
    });

    return res.json({ success: true, url: authorizeUrl });
  }

  // Handle Google OAuth callback
  async callback(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
      }

      const client = getOAuthClient();
      if (!client) {
        return res.status(500).json({
          success: false,
          message: "Google OAuth is not configured on the server. Please contact support.",
        });
      }

      // Exchange code for tokens
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      // Get user info from Google
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists
      let user = await userModel.findOne({
        $or: [{ googleId }, { email }],
      });

      if (user) {
        // User exists - update Google info if not set
        if (!user.googleId) {
          user.googleId = googleId;
          user.authProvider = "google";
          if (!user.name) user.name = name;
          if (!user.picture) user.picture = picture;
          await user.save();
        }

        // Check if account is active
        if (user.status !== "active") {
          return res.json({
            success: false,
            message: "Your account is not active. Please contact support.",
          });
        }
      } else {
        // Create new user
        user = await userModel.create({
          email,
          name,
          picture,
          googleId,
          authProvider: "google",
          role: "user",
          status: "active",
        });
      }

      // Return user data and JWT token (same as regular login)
      const userData = await userModel
        .findById(user._id)
        .select("-password -resetPasswordToken -resetPasswordExpire");

      return res.json({
        success: true,
        message: "Login Successful",
        userData,
        token: generateToken(user._id, null, userData.tokenVersion),
      });
    } catch (error) {
      console.error("Google OAuth Error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: error.message,
      });
    }
  }
}

module.exports = new GoogleAuthController();