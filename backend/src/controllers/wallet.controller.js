const etherscanService = require('../services/etherscan.service');
const {
  isValidEthAddress,
  normalizeAddress,
  isValidEnsName,
  parseTransactionLimit,
} = require('../utils/formatters');
const AppError = require('../utils/appError');

class WalletController {
  /**
   * GET /api/balance?address=0x...
   *
   * Validates the address independently of the frontend.
   * Normalizes to lowercase before forwarding to the service.
   *
   * Success: { success: true, data: { address, balance, balance_eth, balance_wei, cached } }
   * Error:   { success: false, error: { code, message } }
   */
  async getBalance(req, res, next) {
    try {
      const rawAddress = req.query.address;

      // Backend re-validates — never trusts frontend validation
      if (!rawAddress || typeof rawAddress !== 'string' || !isValidEthAddress(rawAddress)) {
        throw new AppError(
          'INVALID_WALLET_ADDRESS',
          'Invalid Ethereum wallet address. Please provide a valid 42-character address starting with 0x.'
        );
      }

      const address = normalizeAddress(rawAddress);
      const result = await etherscanService.getBalance(address);

      return res.json({
        success: true,
        data: {
          address,
          balance: result.balance,
          balance_eth: result.balance_eth,
          balance_wei: result.balance_wei,
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions?address=0x...&limit=25
   *
   * Validates the address and clamps the limit to [1, 50].
   * limit is parsed through parseTransactionLimit() — never user-controlled raw.
   *
   * Success: { success: true, data: { address, transactions, count, cached } }
   * Error:   { success: false, error: { code, message } }
   */
  async getTransactions(req, res, next) {
    try {
      const rawAddress = req.query.address;

      if (!rawAddress || typeof rawAddress !== 'string' || !isValidEthAddress(rawAddress)) {
        throw new AppError(
          'INVALID_WALLET_ADDRESS',
          'Invalid Ethereum wallet address. Please provide a valid 42-character address starting with 0x.'
        );
      }

      const address = normalizeAddress(rawAddress);
      // parseTransactionLimit clamps to [1, 50] and returns default for bad input
      const limit = parseTransactionLimit(req.query.limit);
      const result = await etherscanService.getTransactions(address, limit);

      return res.json({
        success: true,
        data: {
          address,
          transactions: result.transactions,
          count: result.transactions.length,
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ens/resolve?name=vitalik.eth
   *
   * Validates ENS format (subdomains, label lengths, .eth suffix).
   * Returns 404 for unregistered or unassigned domains.
   *
   * Success: { success: true, data: { ensName, address, cached } }
   * Error:   { success: false, error: { code, message } }  (404 if unregistered)
   */
  async resolveEns(req, res, next) {
    try {
      const rawName = req.query.name;

      if (!rawName || typeof rawName !== 'string' || !isValidEnsName(rawName)) {
        throw new AppError(
          'INVALID_ENS_NAME',
          'Invalid ENS domain name. The domain must end with .eth and contain only letters, numbers, hyphens, or underscores.'
        );
      }

      // Normalize to lowercase before resolution
      const name = rawName.trim().toLowerCase();
      const result = await etherscanService.resolveEns(name);

      if (!result.address) {
        throw new AppError(
          'ENS_NOT_FOUND',
          `Could not resolve ENS domain "${name}". The domain is unregistered or has no address assigned.`
        );
      }

      return res.json({
        success: true,
        data: {
          ensName: result.ensName,
          address: result.address,
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/health
   */
  getHealth(req, res) {
    return res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'ethereum-wallet-tracker-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  }
}

module.exports = new WalletController();
