const AppError = require('../utils/appError');

/**
 * Global Express Error Handling Middleware.
 *
 * Contract (Phase 6 / Phase 7):
 *   Success: { success: true, data: { ... } }
 *   Error:   { success: false, error: { code: "...", message: "..." } }
 *
 * Rules:
 *   - Operational (AppError) errors use their own statusCode and code.
 *   - Unexpected bugs return HTTP 500 with a safe generic message.
 *   - Stack traces, filesystem paths, and API keys NEVER reach the client.
 *   - In development, safe debug detail is appended under `_debug` key.
 */

/**
 * Scrubs sensitive internal detail from an error message string before
 * it could be sent to the client, even accidentally.
 *
 * Removes:
 *   - Windows/POSIX absolute filesystem paths  (C:\..., /home/..., D:\...)
 *   - apikey= query parameters
 *   - Any substring that looks like a 32-64 char hex secret (API key shape)
 */
function scrubSensitive(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    // Windows absolute paths:  C:\Users\...\something.js
    .replace(/[A-Za-z]:\\[^\s,'"]+/g, '[path]')
    // POSIX absolute paths:    /home/user/project/file.js
    .replace(/\/(?:home|usr|var|etc|app|opt|root|srv|tmp)\/[^\s,'"]+/g, '[path]')
    // Etherscan apikey param
    .replace(/apikey=[^&\s]+/gi, 'apikey=[redacted]')
    // 32+ char hex secrets (API key shape)
    .replace(/\b[0-9A-Fa-f]{32,}\b/g, '[redacted]');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── Operational errors (AppError) ────────────────────────────────────────
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message, // Already user-facing, written by the service layer
      },
    });
  }

  // ── Unexpected / programming errors ──────────────────────────────────────
  // Log full detail server-side (stack trace, raw message) for debugging.
  // NEVER send raw details to the client — they may contain paths or secrets.
  console.error(
    `[UNHANDLED ERROR] ${req.method} ${req.originalUrl}:`,
    scrubSensitive(err?.message ?? String(err)),
    err?.stack ?? ''
  );

  const responseBody = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  };

  // In development, append a scrubbed hint (no stack, no paths, no secrets)
  if (process.env.NODE_ENV === 'development') {
    responseBody.error._debug = scrubSensitive(err?.message ?? 'Unknown error');
  }

  return res.status(500).json(responseBody);
}

module.exports = errorHandler;
