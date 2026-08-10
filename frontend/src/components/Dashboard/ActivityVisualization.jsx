import React, { useState } from 'react';
import './ActivityVisualization.css';

export default function ActivityVisualization({ transactions = [], address = '' }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const normalizedAddr = address.toLowerCase();

  // Process transaction data for visualization
  const processedTxs = transactions.map((tx) => {
    // Use eth_value (BigInt-safe string from backend) — avoids float precision loss
    const valEth = parseFloat(tx.eth_value || '0') || 0;
    const isIncoming = tx.to && tx.to.toLowerCase() === normalizedAddr;
    const isSuccess = !tx.isError;
    const timeStampNum = typeof tx.timeStamp === 'number' ? tx.timeStamp : parseInt(tx.timeStamp, 10) || 0;
    const dateStr = new Date(timeStampNum * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      hash: tx.hash,
      valueEth: valEth,
      isIncoming,
      isSuccess,
      dateStr,
      gasUsed: tx.gasUsed || 0,
    };
  });

  // Calculate total inflow & outflow
  const totalInflow = processedTxs
    .filter((tx) => tx.isIncoming && tx.isSuccess)
    .reduce((sum, tx) => sum + tx.valueEth, 0);

  const totalOutflow = processedTxs
    .filter((tx) => !tx.isIncoming && tx.isSuccess)
    .reduce((sum, tx) => sum + tx.valueEth, 0);

  const maxVal = Math.max(...processedTxs.map((tx) => tx.valueEth), 0.001);
  const totalVolume = totalInflow + totalOutflow;

  const inflowPercent = totalVolume > 0 ? (totalInflow / totalVolume) * 100 : 50;
  const outflowPercent = totalVolume > 0 ? (totalOutflow / totalVolume) * 100 : 50;

  return (
    <div className="activity-viz-container">
      {/* 1. Transaction Activity Volume Timeline Bar Chart */}
      <div className="viz-card">
        <div className="viz-header">
          <div className="viz-title-block">
            <h3 className="viz-title">Transaction Activity Timeline</h3>
            <span className="viz-subtitle">ETH volume per transaction (recent on-chain history)</span>
          </div>
          <div className="viz-legend">
            <span className="legend-item">
              <span className="legend-dot dot-inflow" /> Received (IN)
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-outflow" /> Sent (OUT)
            </span>
          </div>
        </div>

        {processedTxs.length > 0 ? (
          <div className="bar-chart-container">
            <div className="bar-chart-bars">
              {processedTxs.map((tx, idx) => {
                const heightPercent = Math.max((tx.valueEth / maxVal) * 100, 12);
                return (
                  <div
                    key={tx.hash || idx}
                    className="bar-wrapper"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on hover */}
                    {hoveredBar === idx && (
                      <div className="bar-tooltip">
                        <span className="tooltip-date">{tx.dateStr}</span>
                        <span className="tooltip-val">
                          {tx.isIncoming ? '+' : '-'}{tx.valueEth.toFixed(4)} ETH
                        </span>
                        <span className="tooltip-type">
                          {tx.isIncoming ? 'Received' : 'Sent'} • {tx.isSuccess ? 'Confirmed' : 'Failed'}
                        </span>
                      </div>
                    )}

                    <div className="bar-track">
                      <div
                        className={`bar-fill ${tx.isIncoming ? 'bar-fill--in' : 'bar-fill--out'}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="bar-label">{tx.dateStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="viz-empty">
            <p>No transaction volume data to display</p>
          </div>
        )}
      </div>

      {/* 2. Inflow vs Outflow Visual Ratio Meter */}
      <div className="viz-card">
        <div className="viz-header">
          <div className="viz-title-block">
            <h3 className="viz-title">ETH Transfer Volume Breakdown</h3>
            <span className="viz-subtitle">Comparison of incoming vs outgoing transaction volume</span>
          </div>
        </div>

        <div className="flow-meter-block">
          <div className="flow-meter-stats">
            <div className="flow-stat-item inflow">
              <span className="flow-stat-label">Total Received</span>
              <span className="flow-stat-val">+{totalInflow.toFixed(4)} ETH</span>
              <span className="flow-stat-percent">{inflowPercent.toFixed(1)}%</span>
            </div>

            <div className="flow-stat-item outflow">
              <span className="flow-stat-label">Total Sent</span>
              <span className="flow-stat-val">-{totalOutflow.toFixed(4)} ETH</span>
              <span className="flow-stat-percent">{outflowPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flow-meter-track">
            <div className="flow-meter-fill-in" style={{ width: `${inflowPercent}%` }} />
            <div className="flow-meter-fill-out" style={{ width: `${outflowPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
