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
  onRefresh,
  onTrackAnother,
  loading,
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [shared, setShared] = useState(false);

  const primaryDisplay = ensName || address;

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

      {/* Identity + Actions */}
      <div className="wh-top-bar">
        <div className="wh-identity">
          <Identicon address={address} size={44} />
          <div className="wh-identity-meta">
            <div className="wh-title-row">
              <span className="wh-type-label">Wallet</span>
              <h2 className="wh-addr-title" title={address}>
                {ensName ? ensName : truncateAddress(address)}
              </h2>
              <span className="wh-net-badge" aria-label="Network: Ethereum Mainnet">
                <span className="wh-dot" aria-hidden="true" /> Ethereum Mainnet
              </span>
            </div>
            <span className="wh-shortened-sub" title={address}>
              {truncateAddress(address)}
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="wh-actions-bar">
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

          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wh-btn ext-link-btn"
            title="Open address on Etherscan (opens in new tab)"
            aria-label="Open address on Etherscan (opens in new tab)"
          >
            <span>Etherscan</span>
            <svg className="arrow-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>

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
              <span>Track another wallet</span>
            </button>
          )}

          <button
            type="button"
            className="wh-btn"
            onClick={() => setShowQr(true)}
            title="Show QR Code"
            aria-label="Show QR Code modal for wallet address"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>QR</span>
          </button>

          <button
            type="button"
            className="wh-btn"
            onClick={handleShare}
            title="Share link"
            aria-label={shared ? 'Link copied' : 'Share dashboard link'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{shared ? 'Copied ✓' : 'Share'}</span>
          </button>

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
        </div>
      </div>

      {/* QR Code Modal Popup */}
      {showQr && (
        <div className="qr-modal-overlay" onClick={() => setShowQr(false)} role="dialog" aria-modal="true" aria-label="Wallet QR Code">
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Scan Wallet Address</h3>
              <button
                type="button"
                className="qr-close-btn"
                onClick={() => setShowQr(false)}
                aria-label="Close QR Code modal"
              >
                ×
              </button>
            </div>
            <div className="qr-code-body">
              <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`QR Code for ${primaryDisplay}`}>
                <rect width="100" height="100" fill="#FFFFFF" rx="8" />
                <path d="M10 10h30v30H10zM50 10h40v40H50zM10 50h40v40H10zM60 60h30v30H60z" fill="#080B12" />
                <path d="M20 20h10v10H20zM60 20h20v20H60zM20 60h20v20H20zM70 70h10v10H70z" fill="#62D6C5" />
              </svg>
              <p className="qr-addr-label">{primaryDisplay}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
