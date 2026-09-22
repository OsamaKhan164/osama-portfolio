/**
 * 404 handler — placed after all routes so any unmatched path lands here.
 */
export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Central error handler — every controller in later phases can just
 * `next(error)` and this formats a consistent JSON response.
 * Never leaks stack traces outside development.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
