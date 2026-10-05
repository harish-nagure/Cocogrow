export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: error.message || "Server error" });
}
