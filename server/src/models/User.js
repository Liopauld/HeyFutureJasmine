import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    // How the user wants to be shown in the app / on letters (defaults to username).
    displayName: {
      type: String,
      trim: true,
      maxlength: 40
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    pirateTitle: {
      type: String,
      default: "Landlubber"
    },
    bounty: {
      type: Number,
      default: 0
    },
    avatar: {
      url: String,
      publicId: String
    },
    // ── Partner pairing (a crew of two) ──────────────────
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Single-use code another account redeems to pair with this user.
    partnerInviteCode: {
      type: String,
      unique: true,
      sparse: true
    },
    // Shared date used for "our anniversary" delivery presets.
    anniversary: Date,

    crewMembers: [
      {
        name: String,
        email: String
      }
    ],
    refreshTokens: [String],
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
