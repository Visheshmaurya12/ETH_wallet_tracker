import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './BalanceCard.css';

const BalanceCard = ({ balance, address }) => {
  const cardRef = useRef(null);
  const numberRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const targetValue = parseFloat(balance) || 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      const counter = { val: 0 };
      gsap.to(counter, {
        val: targetValue, duration: 1.4, ease: 'power2.out', delay: 0.1,
        onUpdate: () => { if (numberRef.current) numberRef.current.innerText = counter.val.toFixed(4); },
      });
    });
    return () => ctx.revert();
  }, [balance]);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="balance-card" ref={cardRef}>
      <div className="balance-card-header">
        <span className="balance-label">Current Balance</span>
        {address && (
          <button type="button" className="balance-address-badge" onClick={handleCopy} title="Click to copy address">
            <span className="address-text">{truncateAddress(address)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {copied ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </>
              )}
            </svg>
            {copied && <span className="copied-tooltip">Copied!</span>}
          </button>
        )}
      </div>
      <div className="balance-value-row">
        <span className="balance-value" ref={numberRef}>0.0000</span>
        <span className="balance-suffix">ETH</span>
      </div>
    </div>
  );
};

export default BalanceCard;
