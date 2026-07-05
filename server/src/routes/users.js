import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  updateMe,
  uploadAvatar,
  createPairInvite,
  acceptPairInvite,
  unpair,
  getCrew,
  addCrewMember,
  removeCrewMember
} from "../controllers/userController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.post("/me/avatar", requireAuth, upload.single("file"), uploadAvatar);

// Partner pairing (a crew of two)
router.post("/me/pair/invite", requireAuth, createPairInvite);
router.post("/me/pair/accept", requireAuth, acceptPairInvite);
router.delete("/me/pair", requireAuth, unpair);

// Crew (saved contacts)
router.get("/me/crew", requireAuth, getCrew);
router.post("/me/crew", requireAuth, addCrewMember);
router.delete("/me/crew/:id", requireAuth, removeCrewMember);

export default router;
