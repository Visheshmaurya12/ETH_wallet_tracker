import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './KpiGrid.css';

export default function KpiGrid({ balance = 0, transactions = [] }) {
  const containerRef = useRef(null);
  const ethNumberRef = useRef(null);

  const ethBalance = parseFloat(balance) || 0;
  const totalTxs = transactions.length;
  const successfulTxs = transactions.filter((tx) => tx.isError === '0').length;
  const successRate = totalTxs > 0 ? Math.round((successfulTxs / totalTxs) * 100) : 100;
  const totalGasUsed = transactions.reduce((acc, tx) => acc + (parseInt(tx.gasUsed) || 0), 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animation for ETH Balance
      const counterEth = { val: 0 };
      gsap.to(counterEth, {
        val: ethBalance,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (ethNumberRef.current) {
            ethNumberRef.current.innerText = `${counterEth.val.toFixed(4)} ETH`;
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
          <span className="summary-card-badge">Native Asset</span>
        </div>
        <div className="summary-card-value" ref={ethNumberRef}>
          {ethBalance.toFixed(4)} ETH
        </div>
      </div>

      {/* Card 2: Total Transactions */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Transactions</span>
          <span className="summary-card-badge summary-card-badge--success">{successRate}% Success</span>
        </div>
        <div className="summary-card-value">
          {totalTxs} <span className="summary-card-suffix">txs</span>
        </div>
      </div>

      {/* Card 3: Total Gas Used */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Gas Consumed</span>
          <span className="summary-card-badge">Network Metric</span>
        </div>
        <div className="summary-card-value">
          {totalGasUsed.toLocaleString()} <span className="summary-card-suffix">gas</span>
        </div>
      </div>
    </div>
  );
}
