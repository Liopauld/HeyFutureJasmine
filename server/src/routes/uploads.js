import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { uploadAttachment, deleteAttachment } from "../controllers/uploadController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, upload.single("file"), uploadAttachment);
router.delete("/:id", requireAuth, deleteAttachment);

export default router;
