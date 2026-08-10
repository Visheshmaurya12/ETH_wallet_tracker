/**
 * Production API Service for Ethereum Wallet Tracker Frontend.
 *
 * All backend responses now follow the Phase 6 contract:
 *   Success: { success: true,  data: { ... } }
 *   Error:   { success: false, error: { code: "...", message: "..." } }
 *
 * This service unwraps `data` so callers receive the payload object directly,
 * and extracts the user-facing message from structured errors.
 */

const API_BASE_URL = '/api';

class ApiService {
  /**
   * Universal fetch helper with error handling & AbortController support.
   * Returns the unwrapped `data` payload on success.
   * Throws with the user-facing `error.message` on failure.
   */
  async request(endpoint, options = {}) {
    const { signal, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    // Parse JSON once; tolerate malformed responses gracefully
    const body = await response.json().catch(() => null);

    if (!response.ok || (body && body.success === false)) {
      // Prefer the structured error message, fall back to status text
      const message =
        (body && body.error && body.error.message) ||
        (body && typeof body.error === 'string' && body.error) ||
        `Request failed with status ${response.status}`;
      const err = new Error(message);
      err.code = body?.error?.code ?? null;
      err.statusCode = response.status;
      throw err;
    }

    // Unwrap the `data` envelope — callers receive the payload directly
    return body?.data ?? body;
  }

  /**
   * Fetches ETH balance for a wallet address.
   * Returns: { address, balance, balance_eth, balance_wei, cached }
   */
  async getBalance(address, signal) {
    return this.request(`/balance?address=${encodeURIComponent(address)}`, { signal });
  }

  /**
   * Fetches recent Ethereum transactions for a wallet address.
   * Returns: { address, transactions, cached }
   */
  async getTransactions(address, limit = 20, signal) {
    return this.request(`/transactions?address=${encodeURIComponent(address)}&limit=${limit}`, { signal });
  }

  /**
   * Resolves an ENS domain (.eth) to an Ethereum address via backend API.
   * Returns: { ensName, address, cached }
   * Throws with code "ENS_NOT_FOUND" (HTTP 404) for unregistered domains.
   */
  async resolveEns(ensName, signal) {
    return this.request(`/ens/resolve?name=${encodeURIComponent(ensName)}`, { signal });
  }
}

export const api = new ApiService();
export default api;
