import multer from "multer";

export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "Files must be 8 MB or smaller." : "Invalid upload. Send one file at a time."
    });
  }
  const status = err.status || 500;
  const message = err.message || "Taken by the Sea...";
  res.status(status).json({ message });
}
