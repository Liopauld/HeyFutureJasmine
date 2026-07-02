import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { letterLimiter, noticeboardLimiter } from "../middleware/rateLimiter.js";
import {
  createLetter,
  getLetters,
  getLetterById,
  getPublicLetters,
  unlockLetter,
  updateLetter,
  deleteLetter,
  likeLetter
} from "../controllers/letterController.js";

const router = Router();

router.post("/", requireAuth, letterLimiter, createLetter);
router.get("/", requireAuth, getLetters);
router.get("/public", noticeboardLimiter, getPublicLetters);
router.get("/unlock/:token", unlockLetter);
router.get("/:id", requireAuth, getLetterById);
router.patch("/:id", requireAuth, updateLetter);
router.delete("/:id", requireAuth, deleteLetter);
router.post("/:id/like", likeLetter);

export default router;
