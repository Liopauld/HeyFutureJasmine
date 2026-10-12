import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const verificationLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      message: { message: "Too many verification requests. Please check your inbox or wait." }
    });

// Letter creation: up to 5 per hour (disabled in test mode)
export const letterLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 5,
      message: { message: "Too many letters sealed. Try again later, Captain." }
    });

// Auth endpoints (login / register): 30 attempts per 15 minutes
export const authLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      message: { message: "Too many login attempts. Please rest at port for a short while." }
    });

// Password reset requests: 10 per hour
export const passwordResetLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      message: { message: "Too many password reset requests. Please check your inbox or wait." }
    });

// Public Noticeboard trident salutes (likes): 60 per minute
export const likeLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      limit: 60,
      message: { message: "You're saluting the sea very quickly! Take a breath, Captain." }
    });

