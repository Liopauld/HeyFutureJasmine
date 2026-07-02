import mongoose from "mongoose";

const LetterSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    recipientName: {
      type: String,
      default: ""
    },
    isSelfLetter: {
      type: Boolean,
      default: true
    },
    subject: {
      type: String,
      default: "A Treasure From Your Past"
    },
    body: {
      type: String,
      required: true,
      maxlength: 50000
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment"
      }
    ],
    deliveryDate: {
      type: Date,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ["sealed", "sailing", "delivered", "failed"],
      default: "sealed"
    },
    visibility: {
      type: String,
      enum: ["private", "public_anonymous", "public_named"],
      default: "private"
    },
    unlockToken: {
      type: String,
      unique: true,
      sparse: true
    },
    jobId: String,
    likes: {
      type: Number,
      default: 0
    },
    capsuleTheme: {
      type: String,
      enum: ["default", "gold", "scroll", "davy_jones", "alabasta", "skypiea"],
      default: "default"
    }
  },
  { timestamps: true }
);

LetterSchema.index({ deliveryDate: 1, status: 1 });
LetterSchema.index({ sender: 1 });
LetterSchema.index({ recipientEmail: 1 });

export const Letter = mongoose.model("Letter", LetterSchema);
