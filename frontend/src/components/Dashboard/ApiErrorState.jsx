import React, { useState } from 'react';
import './ApiErrorState.css';

export default function ApiErrorState({ errorMessage, onRetry, onTryExample }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetryClick = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 500);
    }
  };

  const getFriendlyErrorTitle = (msg) => {
    if (!msg) return "Couldn't load wallet data";
    const lower = msg.toLowerCase();
    if (lower.includes('invalid') || lower.includes('address') || lower.includes('42')) {
      return 'Invalid Ethereum Address';
    }
    if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
      return "Couldn't Connect to Ethereum Mainnet";
    }
    return "Couldn't Load Wallet Analytics";
  };

  const getFriendlyErrorSubtitle = (msg) => {
    if (!msg) return 'Check your internet connection and try again.';
    const lower = msg.toLowerCase();
    if (lower.includes('invalid') || lower.includes('address')) {
      return 'Enter a valid 42-character Ethereum address (0x...) or a valid .eth ENS domain.';
    }
    if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
      return 'Check your internet connection and click retry below.';
    }
    return msg;
  };

  return (
    <div className="api-error-card" role="alert" aria-live="assertive">
      <div className="api-error-icon-box" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="api-error-text-group">
        <h3 className="api-error-title">{getFriendlyErrorTitle(errorMessage)}</h3>
        <p className="api-error-sub">
          {getFriendlyErrorSubtitle(errorMessage)}
        </p>
      </div>

      <div className="api-error-actions">
        {onRetry && (
          <button
            type="button"
            className="error-btn error-btn--primary"
            onClick={handleRetryClick}
            disabled={retrying}
            aria-label={retrying ? 'Retrying request...' : 'Retry request'}
          >
            <svg
              className={`retry-icon ${retrying ? 'spinning' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            <span>{retrying ? 'Retrying...' : 'Retry Request'}</span>
          </button>
        )}

        <button
          type="button"
          className="error-btn"
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
          aria-label="Try loading vitalik.eth example wallet"
        >
          <span>Try vitalik.eth</span>
        </button>
      </div>
    </div>
  );
}
