const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./src/config');
const walletRoutes = require('./src/routes/wallet.routes');
const errorHandler = require('./src/middleware/errorHandler');

// ── Process-level safety net ───────────────────────────────────────────────
// These catch errors that escape all Express middleware (e.g. in sync code
// outside request handlers, or unhandled promise rejections in callbacks).
// They log the full detail server-side but never leak it to clients.
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  // Give the logger time to flush, then exit so the process manager restarts cleanly.
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Do NOT exit here — unhandled rejections in non-request async paths should
  // not kill the server; log and continue.
});


const app = express();

// Trust the first proxy hop (Render, Heroku, etc.) so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of the internal proxy IP.
app.set('trust proxy', 1);

// Security Middleware
// Helmet sets various HTTP headers for security (HSTS, NoSniff, XSS filter, etc.)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // needed if API is called from another domain
}));

// CORS Configuration - Phase 12 Security
// Restrict to allowed origins instead of '*'
app.use(cors({
  origin: (origin, callback) => {
    // In development or if explicitly allowed (e.g., no origin like curl/server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.allowedOrigins;
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'OPTIONS'], // We only have GET endpoints right now
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request size limits to prevent payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Phase 15 - Lightweight Root Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', walletRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server (only when run directly as standalone script)
if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(`🚀 ETH Wallet Tracker API running on http://localhost:${config.port} [${config.nodeEnv}]`);
  });

  // Graceful Shutdown
  function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
