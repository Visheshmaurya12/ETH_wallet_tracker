import React from 'react';
import './AssetBreakdown.css';

export default function AssetBreakdown({ balance = 0 }) {
  const ethBalance = parseFloat(balance) || 0;

  const assets = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'Native Asset (L1)',
      icon: 'Ξ',
      balance: ethBalance,
    },
  ];

  return (
    <div className="asset-breakdown">
      <div className="asset-header-summary">
        <div className="summary-left">
          <span className="summary-label">Total Verified Native Balance</span>
          <span className="summary-total-val">{ethBalance.toFixed(4)} ETH</span>
        </div>
        <span className="summary-badge">Ethereum Mainnet</span>
      </div>

      <div className="asset-table-wrapper">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Network / Standard</th>
              <th className="text-right">On-Chain Balance</th>
              <th>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.symbol}>
                <td>
                  <div className="asset-name-cell">
                    <span className="asset-icon-badge">{asset.icon}</span>
                    <div className="asset-name-info">
                      <span className="asset-symbol">{asset.symbol}</span>
                      <span className="asset-name">{asset.name}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="asset-type-badge">{asset.type}</span>
                </td>
                <td className="text-right font-mono font-bold">
                  {asset.balance.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH
                </td>
                <td>
                  <div className="share-cell">
                    <div className="share-bar-track">
                      <div className="share-bar-fill" style={{ width: '100%' }} />
                    </div>
                    <span className="share-percent">100%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
