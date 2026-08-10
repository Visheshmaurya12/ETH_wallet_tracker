import React, { useState, useMemo } from 'react';
import TransactionTable from './TransactionTable';
import './TransactionFeed.css';

const INITIAL_PAGE_SIZE = 10;

export default function TransactionFeed({ transactions = [], trackedAddress = '' }) {
  const [filterType, setFilterType] = useState('all'); // all | in | out | failed
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isSuccess = !tx.isError;
      const isIncoming = tx.to && tx.to.toLowerCase() === trackedAddress.toLowerCase();
      const isOutgoing = tx.from && tx.from.toLowerCase() === trackedAddress.toLowerCase();

      // Filter by type tab
      if (filterType === 'failed' && isSuccess) return false;
      if (filterType === 'in' && !isIncoming) return false;
      if (filterType === 'out' && !isOutgoing) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchHash = tx.hash && tx.hash.toLowerCase().includes(q);
        const matchFrom = tx.from && tx.from.toLowerCase().includes(q);
        const matchTo = tx.to && tx.to.toLowerCase().includes(q);
        if (!matchHash && !matchFrom && !matchTo) return false;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery, trackedAddress]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleCount);
  }, [filteredTransactions, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    if (!filteredTransactions.length) return;

    const headers = ['TxHash', 'Status', 'Type', 'From', 'To', 'Value_ETH', 'GasUsed', 'Timestamp'];
    const rows = filteredTransactions.map((tx) => {
      const isSuccess = !tx.isError ? 'Confirmed' : 'Failed';
      const isIncoming = tx.to && tx.to.toLowerCase() === trackedAddress.toLowerCase();
      const type = isIncoming ? 'IN' : 'OUT';
      // Use eth_value (BigInt-safe string from backend) for precision
      const valEth = parseFloat(tx.eth_value || '0').toFixed(6);
      const timeStampNum = typeof tx.timeStamp === 'number' ? tx.timeStamp : parseInt(tx.timeStamp, 10) || 0;

      return [
        tx.hash,
        isSuccess,
        type,
        tx.from || '',
        tx.to || '(contract creation)',
        valEth,
        tx.gasUsed || 0,
        new Date(timeStampNum * 1000).toISOString(),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wallet_transactions_${trackedAddress.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tx-feed-container">
      {/* Header Controls Bar */}
      <div className="tx-feed-controls">
        <div className="tx-feed-left">
          <div className="tx-feed-pills" role="tablist" aria-label="Transaction type filter tabs">
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'all'}
              className={`feed-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilterType('all');
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'in'}
              className={`feed-pill ${filterType === 'in' ? 'active' : ''}`}
              onClick={() => {
                setFilterType('in');
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
            >
              Incoming
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'out'}
              className={`feed-pill ${filterType === 'out' ? 'active' : ''}`}
              onClick={() => {
                setFilterType('out');
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
            >
              Outgoing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'failed'}
              className={`feed-pill ${filterType === 'failed' ? 'active' : ''}`}
              onClick={() => {
                setFilterType('failed');
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
            >
              Failed
            </button>
          </div>
        </div>

        <div className="tx-feed-right">
          <div className="tx-feed-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter by hash or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
              className="tx-feed-input"
              aria-label="Filter transactions by hash or address"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(INITIAL_PAGE_SIZE);
                }}
                aria-label="Clear transaction filter"
                title="Clear filter text"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="export-csv-btn"
            onClick={handleExportCsv}
            disabled={!filteredTransactions.length}
            title={filteredTransactions.length ? 'Export filtered transactions to CSV file' : 'No transactions available to export'}
            aria-label="Export transactions to CSV file"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      {displayedTransactions.length > 0 ? (
        <>
          <TransactionTable transactions={displayedTransactions} trackedAddress={trackedAddress} />

          {/* Pagination Load More Bar */}
          <div className="tx-pagination-bar">
            <span className="pagination-count-label">
              Showing <strong className="font-mono">{displayedTransactions.length}</strong> of{' '}
              <strong className="font-mono">{filteredTransactions.length}</strong> transactions
            </span>

            {visibleCount < filteredTransactions.length ? (
              <button
                type="button"
                className="load-more-btn"
                onClick={handleLoadMore}
                aria-label={`Load 10 more transactions. Currently displaying ${displayedTransactions.length} of ${filteredTransactions.length}`}
              >
                <span>Load More Txs (+10)</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            ) : (
              <span className="end-of-txs-badge">End of transactions</span>
            )}
          </div>
        </>
      ) : (
        <div className="tx-empty-feed" role="region" aria-label="No transactions match current filters">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="empty-title">No transactions match your filter</p>
          <p className="empty-sub">Try adjusting your filter selection or clear search terms</p>
          <button
            type="button"
            className="reset-filter-btn"
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
              setVisibleCount(INITIAL_PAGE_SIZE);
            }}
            aria-label="Reset all transaction filters"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
