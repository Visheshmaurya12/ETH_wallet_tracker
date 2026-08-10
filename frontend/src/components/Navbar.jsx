import React, { useEffect, useRef } from 'react';
import { FaGithub } from 'react-icons/fa';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <svg className="brand-eth-logo" width="16" height="26" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#8B96A8"/>
            <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="#B4BCC8"/>
            <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="#8B96A8"/>
            <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="#B4BCC8"/>
          </svg>
          <span className="brand-text">ETH Tracker</span>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {/* Network indicator */}
          <div className="network-indicator">
            <span className="network-dot" />
            <span className="network-text">Ethereum Mainnet</span>
          </div>

          <span className="navbar-divider" />

          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            aria-label="View source on GitHub"
          >
            <FaGithub size={16} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
