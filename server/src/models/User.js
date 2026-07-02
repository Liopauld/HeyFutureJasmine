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
      default: "Rookie Pirate"
    },
    bounty: {
      type: Number,
      default: 0
    },
    avatar: {
      url: String,
      publicId: String
    },
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
