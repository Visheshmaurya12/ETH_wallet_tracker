/**
 * Typed application error for expected, operational failures.
 *
 * Use this instead of plain `new Error()` whenever the error type is known
 * (bad input, provider failure, not found, etc.) so that the global error
 * handler can produce correct HTTP status codes and structured error codes
 * without fragile string-matching.
 *
 * Error code → default HTTP status mapping:
 *   INVALID_WALLET_ADDRESS  400
 *   INVALID_ENS_NAME        400
 *   ENS_NOT_FOUND           404
 *   WALLET_NOT_FOUND        404
 *   PROVIDER_TIMEOUT        502
 *   PROVIDER_ERROR          502
 *   INTERNAL_ERROR          500
 */

const STATUS_MAP = {
  INVALID_WALLET_ADDRESS: 400,
  INVALID_ENS_NAME: 400,
  ENS_NOT_FOUND: 404,
  WALLET_NOT_FOUND: 404,
  PROVIDER_TIMEOUT: 502,
  PROVIDER_ERROR: 502,
  INTERNAL_ERROR: 500,
};

class AppError extends Error {
  /**
   * @param {string} code   - Machine-readable error code (key from STATUS_MAP).
   * @param {string} message - Human-readable description sent to the client.
   * @param {number} [statusCode] - Override HTTP status if needed.
   */
  constructor(code, message, statusCode) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode ?? STATUS_MAP[code] ?? 500;
    this.isOperational = true; // Distinguishes expected errors from bugs

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

module.exports = AppError;
