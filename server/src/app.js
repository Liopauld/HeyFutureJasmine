import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import letterRoutes from "./routes/letters.js";
import uploadRoutes from "./routes/uploads.js";
import userRoutes from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);

// Dev-only helpers (force-deliver / trigger sweep) — never in production.
if (process.env.ENABLE_DEV_ROUTES === "true" && process.env.NODE_ENV !== "production") {
  const { default: devRoutes } = await import("./routes/dev.js");
  app.use("/api/dev", devRoutes);
  console.log("Dev routes enabled at /api/dev");
}

app.use(errorHandler);

export default app;
