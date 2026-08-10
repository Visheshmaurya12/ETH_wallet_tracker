const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * 100 requests per 15-minute window per IP address
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

module.exports = apiLimiter;
