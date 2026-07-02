import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  updateMe,
  uploadAvatar,
  getCrew,
  addCrewMember,
  removeCrewMember
} from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.post("/me/avatar", requireAuth, uploadAvatar);
router.get("/me/crew", requireAuth, getCrew);
router.post("/me/crew", requireAuth, addCrewMember);
router.delete("/me/crew/:id", requireAuth, removeCrewMember);

export default router;
