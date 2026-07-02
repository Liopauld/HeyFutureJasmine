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
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      required: true
    },
    originalName: String,
    fileSize: Number,
    format: String
  },
  { timestamps: true }
);

export const Attachment = mongoose.model("Attachment", AttachmentSchema);
