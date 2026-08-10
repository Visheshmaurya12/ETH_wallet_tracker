import React from 'react';
import './AnalyticsView.css';

export default function AnalyticsView({ transactions = [], balance = 0 }) {
  const totalTxs = transactions.length;
  const ethBalance = parseFloat(balance) || 0;

  const successfulTxs = transactions.filter((tx) => tx.isError === '0');
  const failedTxs = transactions.filter((tx) => tx.isError !== '0');

  const totalGas = transactions.reduce((sum, tx) => sum + (parseInt(tx.gasUsed) || 0), 0);
  const avgGas = totalTxs > 0 ? Math.round(totalGas / totalTxs) : 0;
  const totalEthVolume = transactions.reduce((sum, tx) => sum + (parseFloat(tx.value || 0) / 1e18), 0);

  return (
    <div className="analytics-view">
      <div className="analytics-cards-grid">
        <div className="analytics-card">
          <span className="analytics-label">Total Volume Moved</span>
          <span className="analytics-value">{totalEthVolume.toFixed(4)} ETH</span>
          <span className="analytics-sub">Sum of ETH values in recent transactions</span>
        </div>

        <div className="analytics-card">
          <span className="analytics-label">Avg Gas Per Tx</span>
          <span className="analytics-value">{avgGas.toLocaleString()} Gas</span>
          <span className="analytics-sub">Mean gas consumption per transaction</span>
        </div>

        <div className="analytics-card">
          <span className="analytics-label">Success Rate</span>
          <span className="analytics-value">
            {totalTxs > 0 ? ((successfulTxs.length / totalTxs) * 100).toFixed(0) : 100}%
          </span>
          <span className="analytics-sub">{successfulTxs.length} confirmed / {failedTxs.length} failed</span>
        </div>
      </div>

      <div className="analytics-breakdown-panel">
        <h3 className="analytics-panel-title">Transaction Status Distribution</h3>
        <div className="status-bars">
          <div className="status-bar-item">
            <div className="status-bar-header">
              <span className="status-bar-name">
                <span className="status-indicator-dot dot-success" />
                Successful Transactions
              </span>
              <span className="status-bar-count">{successfulTxs.length}</span>
            </div>
            <div className="status-bar-track">
              <div
                className="status-bar-fill fill-success"
                style={{ width: `${totalTxs > 0 ? (successfulTxs.length / totalTxs) * 100 : 100}%` }}
              />
            </div>
          </div>

          <div className="status-bar-item">
            <div className="status-bar-header">
              <span className="status-bar-name">
                <span className="status-indicator-dot dot-error" />
                Failed / Reverted Transactions
              </span>
              <span className="status-bar-count">{failedTxs.length}</span>
            </div>
            <div className="status-bar-track">
              <div
                className="status-bar-fill fill-error"
                style={{ width: `${totalTxs > 0 ? (failedTxs.length / totalTxs) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
