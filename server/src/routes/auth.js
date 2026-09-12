import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

export default router;

