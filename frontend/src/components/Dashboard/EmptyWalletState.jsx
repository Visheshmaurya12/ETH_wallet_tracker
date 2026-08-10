import React from 'react';
import './EmptyWalletState.css';

export default function EmptyWalletState({ onTryExample, message, subtitle }) {
  return (
    <div className="empty-wallet-card" role="region" aria-label="No wallet loaded">
      <div className="empty-wallet-icon-box" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12V7H5a2 2 0 010-4h14v4" />
          <path d="M3 5v14a2 2 0 002 2h16v-5" />
          <path d="M18 12a1 1 0 100 4 1 1 0 000-4z" />
        </svg>
      </div>

      <div className="empty-wallet-text-group">
        <h3 className="empty-wallet-title">{message || 'Track an Ethereum wallet'}</h3>
        <p className="empty-wallet-sub">
          {subtitle || 'Enter a wallet address or ENS name above to explore live balances, transactions, and on-chain activity.'}
        </p>
      </div>

      <div className="empty-wallet-actions">
        <button
          type="button"
          className="empty-wallet-btn empty-wallet-btn--primary"
          onClick={() => {
            if (onTryExample) {
              onTryExample('vitalik.eth');
            } else {
              const searchInput = document.querySelector('.search-input');
              if (searchInput) {
                searchInput.value = 'vitalik.eth';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
              const trackBtn = document.querySelector('.search-button');
              if (trackBtn) trackBtn.click();
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 256 417" fill="none" aria-hidden="true">
            <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="currentColor" opacity="0.7"/>
            <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="currentColor"/>
          </svg>
          <span>Try vitalik.eth</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="empty-wallet-trust">
        <span className="empty-trust-dot" aria-hidden="true" />
        <span>Live data · Ethereum Mainnet · Powered by Etherscan</span>
      </div>
    </div>
  );
}
