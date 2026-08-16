require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  cacheTtlBalanceSec: 30,      // 30 seconds TTL for balance queries
  cacheTtlTxSec: 15,           // 15 seconds TTL for transaction feeds
  cacheTtlEnsSec: 300,         // 5 minutes TTL for ENS resolutions
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173 http://127.0.0.1:5173').split(' ').filter(Boolean),
};

// Phase 13 - Strict Environment Validation
if (!config.etherscanApiKey || config.etherscanApiKey === 'your_api_key_here' || config.etherscanApiKey === 'your_etherscan_api_key_here') {
  console.warn('\n[WARNING] ETHERSCAN_API_KEY is missing or unconfigured in the environment.');
  console.warn('Please configure a valid API key in Vercel Environment Variables or backend/.env');
  console.warn('You can get a free key at: https://etherscan.io/apis\n');
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    process.exit(1);
  }
}

module.exports = config;
