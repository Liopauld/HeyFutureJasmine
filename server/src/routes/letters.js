import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { letterLimiter } from "../middleware/rateLimiter.js";
import {
  createLetter,
  getLetters,
  getPublicLetters,
  getLetterById,
  getLetterForEdit,
  unlockLetter,
  likeLetter,
  updateLetter,
  deleteLetter
} from "../controllers/letterController.js";

const router = Router();

router.post("/", requireAuth, letterLimiter, createLetter);
router.get("/", requireAuth, getLetters);
router.get("/public", getPublicLetters);
router.get("/unlock/:token", unlockLetter);
router.post("/:id/like", letterLimiter, likeLetter);
// Must sit above "/:id" so "edit" isn't swallowed as an id.
router.get("/:id/edit", requireAuth, getLetterForEdit);
router.get("/:id", requireAuth, getLetterById);
router.patch("/:id", requireAuth, updateLetter);
router.delete("/:id", requireAuth, deleteLetter);

export default router;
