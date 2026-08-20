import crypto from "node:crypto";
import { User } from "../models/User.js";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
} from "../services/cloudinaryService.js";

/** Shape a user for the client (never leak hashes/tokens). */
function publicUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    username: user.username,
    displayName: user.displayName || user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    pirateTitle: user.pirateTitle,
    bounty: user.bounty,
    avatar: user.avatar || null,
    anniversary: user.anniversary || null
  };
}

function genInviteCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).populate("partner");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      user: publicUser(user),
      partner: user.partner ? publicUser(user.partner) : null,
      crewMembers: user.crewMembers || []
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, displayName, pirateTitle, anniversary } = req.body;

    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: "That name is already taken" });
      user.username = username;
    }
    if (displayName !== undefined) user.displayName = displayName;
    if (pirateTitle !== undefined) user.pirateTitle = pirateTitle;
    if (anniversary !== undefined) user.anniversary = anniversary ? new Date(anniversary) : undefined;

    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ message: "Avatars are unavailable — Cloudinary isn't configured." });
    }
    if (!req.file) return res.status(400).json({ message: "No image provided" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await uploadToCloudinary(req.file.buffer, "avatars", "image");
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId, "image").catch(() => {});
    }
    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save();
    return res.json({ avatar: user.avatar });
  } catch (error) {
    return next(error);
  }
}

// ── Partner pairing ──────────────────────────────────────
export async function createPairInvite(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.partner) return res.status(409).json({ message: "You're already paired with your partner" });

    let code = genInviteCode();
    // Extremely unlikely collision, but be safe.
    while (await User.findOne({ partnerInviteCode: code })) code = genInviteCode();
    user.partnerInviteCode = code;
    await user.save();
    return res.json({ code });
  } catch (error) {
    return next(error);
  }
}

export async function acceptPairInvite(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "An invite code is required" });

    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.partner) return res.status(409).json({ message: "You're already paired" });

    const inviter = await User.findOne({ partnerInviteCode: code.toUpperCase() });
    if (!inviter) return res.status(404).json({ message: "That invite code isn't valid" });
    if (String(inviter._id) === String(me._id)) {
      return res.status(400).json({ message: "You can't pair with yourself" });
    }
    if (inviter.partner) return res.status(409).json({ message: "That code has already been used" });

    me.partner = inviter._id;
    inviter.partner = me._id;
    inviter.partnerInviteCode = undefined; // consume the code
    await Promise.all([me.save(), inviter.save()]);

    return res.json({ partner: publicUser(inviter) });
  } catch (error) {
    return next(error);
  }
}

export async function unpair(req, res, next) {
  try {
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.partner) {
      await User.findByIdAndUpdate(me.partner, { $set: { partner: null } });
    }
    me.partner = null;
    await me.save();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

// ── Crew (saved contacts) ────────────────────────────────
export async function getCrew(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ crewMembers: user?.crewMembers || [] });
  } catch (error) {
    return next(error);
  }
}

export async function addCrewMember(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = user.crewMembers.find(
      (m) => m.email?.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return res.status(400).json({ message: "This nakama is already in your crew address book." });
    }

    user.crewMembers.push({ name: name?.trim() || "", email: normalizedEmail });
    await user.save();
    return res.status(201).json({ crewMembers: user.crewMembers });
  } catch (error) {
    return next(error);
  }
}

export async function removeCrewMember(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    user.crewMembers = user.crewMembers.filter((m) => String(m._id) !== req.params.id);
    await user.save();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
