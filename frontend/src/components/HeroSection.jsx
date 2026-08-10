import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

const HeroSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-title',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero-subtitle',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.08 }
      );
      gsap.fromTo(
        '.hero-badges',
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.16 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" ref={sectionRef}>
      <h1 className="hero-title">
        Track any Ethereum wallet.
      </h1>
      <p className="hero-subtitle">
        Explore balances, transactions, and on-chain activity in seconds.
      </p>
      <div className="hero-badges">
        <div className="hero-badge">
          <svg width="14" height="22" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#636e7f"/>
            <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="#8B96A8"/>
            <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="#636e7f"/>
            <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="#8B96A8"/>
          </svg>
          <span>Ethereum Mainnet</span>
        </div>
        <div className="hero-badge">
          <span className="badge-dot" />
          <span>Real-time blockchain data</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
