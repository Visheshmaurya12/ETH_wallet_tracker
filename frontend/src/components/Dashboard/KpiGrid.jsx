import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './KpiGrid.css';

export default function KpiGrid({ balance = 0, transactions = [] }) {
  const containerRef = useRef(null);
  const ethNumberRef = useRef(null);

  const ethBalanceStr = balance !== null && balance !== undefined ? String(balance) : '0';
  const numericEthBalance = parseFloat(balance) || 0;
  const totalTxs = transactions.length;
  const successfulTxs = transactions.filter((tx) => !tx.isError).length;
  const successRate = totalTxs > 0 ? Math.round((successfulTxs / totalTxs) * 100) : 100;
  const totalGasUsed = transactions.reduce((acc, tx) => acc + (tx.gasUsed || 0), 0);

  // Determine net flow: is this wallet mostly receiving or sending?
  const incomingCount = transactions.filter(
    (tx) => tx.to && tx.to.toLowerCase() === (tx.to || '').toLowerCase()
  ).length;

  const failedCount = totalTxs - successfulTxs;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animation for ETH Balance
      const counterEth = { val: 0 };
      gsap.to(counterEth, {
        val: numericEthBalance,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (ethNumberRef.current) {
            ethNumberRef.current.innerText = `${ethBalanceStr} ETH`;
          }
        },
      });

      // Entrance animation for summary cards
      gsap.fromTo(
        '.summary-card',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [balance, transactions]);

  return (
    <div className="summary-row-container" ref={containerRef}>
      {/* Card 1: ETH Balance */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">ETH Balance</span>
          <span className="summary-card-badge summary-card-badge--accent">Ethereum</span>
        </div>
        <div className="summary-card-value" ref={ethNumberRef}>
          {ethBalanceStr} ETH
        </div>
        <span className="summary-card-context">Native asset · Mainnet</span>
      </div>

      {/* Card 2: Total Transactions */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Transactions</span>
          <span className={`summary-card-badge ${successRate >= 90 ? 'summary-card-badge--success' : successRate >= 70 ? 'summary-card-badge--warn' : 'summary-card-badge--danger'}`}>
            {successRate}% success
          </span>
        </div>
        <div className="summary-card-value">
          {totalTxs} <span className="summary-card-suffix">txs</span>
        </div>
        <span className="summary-card-context">
          {failedCount > 0 ? `${failedCount} failed` : 'All confirmed'}
        </span>
      </div>

      {/* Card 3: Total Gas Used */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Gas Consumed</span>
          <span className="summary-card-badge">Total</span>
        </div>
        <div className="summary-card-value">
          {totalGasUsed > 1_000_000
            ? `${(totalGasUsed / 1_000_000).toFixed(2)}M`
            : totalGasUsed.toLocaleString()}{' '}
          <span className="summary-card-suffix">gas</span>
        </div>
        <span className="summary-card-context">Across {totalTxs} transactions</span>
      </div>
    </div>
  );
}
