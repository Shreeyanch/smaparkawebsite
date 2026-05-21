const { Router } = require("express");
const authController = require("../controllers/authController");

const router = Router();

// ===== LOGIN ROUTES =====
// GET /auth/google/login-url
router.get("/login-url", authController.getGoogleLoginUrl);

// POST /auth/google/login
router.post("/login", authController.googleLogin);

// ===== SIGNUP ROUTES =====
// GET /auth/google/signup-url
router.get("/signup-url", authController.getGoogleSignupUrl);

// POST /auth/google/signup
router.post("/signup", authController.googleSignupInitiate);

// Email/Password Signup - POST /auth/google/email-signup
router.post("/email-signup", authController.emailSignupInitiate);

// ===== VERIFICATION ROUTES =====
// POST /auth/google/verify-email
router.post("/verify-email", authController.verifyEmail);

// POST /auth/google/resend-code
router.post("/resend-code", authController.resendVerificationCode);

// POST /auth/google/complete-profile
router.post("/complete-profile", authController.completeGoogleSignup);

// ===== LEGACY ROUTES (for backward compatibility) =====
// Keep old routes working during transition
router.get("/url", authController.getGoogleLoginUrl);
router.post("/callback", authController.googleLogin);

module.exports = router;