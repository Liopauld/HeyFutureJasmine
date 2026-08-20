import mongoose from "mongoose";

const LetterSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Who this treasure is for:
    //   self    → the sender's own future self
    //   partner → the sender's paired partner
    //   us      → both of you, opened together
    letterType: {
      type: String,
      enum: ["self", "partner", "us", "other"],
      default: "self"
    },
    // Kept in sync with letterType for backwards compatibility.
    isSelfLetter: {
      type: Boolean,
      default: true
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
    // A song to play on opening (Spotify / YouTube / Apple Music link).
    song: {
      provider: {
        type: String,
        enum: ["spotify", "youtube", "apple", "other"]
      },
      url: String,
      title: String,
      artist: String
    },
    // A reply written back across time to another (delivered) letter.
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Letter",
      default: null
    },
    // Timing
    deliveryDate: {
      type: Date,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deliveredAt: Date,
    // First time the recipient opened the delivered chest (for the reveal ceremony).
    openedAt: Date,
    status: {
      type: String,
      enum: ["sealed", "sailing", "delivered", "failed"],
      default: "sealed"
    },
    unlockToken: {
      type: String,
      unique: true,
      sparse: true
    },
    jobId: String,
    capsuleTheme: {
      type: String,
      enum: ["default", "gold", "scroll", "davy_jones", "alabasta", "skypiea"],
      default: "default"
    },
    visibility: {
      type: String,
      enum: ["private", "public_anonymous", "public_named"],
      default: "private"
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// The delivery sweep queries by (deliveryDate, status) — keep it indexed.
LetterSchema.index({ deliveryDate: 1, status: 1 });
LetterSchema.index({ sender: 1 });
LetterSchema.index({ recipientEmail: 1 });
LetterSchema.index({ visibility: 1, status: 1, deliveredAt: -1 });

export const Letter = mongoose.model("Letter", LetterSchema);
