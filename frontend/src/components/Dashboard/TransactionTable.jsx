import React, { useState } from 'react';
import './TransactionTable.css';

function getTimeAgo(timeStamp) {
  const now = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, now - timeStamp);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins} min${mins === 1 ? '' : 's'} ago`;
  } else if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  } else if (diffSec < 2592000) {
    const days = Math.floor(diffSec / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return new Date(timeStamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

export default function TransactionTable({ transactions = [], trackedAddress = '' }) {
  const [copiedHash, setCopiedHash] = useState(null);

  const normalizedTracked = trackedAddress.toLowerCase();

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const handleCopyHash = (hash, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="tx-table-empty">
        <h4 className="empty-title">No transactions found</h4>
        <p className="empty-sub">Transactions for this wallet will appear here.</p>
      </div>
    );
  }

  return (
    <div className="tx-table-wrapper">
      {/* Live Region for Screen Reader Feedback */}
      <div className="sr-only" aria-live="polite" role="status">
        {copiedHash ? 'Transaction hash copied to clipboard' : ''}
      </div>

      {/* Desktop & Tablet Table View */}
      <table className="tx-table tx-table-desktop" aria-label="Recent Ethereum transactions table">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">From / To</th>
            <th scope="col" className="text-right">Amount</th>
            <th scope="col">Time</th>
            <th scope="col">Transaction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => {
            const isSuccess = !tx.isError;
            const isIncoming = tx.to && tx.to.toLowerCase() === normalizedTracked;

            let typeKey = isIncoming ? 'received' : 'sent';
            let typeLabel = isIncoming ? 'Received' : 'Sent';
            let typeArrow = isIncoming ? '↓' : '↑';

            if (!isSuccess) {
              typeKey = 'failed';
              typeLabel = 'Failed';
              typeArrow = '✕';
            }

            const formattedValue = tx.eth_value || '0';

            const relativeTimeStr = getTimeAgo(parseInt(tx.timeStamp || 0));
            const isCopied = copiedHash === tx.hash;

            return (
              <tr key={tx.hash || index} className={`tx-table-row tx-row--${typeKey}`}>
                {/* 1. Type Badge */}
                <td>
                  <div className="tx-type-cell">
                    <span
                      className={`tx-status-dot dot-${typeKey}`}
                      title={isSuccess ? `${typeLabel} Transaction` : 'Reverted / Failed Transaction'}
                      aria-hidden="true"
                    />
                    <span className={`direction-badge badge-${typeKey}`}>
                      <span className="badge-arrow" aria-hidden="true">{typeArrow}</span>
                      <span>{typeLabel}</span>
                    </span>
                  </div>
                </td>

                {/* 2. From / To */}
                <td>
                  <div className="tx-addrs-cell">
                    <a
                      href={`https://etherscan.io/address/${tx.from}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="addr-link"
                      title={`From address: ${tx.from} (opens in Etherscan)`}
                      aria-label={`From address: ${tx.from}`}
                    >
                      {truncateAddress(tx.from)}
                    </a>
                    <span className="addr-arrow" aria-hidden="true">→</span>
                    <a
                      href={`https://etherscan.io/address/${tx.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="addr-link"
                      title={`To address: ${tx.to} (opens in Etherscan)`}
                      aria-label={`To address: ${tx.to}`}
                    >
                      {truncateAddress(tx.to)}
                    </a>
                  </div>
                </td>

                {/* 3. Amount */}
                <td className="text-right">
                  <span className={`tx-amount-text amt-${typeKey}`}>
                    {typeKey === 'received' ? '+' : ''}{formattedValue} ETH
                  </span>
                </td>

                {/* 4. Time */}
                <td>
                  <span className="tx-date-text" title={new Date(tx.timeStamp * 1000).toLocaleString()}>
                    {relativeTimeStr}
                  </span>
                </td>

                {/* 5. Transaction Hash */}
                <td>
                  <div className="tx-hash-cell">
                    {tx.hash ? (
                      <>
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-hash-link"
                          title={`View transaction on Etherscan: ${tx.hash}`}
                          aria-label={`View transaction ${tx.hash} on Etherscan`}
                        >
                          <span className="hash-code">{truncateHash(tx.hash)}</span>
                          <span className="view-action-text">
                            View
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </span>
                        </a>

                        <button
                          type="button"
                          className={`copy-hash-btn ${isCopied ? 'copied-active' : ''}`}
                          onClick={(e) => handleCopyHash(tx.hash, e)}
                          title={isCopied ? 'Hash copied to clipboard' : 'Copy transaction hash'}
                          aria-label={isCopied ? 'Transaction hash copied' : 'Copy transaction hash'}
                        >
                          {isCopied ? (
                            <span className="copy-confirm" aria-hidden="true">✓</span>
                          ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="tx-hash-muted">Unknown</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Compact Cards View */}
      <div className="tx-cards-mobile" role="region" aria-label="Mobile transaction cards list">
        {transactions.map((tx, index) => {
          const isSuccess = !tx.isError;
          const isIncoming = tx.to && tx.to.toLowerCase() === normalizedTracked;

          let typeKey = isIncoming ? 'received' : 'sent';
          let typeLabel = isIncoming ? 'Received' : 'Sent';
          let typeArrow = isIncoming ? '↓' : '↑';

          if (!isSuccess) {
            typeKey = 'failed';
            typeLabel = 'Failed';
            typeArrow = '✕';
          }

          const formattedValue = tx.eth_value || '0';

          const relativeTimeStr = getTimeAgo(parseInt(tx.timeStamp || 0));
          const isCopied = copiedHash === tx.hash;

          return (
            <div key={tx.hash || index} className={`tx-mobile-card tx-card--${typeKey}`}>
              {/* Header: Type Badge & Relative Time */}
              <div className="tx-mobile-card-top">
                <div className="tx-type-cell">
                  <span className={`tx-status-dot dot-${typeKey}`} aria-hidden="true" />
                  <span className={`direction-badge badge-${typeKey}`}>
                    <span className="badge-arrow" aria-hidden="true">{typeArrow}</span>
                    <span>{typeLabel}</span>
                  </span>
                </div>
                <span className="tx-date-text">{relativeTimeStr}</span>
              </div>

              {/* Body: From / To & Amount */}
              <div className="tx-mobile-card-mid">
                <div className="tx-addrs-cell">
                  <a
                    href={`https://etherscan.io/address/${tx.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="addr-link"
                    aria-label={`From: ${tx.from}`}
                  >
                    {truncateAddress(tx.from)}
                  </a>
                  <span className="addr-arrow" aria-hidden="true">→</span>
                  <a
                    href={`https://etherscan.io/address/${tx.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="addr-link"
                    aria-label={`To: ${tx.to}`}
                  >
                    {truncateAddress(tx.to)}
                  </a>
                </div>

                <span className={`tx-amount-text amt-${typeKey}`}>
                  {typeKey === 'received' ? '+' : ''}{formattedValue} ETH
                </span>
              </div>

              {/* Footer: Tx Hash & Actions */}
              <div className="tx-mobile-card-bot">
                <span className="hash-code">{truncateHash(tx.hash)}</span>
                <div className="tx-mobile-actions">
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-mobile-view-btn"
                    aria-label={`View transaction ${tx.hash} on Etherscan`}
                  >
                    <span>View</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 01-2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    className={`copy-hash-btn ${isCopied ? 'copied-active' : ''}`}
                    onClick={(e) => handleCopyHash(tx.hash, e)}
                    title={isCopied ? 'Copied' : 'Copy Tx Hash'}
                    aria-label={isCopied ? 'Transaction hash copied' : 'Copy transaction hash'}
                  >
                    {isCopied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
