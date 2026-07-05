import { Attachment } from "../models/Attachment.js";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
} from "../services/cloudinaryService.js";

function classify(mimetype = "") {
  if (mimetype.startsWith("image/")) return { kind: "photo", resourceType: "image" };
  // Cloudinary stores audio under the "video" resource type.
  if (mimetype.startsWith("audio/")) return { kind: "voice", resourceType: "video" };
  return { kind: "file", resourceType: "raw" };
}

export async function uploadAttachment(req, res, next) {
  try {
    if (!isCloudinaryConfigured()) {
      return res
        .status(503)
        .json({ message: "Attachments are unavailable — Cloudinary isn't configured." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { kind, resourceType } = classify(req.file.mimetype);
    const result = await uploadToCloudinary(req.file.buffer, "attachments", resourceType);

    const attachment = await Attachment.create({
      uploader: req.user.id,
      cloudinaryPublicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      kind,
      duration: result.duration,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      format: result.format
    });

    return res.status(201).json({ attachment });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAttachment(req, res, next) {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    if (String(attachment.uploader) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only remove your own attachments" });
    }

    await deleteFromCloudinary(attachment.cloudinaryPublicId, attachment.resourceType);
    await attachment.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
