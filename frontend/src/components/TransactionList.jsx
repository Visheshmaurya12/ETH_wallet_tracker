import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import TransactionItem from './TransactionItem';
import './TransactionList.css';

const TransactionList = ({ transactions }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!transactions.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.transaction-item', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [transactions]);

  return (
    <div className="transaction-list-container" ref={containerRef}>
      <div className="transaction-header">
        <h2 className="header-title">Transactions</h2>
        <span className="header-count">{transactions.length}</span>
      </div>
      <div className="transaction-list">
        {transactions.map((tx, index) => (
          <TransactionItem key={tx.hash || index} tx={tx} index={index} />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
