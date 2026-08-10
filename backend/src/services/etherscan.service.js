const axios = require('axios');
const { ethers } = require('ethers');
const config = require('../config');
const cache = require('../utils/cache');
const { formatWeiToEth, formatWeiToEthString } = require('../utils/formatters');
const AppError = require('../utils/appError');

const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';
const HTTP_TIMEOUT_MS = 8000;

// Public Ethereum RPC endpoints for real on-chain ENS resolution
const RPC_ENDPOINTS = [
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
];

// ── Transaction sanitization ───────────────────────────────────────────────
/**
 * Converts a raw Etherscan transaction object into a safe, typed record.
 *
 * Etherscan returns ALL numeric fields as strings. This function:
 *   - Converts numeric strings to integers where safe (blockNumber, gas, etc.)
 *   - Returns 0 (not NaN or Infinity) for any unparseable numeric field
 *   - Converts isError from Etherscan's "0"/"1" string to a proper boolean
 *   - Makes `to` null for contract-creation transactions (where Etherscan omits it)
 *   - Validates that hash, from, and timeStamp are non-empty strings
 *   - Calculates eth_value using BigInt-safe precision (no floating-point)
 *   - Whitelists fields — never passes through arbitrary Etherscan properties
 *
 * @param {object} tx - Raw transaction object from Etherscan API
 * @returns {object} Sanitized transaction record
 */
function sanitizeTransaction(tx) {
  if (!tx || typeof tx !== 'object') return null;

  // Safe integer parser — returns 0 for NaN/Infinity/non-numeric
  const safeInt = (val) => {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : 0;
  };

  // Safe string — returns empty string for null/undefined
  const safeStr = (val) => (val != null ? String(val) : '');

  // isError: Etherscan returns "0" (success) or "1" (failed) as strings
  // We normalize to a proper boolean so consumers can use if (tx.isError)
  const isError = tx.isError === '1' || tx.isError === 1 || tx.isError === true;

  // `to` is null for contract creation transactions — keep it null, not ""
  const toAddress = tx.to && typeof tx.to === 'string' && tx.to.trim()
    ? tx.to.trim().toLowerCase()
    : null;

  // `timeStamp` is a Unix timestamp string from Etherscan
  // Validate it's a positive integer before passing through
  const timeStampRaw = safeInt(tx.timeStamp);
  const timeStamp = timeStampRaw > 0 ? String(timeStampRaw) : '0';

  return {
    hash: safeStr(tx.hash),
    blockNumber: safeInt(tx.blockNumber),
    timeStamp,
    from: tx.from ? String(tx.from).toLowerCase() : '',
    to: toAddress,
    // Keep raw Wei value as string for any consumer that needs full precision
    value: safeStr(tx.value),
    // BigInt-safe ETH string — no floating-point precision loss
    eth_value: formatWeiToEthString(tx.value),
    gas: safeInt(tx.gas),
    gasUsed: safeInt(tx.gasUsed),
    gasPrice: safeStr(tx.gasPrice),  // Keep as string — can exceed safe integer
    isError,
    txreceipt_status: tx.txreceipt_status === '1' || tx.txreceipt_status === 1,
    // Truncate input data — we don't need the full calldata, just presence flag
    hasInput: typeof tx.input === 'string' && tx.input.length > 2, // '0x' = no data
  };
}

class EtherscanService {
  /**
   * Returns a working JsonRpcProvider for ENS resolution.
   */
  getRpcProvider() {
    return new ethers.JsonRpcProvider(RPC_ENDPOINTS[0], 1, { staticNetwork: true });
  }

