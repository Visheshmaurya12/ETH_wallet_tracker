import React, { useState, useMemo } from 'react';
import './HistoricalBalanceChart.css';

export default function HistoricalBalanceChart({
  currentBalance = 0,
  transactions = [],
  address = '',
  onTrackExample,
  onTrackAnother,
}) {
  const [activePointIndex, setActivePointIndex] = useState(null);

  const normalizedAddr = address.toLowerCase();

  // Reconstruct historical balance points backwards from current balance strictly using actual transaction history
  const historyData = useMemo(() => {
    if (!transactions || !transactions.length) return [];

    let runningBalance = parseFloat(currentBalance) || 0;
    const points = [];

    // Add current balance as latest point
    const latestTime = transactions[0]?.timeStamp ? new Date(transactions[0].timeStamp * 1000) : new Date();
    points.push({
      dateStr: latestTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: transactions[0]?.timeStamp || Math.floor(Date.now() / 1000),
      balance: runningBalance,
      delta: 0,
    });

    // Walk through verified transactions to compute historical balance points
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (tx.isError !== '0') continue; // Skip reverted transactions

      const valEth = parseFloat(tx.value || 0) / 1e18;
      const isIncoming = tx.to && tx.to.toLowerCase() === normalizedAddr;

      const delta = isIncoming ? valEth : -valEth;
      runningBalance = Math.max(0, runningBalance - delta);

      const txTime = new Date(tx.timeStamp * 1000);
      points.push({
        dateStr: txTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: tx.timeStamp,
        balance: runningBalance,
        delta,
      });
    }

    return points.reverse();
  }, [currentBalance, transactions, normalizedAddr]);

  // Useful Empty State when no real historical transaction data exists
  if (!historyData || historyData.length < 2) {
    return (
      <div className="history-chart-card history-chart-card--empty">
        <div className="chart-card-header">
          <span className="chart-title">Balance History</span>
          <span className="chart-empty-badge">No History</span>
        </div>

        <div className="useful-empty-state">
          <div className="empty-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>

          <div className="empty-text-group">
            <h4 className="empty-title">Historical balance data will appear here when available.</h4>
            <p className="empty-desc">
              No recent on-chain transactions recorded on Ethereum Mainnet for this wallet.
            </p>
          </div>

          <div className="empty-actions-row">
            <button
              type="button"
              className="empty-action-btn empty-action-btn--primary"
              onClick={() => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                  searchInput.value = 'vitalik.eth';
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                const trackBtn = document.querySelector('.search-button');
                if (trackBtn) trackBtn.click();
              }}
            >
              <span>Try vitalik.eth</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="empty-action-btn"
            >
              <span>View on Etherscan</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const balances = historyData.map((p) => p.balance);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances);
  const range = maxBal - minBal || 1;

  const width = 640;
  const height = 140;
  const paddingY = 24;
  const paddingX = 24;

  // Generate SVG coordinates for line chart
  const pointsCoords = historyData.map((pt, idx) => {
    const x = (idx / (historyData.length - 1)) * (width - 2 * paddingX) + paddingX;
    const normalizedY = (pt.balance - minBal) / range;
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y, ...pt, idx };
  });

  const pathD = pointsCoords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const activePoint = activePointIndex !== null ? pointsCoords[activePointIndex] : pointsCoords[pointsCoords.length - 1];

  // Grid line Y coordinates (3 subtle horizontal grid lines)
  const gridY1 = paddingY;
  const gridY2 = height / 2;
  const gridY3 = height - paddingY;

  return (
    <div className="history-chart-card">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <span className="chart-title">Balance History</span>
          <span className="chart-subtitle">{historyData.length} data points</span>
        </div>
        <div className="chart-active-readout">
          <span className="readout-date">{activePoint?.dateStr}</span>
          <span className="readout-val">{activePoint?.balance.toFixed(4)} ETH</span>
        </div>
      </div>

      <div className="chart-svg-wrapper">
        {/* Floating Tooltip */}
        {activePointIndex !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
            }}
          >
            <span className="tooltip-date">{activePoint.dateStr}</span>
            <span className="tooltip-balance">{activePoint.balance.toFixed(4)} ETH</span>
            {activePoint.delta !== 0 && (
              <span className={`tooltip-delta ${activePoint.delta > 0 ? 'pos' : 'neg'}`}>
                {activePoint.delta > 0 ? '+' : ''}{activePoint.delta.toFixed(4)} ETH
              </span>
            )}
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
          {/* Subtle horizontal grid lines */}
          <line x1="0" y1={gridY1} x2={width} y2={gridY1} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1="0" y1={gridY2} x2={width} y2={gridY2} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1="0" y1={gridY3} x2={width} y2={gridY3} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

          {/* Minimal thin trend line (1.2px) */}
          <path d={pathD} fill="none" stroke="#62D6C5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hairline interactive data points with touch-friendly hit areas */}
          {pointsCoords.map((pt) => (
            <g key={pt.idx} className="chart-point-group">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.idx === pt.idx ? '4' : '2'}
                className={`chart-point-dot ${activePoint?.idx === pt.idx ? 'active' : ''}`}
                onMouseEnter={() => setActivePointIndex(pt.idx)}
                onTouchStart={() => setActivePointIndex(pt.idx)}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="16"
                fill="transparent"
                onMouseEnter={() => setActivePointIndex(pt.idx)}
                onTouchStart={() => setActivePointIndex(pt.idx)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="chart-x-axis">
        <span>{historyData[0]?.dateStr}</span>
        <span>{historyData[Math.floor(historyData.length / 2)]?.dateStr}</span>
        <span>{historyData[historyData.length - 1]?.dateStr}</span>
      </div>
    </div>
  );
}
