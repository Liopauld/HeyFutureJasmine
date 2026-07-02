import rateLimit from "express-rate-limit";

export const letterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many letters sealed. Try again later."
});

export const noticeboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  message: "Too many requests. Chart a slower course."
});
