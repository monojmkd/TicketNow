module.exports = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  // Always log the full error server-side so nothing is silently swallowed
  console.error(`[Error] ${req.method} ${req.path}`, err);

  const status = err.status || err.statusCode || 500;

  // For server errors (5xx), return a generic message so we never leak
  // stack traces or internal details to the client.
  // For client errors (4xx), the err.message is safe to expose.
  const message =
    status >= 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  res.status(status).json({ message });
};