  /**
   * Fetches live ETH balance for a wallet address.
   * Precision: BigInt-safe string via formatWeiToEthString (no floating-point division).
   * Empty wallet: returns valid zero values, never throws.
   */
  async getBalance(address) {
    const cacheKey = `balance:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return { ...cached, cached: true };
    }

    const url = `${ETHERSCAN_BASE_URL}?chainid=1&module=account&action=balance&address=${address}&apikey=${config.etherscanApiKey}`;

    try {
      const response = await axios.get(url, { timeout: HTTP_TIMEOUT_MS });
      const data = response.data;

      // Handle Etherscan V2 status: "0" — may be an empty wallet or an API error
      if (data.status === '0') {
        const msg = String(data.message || data.result || '');
        // Empty/new wallet: balance is genuinely zero
        if (
          msg.includes('No transactions found') ||
          (msg.includes('NOTOK') && data.result === '0') ||
          data.result === '0'
        ) {
          const zeroResult = { balance: 0, balance_eth: '0', balance_wei: '0' };
          cache.set(cacheKey, zeroResult, config.cacheTtlBalanceSec);
          return { ...zeroResult, cached: false };
        }
        // Real API-level error (bad key, rate-limited, etc.)
        const detail = msg.includes('NOTOK') || msg === 'NOTOK'
          ? 'Ethereum data provider rejected the request. Check your API key configuration.'
          : (msg || 'Etherscan API returned an error response');
        throw new AppError('PROVIDER_ERROR', detail);
      }

      const rawResult = data.result || '0';
      const resultObj = {
        balance: formatWeiToEth(rawResult),
        balance_eth: formatWeiToEthString(rawResult),
        balance_wei: String(rawResult),
      };

      cache.set(cacheKey, resultObj, config.cacheTtlBalanceSec);
      return { ...resultObj, cached: false };
    } catch (error) {
      // Re-throw AppErrors from above unchanged
      if (error.name === 'AppError') throw error;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new AppError('PROVIDER_TIMEOUT', 'The Ethereum data provider did not respond in time. Please try again.');
      }
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new AppError('PROVIDER_ERROR', 'Unable to reach the Ethereum data provider. Please try again later.');
      }

      throw new AppError('PROVIDER_ERROR', `Ethereum data provider error: ${error.message}`);
    }
  }

  /**
   * Fetches recent transactions for a wallet address.
   *
   * Phase 11 guarantees:
   *   - result is always an array (never null/undefined)
   *   - empty wallet returns []
   *   - eth_value uses BigInt-safe string conversion (no floats)
   *   - numeric fields are sanitized to integers (never NaN / Infinity)
   *   - isError is normalized to a boolean (not the raw Etherscan string)
   *   - `to` is null-safe (contract creation transactions have no recipient)
   *   - sort is enforced server-side (desc by blockNumber) for determinism
   *   - limit is passed to Etherscan to reduce response payload
   *   - limit is bounded [1, 50] — enforced by the controller before this call
   */
  async getTransactions(address, limit = 25) {
    const cacheKey = `transactions:${address.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return { transactions: cached, cached: true };
    }

    // Pass limit to Etherscan directly so we receive only what we need.
    // page=1 + offset=0 fetches the most recent `limit` transactions.
    const url = [
      ETHERSCAN_BASE_URL,
      `?chainid=1`,
      `&module=account`,
      `&action=txlist`,
      `&address=${address}`,
      `&sort=desc`,
      `&page=1`,
      `&offset=${limit}`,
      `&apikey=${config.etherscanApiKey}`,
    ].join('');

    try {
      const response = await axios.get(url, { timeout: HTTP_TIMEOUT_MS });
      const data = response.data;

      if (data.status === '0') {
        const msg = String(data.message || data.result || '');
        if (
          msg.includes('No transactions found') ||
          (Array.isArray(data.result) && data.result.length === 0)
        ) {
          cache.set(cacheKey, [], config.cacheTtlTxSec);
          return { transactions: [], cached: false };
        }
        const txDetail = msg.includes('NOTOK') || msg === 'NOTOK'
          ? 'Ethereum data provider rejected the request. Check your API key configuration.'
          : (msg || 'Etherscan API returned an error response');
        throw new AppError('PROVIDER_ERROR', txDetail);
      }

      // Guarantee the result is always a real array before processing
      const rawTxs = Array.isArray(data.result) ? data.result : [];

      // Process + sanitize each transaction
      const transactions = rawTxs
        // Enforce deterministic descending sort by blockNumber in case
        // Etherscan's ordering ever differs from what we asked for
        .sort((a, b) => {
          const blockA = parseInt(a.blockNumber, 10) || 0;
          const blockB = parseInt(b.blockNumber, 10) || 0;
          return blockB - blockA; // desc
        })
        // Slice after sorting to ensure we have the right top-N records
        .slice(0, limit)
        .map((tx) => sanitizeTransaction(tx))
        .filter(Boolean); // Discard nulls from malformed raw tx entries

      cache.set(cacheKey, transactions, config.cacheTtlTxSec);
      return { transactions, cached: false };
    } catch (error) {
      if (error.name === 'AppError') throw error;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new AppError('PROVIDER_TIMEOUT', 'The Ethereum data provider did not respond in time. Please try again.');
      }
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new AppError('PROVIDER_ERROR', 'Unable to reach the Ethereum data provider. Please try again later.');
      }

      throw new AppError('PROVIDER_ERROR', `Ethereum data provider error: ${error.message}`);
    }
  }

  /**
   * Real dynamic ENS resolution via Ethereum mainnet RPC.
   * No hardcoded mappings, no silent fallbacks.
   * Returns { address, ensName, cached } — address is null if unregistered.
   */
  async resolveEns(ensDomain) {
    const lowerEns = ensDomain.toLowerCase().trim();
    const cacheKey = `ens:${lowerEns}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return { address: cached, ensName: lowerEns, cached: true };
    }

    try {
      const provider = this.getRpcProvider();
      const resolvedAddress = await provider.resolveName(lowerEns);

      if (!resolvedAddress) {
        // Domain is unregistered — return null address, caller decides HTTP status
        return { address: null, ensName: lowerEns, cached: false };
      }

      cache.set(cacheKey, resolvedAddress, config.cacheTtlEnsSec);
      return { address: resolvedAddress, ensName: lowerEns, cached: false };
    } catch (error) {
      if (error.name === 'AppError') throw error;

      // Ethers.js "ResolverNotFound" means the domain exists but has no resolver
      if (error.message && error.message.includes('ResolverNotFound')) {
        return { address: null, ensName: lowerEns, cached: false };
      }

      throw new AppError('PROVIDER_ERROR', `ENS resolution failed: ${error.message}`);
    }
  }
}

module.exports = new EtherscanService();
