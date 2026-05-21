const { OAuth2Client } = require("google-auth-library");
const userModel = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const getRedirectUri = () => {
  return process.env.NODE_ENV === "production"
    ? "https://samparka.co/auth/google/callback"
    : "http://localhost:5173/auth/google/callback";
};

// Helper to check OAuth config before operations
const isOAuthConfigured = () => {
  return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
};

// Create OAuth2Client lazily to ensure env vars are loaded
let _client = null;
const getOAuthClient = () => {
  if (!isOAuthConfigured()) {
    console.error("[OAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    console.error("[OAuth] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET");
    console.error("[OAuth] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET");
    return null;
  }
  if (!_client) {
    _client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      getRedirectUri()
    );
    console.log("[OAuth] Client initialized with redirect URI:", getRedirectUri());
  }
  return _client;
};

// Log OAuth configuration on startup
console.log("[OAuth Config] NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("[OAuth Config] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET");
console.log("[OAuth Config] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET");
console.log("[OAuth Config] Redirect URI:", getRedirectUri());

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email - SAMPARKA",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border: 1px solid #ddd;">
        <img src="https://res.cloudinary.com/spyc/image/upload/v1737542135/SAMPARKA_ynzpeq.png" alt="SAMPARKA" style="display: block; max-width: 150px; margin: 0 auto 20px; border-radius: 8px;" />
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="color: #555; line-height: 1.6;">Hi ${name || "there"},</p>
        <p style="color: #555; line-height: 1.6;">Thank you for signing up with SAMPARKA. Please use the verification code below to complete your registration:</p>
        <div style="background: #f1f1f1; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
        </div>
        <p style="color: #555; line-height: 1.6;">This code will expire in 15 minutes.</p>
        <p style="color: #555; line-height: 1.6;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} SAMPARKA. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

class AuthController {
  // Generate Google OAuth URL for Login
  getGoogleLoginUrl(req, res) {
    const client = getOAuthClient();
    if (!client) {
      console.error("[OAuth] Cannot generate login URL: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
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
      state: "login", // Indicate this is a login flow
    });

    return res.json({ success: true, url: authorizeUrl });
  }

  // Generate Google OAuth URL for Signup
  getGoogleSignupUrl(req, res) {
    const client = getOAuthClient();
    if (!client) {
      console.error("[OAuth] Cannot generate signup URL: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
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
      state: "signup", // Indicate this is a signup flow
    });

    return res.json({ success: true, url: authorizeUrl });
  }

  // Handle Google OAuth callback for LOGIN only
  async googleLogin(req, res) {
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

      // Verify ID token
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email } = payload;

      // Find user by googleId (primary) or email
      const user = await userModel.findOne({
        $or: [{ googleId }, { email }],
      });

      // If user doesn't exist, redirect to signup
      if (!user) {
        return res.json({
          success: false,
          requiresSignup: true,
          message: "No account found. Please sign up first.",
        });
      }

      // Check if account is active
      if (user.status === "pending_verification") {
        return res.json({
          success: false,
          requiresVerification: true,
          email: user.email,
          message: "Please verify your email to continue.",
        });
      }

      if (user.status !== "active") {
        return res.json({
          success: false,
          message: "Your account is not active. Please contact support.",
        });
      }

      // Update Google info if user signed up with email but now logging in with Google
      if (!user.googleId && user.authProvider === "local") {
        user.googleId = googleId;
        if (!user.picture) user.picture = payload.picture;
        await user.save();
      }

      // Return user data and JWT token
      const userData = await userModel
        .findById(user._id)
        .select("-password -verificationCode -verificationCodeExpire -pendingGoogleData -resetPasswordToken -resetPasswordExpire");

      return res.json({
        success: true,
        message: "Login Successful",
        userData,
        token: generateToken(user._id, null, userData.tokenVersion),
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      console.error("[OAuth] Error details:", JSON.stringify(error.response?.data || error.message, null, 2));
      console.error("[OAuth] Redirect URI used:", getRedirectUri());

      // Extract detailed error information from Google's response
      let errorMessage = "Authentication failed";
      let errorDetails = error.message;

      if (error.response?.data?.error_description) {
        errorDetails = error.response.data.error_description;
      } else if (error.response?.data?.error) {
        errorDetails = error.response.data.error;
      }

      // Check for common OAuth errors
      if (errorDetails?.includes("redirect_uri_mismatch")) {
        errorMessage = "OAuth configuration error: redirect_uri_mismatch. Please ensure the redirect URI is registered in Google Cloud Console.";
        console.error("[OAuth] Redirect URI mismatch. Expected URI:", getRedirectUri());
      } else if (errorDetails?.includes("invalid_grant")) {
        errorMessage = "Authorization code expired or already used. Please try again.";
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorDetails,
      });
    }
  }

  // Handle Google OAuth callback for SIGNUP - Step 1: Initiate
  async googleSignupInitiate(req, res) {
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

      // Verify ID token
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user already exists
      const existingUser = await userModel.findOne({
        $or: [{ googleId }, { email }],
      });

      if (existingUser) {
        // If user exists and is active, redirect to login
        if (existingUser.status === "active") {
          return res.json({
            success: false,
            userExists: true,
            message: "An account with this email already exists. Please login instead.",
          });
        }
        
        // If pending verification, resend code
        if (existingUser.status === "pending_verification") {
          const verificationCode = generateVerificationCode();
          existingUser.verificationCode = verificationCode;
          existingUser.verificationCodeExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
          existingUser.pendingGoogleData = { googleId, email, name, picture };
          await existingUser.save();

          await sendVerificationEmail(email, verificationCode, name);

          return res.json({
            success: true,
            step: "verify_email",
            email,
            name,
            message: "Verification code sent to your email.",
          });
        }
      }

      // Create new user in pending state
      const verificationCode = generateVerificationCode();
      
      const newUser = await userModel.create({
        email,
        name,
        picture,
        authProvider: "google",
        status: "active",
        emailVerified: false,
        verificationCode,
        verificationCodeExpire: Date.now() + 15 * 60 * 1000,
        pendingGoogleData: { googleId, email, name, picture },
      });

      // Send verification email
      await sendVerificationEmail(email, verificationCode, name);

      return res.json({
        success: true,
        step: "verify_email",
        email,
        name,
        message: "Verification code sent to your email.",
      });
    } catch (error) {
      console.error("Google Signup Initiate Error:", error);

      // Extract detailed error information from Google's response
      let errorMessage = "Signup failed";
      let errorDetails = error.message;

      if (error.response?.data?.error_description) {
        errorDetails = error.response.data.error_description;
      } else if (error.response?.data?.error) {
        errorDetails = error.response.data.error;
      }

      // Check for common OAuth errors
      if (errorDetails?.includes("redirect_uri_mismatch")) {
        errorMessage = "OAuth configuration error: redirect_uri_mismatch. Please ensure the redirect URI is registered in Google Cloud Console.";
        console.error("[OAuth] Redirect URI mismatch. Expected URI:", getRedirectUri());
      } else if (errorDetails?.includes("invalid_grant")) {
        errorMessage = "Authorization code expired or already used. Please try again.";
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorDetails,
      });
    }
  }

  // Email/Password Signup - Step 1: Initiate
  async emailSignupInitiate(req, res) {
    try {
      const { email, password, name, username, country } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and name are required",
        });
      }

      // Check if user already exists
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        if (existingUser.status === "active") {
          return res.json({
            success: false,
            userExists: true,
            message: "An account with this email already exists. Please login instead.",
          });
        }

        // If pending verification, update and resend code
        if (existingUser.status === "pending_verification") {
          const verificationCode = generateVerificationCode();
          const hashedPassword = await bcrypt.hash(password, 10);
          
          existingUser.password = hashedPassword;
          existingUser.name = name;
          existingUser.username = username;
          existingUser.country = country;
          existingUser.verificationCode = verificationCode;
          existingUser.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
          await existingUser.save();

          await sendVerificationEmail(email, verificationCode, name);

          return res.json({
            success: true,
            step: "verify_email",
            email,
            message: "Verification code sent to your email.",
          });
        }
      }

      // Create new user
      const verificationCode = generateVerificationCode();
      const hashedPassword = await bcrypt.hash(password, 10);

      await userModel.create({
        email,
        password: hashedPassword,
        name,
        username,
        country,
        authProvider: "local",
        status: "active",
        emailVerified: false,
        verificationCode,
        verificationCodeExpire: Date.now() + 15 * 60 * 1000,
      });

      // Send verification email
      await sendVerificationEmail(email, verificationCode, name);

      return res.json({
        success: true,
        step: "verify_email",
        email,
        message: "Verification code sent to your email.",
      });
    } catch (error) {
      console.error("Email Signup Error:", error);
      return res.status(500).json({
        success: false,
        message: "Signup failed",
        error: error.message,
      });
    }
  }

  // Verify Email Code
  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and verification code are required",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if code is valid and not expired
      if (user.verificationCode !== code) {
        return res.json({
          success: false,
          message: "Invalid verification code",
        });
      }

      if (user.verificationCodeExpire < Date.now()) {
        return res.json({
          success: false,
          codeExpired: true,
          message: "Verification code has expired. Please request a new one.",
        });
      }

      // For email/password signup, activate immediately
      if (user.authProvider === "local") {
        user.emailVerified = true;
        user.status = "active";
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        await user.save();

        const userData = await userModel
          .findById(user._id)
          .select("-password -verificationCode -verificationCodeExpire -pendingGoogleData -resetPasswordToken -resetPasswordExpire");

        return res.json({
          success: true,
          step: "complete",
          message: "Email verified successfully!",
          userData,
          token: generateToken(user._id, null, userData.tokenVersion),
        });
      }

      // For Google signup, proceed to complete profile step
      user.emailVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpire = undefined;
      await user.save();

      return res.json({
        success: true,
        step: "complete_profile",
        email: user.email,
        name: user.name,
        picture: user.picture,
        message: "Email verified! Please complete your profile.",
      });
    } catch (error) {
      console.error("Verify Email Error:", error);
      return res.status(500).json({
        success: false,
        message: "Verification failed",
        error: error.message,
      });
    }
  }

  // Resend Verification Code
  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.status === "active") {
        return res.json({
          success: false,
          message: "Email is already verified",
        });
      }

      // Generate new code
      const verificationCode = generateVerificationCode();
      user.verificationCode = verificationCode;
      user.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
      await user.save();

      // Send email
      await sendVerificationEmail(email, verificationCode, user.name);

      return res.json({
        success: true,
        message: "Verification code sent successfully",
      });
    } catch (error) {
      console.error("Resend Code Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resend code",
        error: error.message,
      });
    }
  }

  // Complete Google Signup Profile
  async completeGoogleSignup(req, res) {
    try {
      const { email, username, country } = req.body;

      if (!email || !username) {
        return res.status(400).json({
          success: false,
          message: "Email and username are required",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.emailVerified) {
        return res.json({
          success: false,
          message: "Please verify your email first",
        });
      }

      // Complete the signup
      if (user.pendingGoogleData) {
        user.googleId = user.pendingGoogleData.googleId;
      }
      user.username = username;
      user.country = country;
      user.status = "active";
      user.pendingGoogleData = undefined;
      await user.save();

      const userData = await userModel
        .findById(user._id)
        .select("-password -verificationCode -verificationCodeExpire -pendingGoogleData -resetPasswordToken -resetPasswordExpire");

      return res.json({
        success: true,
        message: "Account created successfully!",
        userData,
        token: generateToken(user._id, null, userData.tokenVersion),
      });
    } catch (error) {
      console.error("Complete Signup Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to complete signup",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
