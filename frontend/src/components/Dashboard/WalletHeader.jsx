import React, { useState } from 'react';
import './WalletHeader.css';

// Deterministic Identicon generator
function Identicon({ address, size = 44 }) {
  if (!address || address.length < 10) return null;
  const hash = address.slice(2, 12);
  const color1 = `#${hash.slice(0, 6)}`;
  const color2 = `#${hash.slice(4, 10)}`;
  const color3 = `#${hash.slice(2, 8)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className="wallet-identicon" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill={color1} opacity="0.88" />
      <circle cx="22" cy="22" r="14" fill={color2} opacity="0.9" />
      <rect x="13" y="13" width="18" height="18" rx="5" fill={color3} opacity="0.85" />
    </svg>
  );
}

export default function WalletHeader({
  address,
  ensName,
  balance,
  onRefresh,
  onTrackAnother,
  loading,
}) {
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const primaryDisplay = ensName || address;
  const ethBalanceDisplay = balance !== null && balance !== undefined ? String(balance) : '0';

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Ethereum Wallet Analytics',
        text: `Check out Ethereum wallet analytics for ${primaryDisplay}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="wallet-header-card">
      {/* Live Region for Screen Reader Feedback */}
      <div className="sr-only" aria-live="polite" role="status">
        {copied ? 'Wallet address copied to clipboard' : ''}
        {shared ? 'Wallet dashboard link copied to clipboard' : ''}
      </div>

      <div className="wh-top-bar">
        {/* Identity block */}
        <div className="wh-identity">
          <Identicon address={address} size={44} />
          <div className="wh-identity-meta">
            <div className="wh-title-row">
              <span className="wh-type-label">Wallet</span>
              <h2 className="wh-addr-title" title={address}>
                {ensName ? ensName : truncateAddress(address)}
              </h2>
              <span className="wh-net-badge" aria-label="Network: Ethereum Mainnet">
                <span className="wh-dot" aria-hidden="true" /> Mainnet
              </span>
            </div>
            <div className="wh-address-row">
              <span className="wh-shortened-sub" title={address}>
                {truncateAddress(address)}
              </span>
              {balance !== null && (
                <span className="wh-balance-pill">
                  {ethBalanceDisplay} ETH
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Bar — 3 primary actions */}
        <div className="wh-actions-bar">
          {/* Copy Address */}
          <button
            type="button"
            className={`wh-btn ${copied ? 'wh-btn--copied' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy address'}
            aria-label={copied ? 'Address copied to clipboard' : 'Copy address'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {copied ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </>
              )}
            </svg>
            <span>{copied ? 'Copied ✓' : 'Copy'}</span>
          </button>

          {/* Etherscan link */}
          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wh-btn ext-link-btn"
            title="Open address on Etherscan (opens in new tab)"
            aria-label="Open address on Etherscan (opens in new tab)"
          >
            <span>Etherscan</span>
            <svg className="arrow-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>

          {/* Track another wallet */}
          {onTrackAnother && (
            <button
              type="button"
              className="wh-btn wh-btn--accent"
              onClick={onTrackAnother}
              title="Track another wallet"
              aria-label="Track another wallet address"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>New Search</span>
            </button>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              className="wh-btn wh-btn--refresh"
              onClick={onRefresh}
              disabled={loading}
              title={loading ? 'Refreshing...' : 'Refresh data'}
              aria-label={loading ? 'Refreshing wallet data...' : 'Refresh data'}
            >
              <svg
                className={`refresh-icon ${loading ? 'spinning' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
            </button>
          )}

          {/* More — Share */}
          <div className="wh-more-wrapper">
            <button
              type="button"
              className={`wh-btn wh-btn--icon ${moreOpen ? 'wh-btn--active' : ''}`}
              onClick={() => setMoreOpen((o) => !o)}
              aria-label="More options"
              title="More options"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="5" r="1" fill="currentColor" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="19" r="1" fill="currentColor" />
              </svg>
            </button>

            {moreOpen && (
              <div className="wh-more-dropdown" role="menu">
                <button
                  type="button"
                  className="wh-dropdown-item"
                  onClick={() => { handleShare(); setMoreOpen(false); }}
                  role="menuitem"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>{shared ? 'Link copied ✓' : 'Share dashboard'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
