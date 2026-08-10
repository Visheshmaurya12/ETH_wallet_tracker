/**
 * Input Validation Utilities — Backend Authoritative Layer
 *
 * These functions are the single source of truth for all input validation.
 * The frontend runs the same logical rules for UX feedback, but the backend
 * ALWAYS re-validates independently — never trusting frontend-passed data.
 */

// ── Address validation ──────────────────────────────────────────────────────

/**
 * Validates a 42-character hex-encoded Ethereum wallet address (0x...).
 * Accepts mixed case (EIP-55 checksummed or lowercase) — Etherscan accepts both.
 * Does NOT accept empty strings, whitespace-only, or non-hex characters.
 *
 * @param {unknown} address
 * @returns {boolean}
 */
function isValidEthAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Normalizes an Ethereum address to lowercase for consistent cache keys and
 * comparisons. Does not validate — call isValidEthAddress first.
 *
 * @param {string} address
 * @returns {string}
 */
function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

// ── ENS validation ──────────────────────────────────────────────────────────

/**
 * Validates an ENS domain name.
 *
 * Accepts:
 *   - Simple names:     vitalik.eth
 *   - Subdomains:       my.wallet.eth, sub.name.eth
 *   - Hyphens:          my-wallet.eth
 *   - Numbers:          wallet123.eth
 *   - Underscore:       my_wallet.eth  (valid in ENS)
 *
 * Rejects:
 *   - No .eth suffix
 *   - Empty labels:     .eth, ..eth, foo..eth
 *   - Labels > 63 chars (DNS limit per label)
 *   - Names > 255 chars (DNS total limit)
 *
 * @param {unknown} name
 * @returns {boolean}
 */
function isValidEnsName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim().toLowerCase();

  // Must end with .eth
  if (!trimmed.endsWith('.eth')) return false;

  // Total length guard (255 char DNS limit)
  if (trimmed.length > 255) return false;

  // Split into labels and validate each one
  const labels = trimmed.split('.');
  // Must have at least one label before .eth  (e.g. ["vitalik", "eth"])
  if (labels.length < 2) return false;

  for (const label of labels) {
    // No empty labels (catches leading/trailing dots, double dots)
    if (label.length === 0) return false;
    // Each label: max 63 chars, only alphanumeric, hyphens, underscores
    if (label.length > 63) return false;
    if (!/^[a-z0-9_-]+$/.test(label)) return false;
  }

  return true;
}

// ── Transaction limit validation ────────────────────────────────────────────

/** Absolute minimum number of transactions a client may request. */
const TX_LIMIT_MIN = 1;
/** Absolute maximum — prevents clients from requesting thousands of transactions. */
const TX_LIMIT_MAX = 50;
/** Default when client provides no limit or an invalid one. */
const TX_LIMIT_DEFAULT = 25;

/**
 * Parses and clamps a client-supplied transaction limit to a safe integer.
 * Accepts string or number input (query params arrive as strings).
 * Returns TX_LIMIT_DEFAULT for missing, non-numeric, or out-of-range values.
 *
 * @param {unknown} rawLimit - The raw query parameter value.
 * @returns {number} A safe integer in [TX_LIMIT_MIN, TX_LIMIT_MAX].
 */
function parseTransactionLimit(rawLimit) {
  const parsed = parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return TX_LIMIT_DEFAULT;
  return Math.min(Math.max(parsed, TX_LIMIT_MIN), TX_LIMIT_MAX);
}

// ── Wei / ETH conversion ─────────────────────────────────────────────────────

/**
 * Converts a 256-bit Wei integer (string, BigInt, or number) to a safe,
 * human-readable ETH string preserving full 18-decimal precision.
 *
 * Rules:
 *   - Never uses JavaScript floating-point division (no balanceWei / 1e18).
 *   - Never returns NaN, Infinity, or undefined.
 *   - Returns "0" for any falsy, non-numeric, or unparseable input.
 *   - Trims trailing fractional zeros for readability.
 *   - Handles negative Wei (rare but valid in internal accounting).
 *
 * Examples:
 *   "1000000000000000000"  → "1"
 *   "12482000000000000000" → "12.482"
 *   "1"                    → "0.000000000000000001"
 *   "0"                    → "0"
 *   ""                     → "0"
 *   null                   → "0"
 *
 * @param {string|bigint|number|null|undefined} weiInput
 * @returns {string}
 */
function formatWeiToEthString(weiInput) {
  if (weiInput === null || weiInput === undefined || weiInput === '') return '0';

  const weiStr = String(weiInput).trim();

  // Fast-path for the common zero case and Etherscan sentinel strings
  if (
    weiStr === '0' ||
    weiStr === '' ||
    weiStr === 'null' ||
    weiStr === 'No transactions found'
  ) return '0';

  try {
    const weiBig = BigInt(weiStr);
    const negative = weiBig < 0n;
    const absWei = negative ? -weiBig : weiBig;

    const ethInt = absWei / 1_000_000_000_000_000_000n;
    const ethDec = absWei % 1_000_000_000_000_000_000n;

    if (ethDec === 0n) {
      return negative ? `-${ethInt.toString()}` : ethInt.toString();
    }

    // Pad to 18 decimal places, then strip trailing zeros for cleaner display
    const decStr = ethDec.toString().padStart(18, '0').replace(/0+$/, '');
    const fullStr = `${ethInt.toString()}.${decStr}`;
    return negative ? `-${fullStr}` : fullStr;
  } catch {
    // BigInt() throws for non-integer strings — return safe fallback
    return '0';
  }
}

/**
 * Converts Wei to an ETH number for components that require a numeric value.
 * Guaranteed to never return NaN or Infinity — falls back to 0.
 *
 * Prefer formatWeiToEthString() wherever a string representation is acceptable.
 *
 * @param {string|bigint|number|null|undefined} weiInput
 * @returns {number}
 */
function formatWeiToEth(weiInput) {
  const ethStr = formatWeiToEthString(weiInput);
  const val = parseFloat(ethStr);
  return Number.isFinite(val) ? val : 0;
}

module.exports = {
  isValidEthAddress,
  normalizeAddress,
  isValidEnsName,
  parseTransactionLimit,
  TX_LIMIT_MIN,
  TX_LIMIT_MAX,
  TX_LIMIT_DEFAULT,
  formatWeiToEthString,
  formatWeiToEth,
};
