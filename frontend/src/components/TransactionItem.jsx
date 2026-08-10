import React from 'react';
import './TransactionItem.css';

const TransactionItem = ({ tx, index }) => {
  const isSuccess = tx.isError === '0';
  const formattedValue = (parseFloat(tx.value) / 1e18).toFixed(4);
  const formattedDate = new Date(tx.timeStamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="transaction-item">
      <div className="tx-left">
        <div className="tx-status-dot-wrapper">
          <span className={`tx-dot ${isSuccess ? 'dot-success' : 'dot-error'}`} title={isSuccess ? 'Transaction Successful' : 'Transaction Failed'} />
        </div>
        <div className="tx-info">
          <div className="tx-primary-row">
            {tx.hash ? (
              <a
                href={`https://etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-hash"
                title={`View tx on Etherscan: ${tx.hash}`}
              >
                {`${tx.hash.substring(0, 10)}...`}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            ) : (
              <span className="tx-hash">Unknown</span>
            )}
            <span className="tx-date">{formattedDate}</span>
          </div>
          <div className="tx-secondary-row">
            <span className="tx-addresses">
              <span className="tx-addr-label">From</span>
              <a
                href={`https://etherscan.io/address/${tx.from}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-addr-link"
                title={`View address: ${tx.from}`}
              >
                {truncateAddress(tx.from)}
              </a>
              <span className="tx-addr-separator">→</span>
              <span className="tx-addr-label">To</span>
              <a
                href={`https://etherscan.io/address/${tx.to}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-addr-link"
                title={`View address: ${tx.to}`}
              >
                {truncateAddress(tx.to)}
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="tx-right">
        <span className="tx-amount">{formattedValue} ETH</span>
        <span className="tx-gas">Gas {parseInt(tx.gasUsed || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default TransactionItem;
