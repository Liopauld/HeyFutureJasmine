import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { publicUser } from "../utils/publicUser.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";

function buildAuthPayload(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    pirateTitle: user.pirateTitle,
    bounty: user.bounty
  };
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    // In production the client and API live on separate Render subdomains, so
    // the cookie is cross-site and must be SameSite=None + Secure to be sent.
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);
    const emailVerificationToken = crypto.randomUUID();
    const user = await User.create({
      username,
      email,
      passwordHash,
      emailVerificationToken
    });

    let verificationEmailSent = false;
    try {
      const result = await sendVerificationEmail(user.email, emailVerificationToken);
      verificationEmailSent = !result.mocked;
    } catch {
      // Keep the created account usable; the signed-in user can retry sending.
    }

    const accessToken = signAccessToken(buildAuthPayload(user));
    const refreshToken = signRefreshToken(buildAuthPayload(user));
    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ user: publicUser(user), partner: null, accessToken, verificationEmailSent });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("partner");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(buildAuthPayload(user));
    const refreshToken = signRefreshToken(buildAuthPayload(user));
    user.refreshTokens = [...(user.refreshTokens || []).slice(-9), refreshToken];
    await user.save();

    setRefreshCookie(res, refreshToken);
    return res.json({ user: publicUser(user), partner: publicUser(user.partner), accessToken });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        await user.save();
      }
    }
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax"
    });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({ refreshTokens: refreshToken }).populate("partner");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = signAccessToken(buildAuthPayload(user));
    return res.json({ accessToken, user: publicUser(user), partner: publicUser(user.partner) });
  } catch (error) {
    return next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Verification token not found" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return res.json({ message: "Email verified" });
  } catch (error) {
    return next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified) return res.json({ message: "Your email is already verified" });
    // Reuse the token so retrying does not invalidate an email already in flight.
    if (!user.emailVerificationToken) {
      user.emailVerificationToken = crypto.randomUUID();
      await user.save();
    }
    const result = await sendVerificationEmail(user.email, user.emailVerificationToken);
    if (result.mocked) return res.status(503).json({ message: "Email sending is not configured. Please try again later." });
    return res.json({ message: "Verification email sent. Check your inbox." });
  } catch (error) { return next(error); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If that account exists, a reset link was sent" });
    }

    const token = crypto.randomUUID();
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user.email, token);

    return res.json({ message: "Password reset email sent" });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(404).json({ message: "Reset token invalid or expired" });
    }

    user.passwordHash = await hashPassword(password);
    user.refreshTokens = [];
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json({ message: "Password updated" });
  } catch (error) {
    return next(error);
  }
}
