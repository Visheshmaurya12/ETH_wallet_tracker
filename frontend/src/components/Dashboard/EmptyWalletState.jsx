import React from 'react';
import './EmptyWalletState.css';

export default function EmptyWalletState({ onTryExample, message, subtitle }) {
  return (
    <div className="empty-wallet-card">
      <div className="empty-wallet-icon-box">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12V7H5a2 2 0 010-4h14v4" />
          <path d="M3 5v14a2 2 0 002 2h16v-5" />
          <path d="M18 12a1 1 0 100 4 1 1 0 000-4z" />
        </svg>
      </div>

      <div className="empty-wallet-text-group">
        <h3 className="empty-wallet-title">{message || 'No transactions found'}</h3>
        <p className="empty-wallet-sub">
          {subtitle || 'Transactions for this wallet will appear here.'}
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
          <span>Try vitalik.eth</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
