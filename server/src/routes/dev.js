import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Letter } from "../models/Letter.js";
import { deliverLetter } from "../services/letterService.js";
import { runSweepOnce } from "../jobs/deliverySweep.js";

// Only mounted when ENABLE_DEV_ROUTES=true and not in production (see app.js).
const router = Router();

// Force-deliver one of your own letters right now (to test the reveal).
router.post("/deliver/:id", requireAuth, async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });
    if (String(letter.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the sender can force delivery" });
    }
    const delivered = await deliverLetter(letter._id);
    return res.json({ delivered });
  } catch (error) {
    return next(error);
  }
});

// Manually trigger the reliability sweep.
router.post("/sweep", requireAuth, async (_req, res, next) => {
  try {
    const delivered = await runSweepOnce();
    return res.json({ delivered });
  } catch (error) {
    return next(error);
  }
});

export default router;
