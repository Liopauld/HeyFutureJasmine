import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { uploadAttachment, deleteAttachment } from "../controllers/uploadController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 8, parts: 9, fieldSize: 16 * 1024 }
});

router.post("/", requireAuth, upload.single("file"), uploadAttachment);
router.delete("/:id", requireAuth, deleteAttachment);

export default router;
