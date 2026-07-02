export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Taken by the Sea...";
  res.status(status).json({ message });
}
