import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    letter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Letter"
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    // Cloudinary's resource_type (Cloudinary stores audio under "video").
    resourceType: {
      type: String,
      enum: ["image", "video", "audio", "raw"],
      required: true
    },
    // Logical kind for the UI.
    kind: {
      type: String,
      enum: ["photo", "voice", "file"],
      default: "file"
    },
    // Duration in seconds (for voice notes / audio).
    duration: Number,
    originalName: String,
    fileSize: Number,
    format: String
  },
  { timestamps: true }
);

export const Attachment = mongoose.model("Attachment", AttachmentSchema);
