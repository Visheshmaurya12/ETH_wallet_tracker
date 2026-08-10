const express = require('express');
const walletController = require('../controllers/wallet.controller');
const apiLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Health check
router.get('/health', walletController.getHealth);

// Wallet Endpoints
router.get('/balance', (req, res, next) => walletController.getBalance(req, res, next));
router.get('/transactions', (req, res, next) => walletController.getTransactions(req, res, next));
router.get('/ens/resolve', (req, res, next) => walletController.resolveEns(req, res, next));

module.exports = router;
