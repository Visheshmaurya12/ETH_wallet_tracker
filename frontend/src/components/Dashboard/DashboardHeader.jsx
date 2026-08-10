import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './DashboardHeader.css';

const ETH_PRICE_USD = 2500; // Reference price per ETH

function Identicon({ address, size = 44 }) {
  if (!address || address.length < 10) return null;
  const hash = address.slice(2, 12);
  const color1 = `#${hash.slice(0, 6)}`;
  const color2 = `#${hash.slice(4, 10)}`;
  const color3 = `#${hash.slice(2, 8)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className="wallet-identicon" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill={color1} opacity="0.85" />
      <circle cx="22" cy="22" r="14" fill={color2} opacity="0.9" />
      <rect x="13" y="13" width="18" height="18" rx="5" fill={color3} opacity="0.8" />
    </svg>
  );
}

export default function DashboardHeader({ address, balance, onRefresh, loading }) {
  const [copied, setCopied] = useState(false);
  const numberRef = useRef(null);
  const cardRef = useRef(null);

  const ethBalance = parseFloat(balance) || 0;
  const usdBalance = ethBalance * ETH_PRICE_USD;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { val: 0 };
      gsap.to(counter, {
        val: ethBalance,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerText = counter.val.toFixed(4);
          }
        },
      });

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, [balance, address]);

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

  return (
    <div className="hero-identity-card" ref={cardRef}>
      {/* Live Region for Screen Reader Copy Confirmation */}
      <div className="sr-only" aria-live="polite" role="status">
        {copied ? 'Wallet address copied to clipboard' : ''}
      </div>

      {/* Top Identity Row */}
      <div className="identity-top-row">
        <div className="identity-left">
          <Identicon address={address} size={44} />
          <div className="identity-text-block">
            <div className="identity-title-row">
              <h2 className="identity-truncated-addr" title={address}>
                {truncateAddress(address)}
              </h2>

              <button
                type="button"
                className={`identity-copy-btn ${copied ? 'copied-active' : ''}`}
                onClick={handleCopy}
                title={copied ? 'Address copied to clipboard' : 'Copy full wallet address'}
                aria-label={copied ? 'Address copied to clipboard' : 'Copy full wallet address'}
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <span className="identity-full-addr" title={address}>{address}</span>
          </div>
        </div>

        <div className="identity-actions-right">
          <div className="network-pill-badge" aria-label="Network: Ethereum Mainnet">
            <span className="network-live-dot" aria-hidden="true" />
            <span>Ethereum Mainnet</span>
          </div>

          <a
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="identity-action-btn"
            title="View wallet address on Etherscan (opens in new tab)"
            aria-label="View wallet address on Etherscan (opens in new tab)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Etherscan</span>
          </a>

          {onRefresh && (
            <button
              type="button"
              className="identity-action-btn"
              onClick={onRefresh}
              disabled={loading}
              title={loading ? 'Refreshing wallet data...' : 'Refresh wallet data'}
              aria-label={loading ? 'Refreshing wallet data...' : 'Refresh wallet data'}
            >
              <svg
                className={`refresh-icon ${loading ? 'spinning' : ''}`}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="identity-divider" role="separator" />

      {/* Hero ETH Balance Area */}
      <div className="hero-balance-section">
        <div className="balance-header-meta">
          <span className="balance-hero-label">Total Wallet Balance</span>
          <span className="balance-token-tag">Native Asset</span>
        </div>

        <div className="balance-primary-display">
          <div className="balance-val-group">
            <span className="hero-balance-val" ref={numberRef}>
              0.0000
            </span>
            <span className="hero-balance-symbol">ETH</span>
          </div>

          <div className="hero-usd-valuation">
            ≈ ${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>
      </div>
    </div>
  );
}
