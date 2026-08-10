import React from 'react';
import { FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg className="footer-eth-icon" width="10" height="16" viewBox="0 0 256 417" fill="none" aria-hidden="true">
            <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#8B96A8"/>
            <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="#B4BCC8"/>
            <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="#8B96A8"/>
            <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="#B4BCC8"/>
          </svg>
          <span className="footer-brand-text">ETH Tracker</span>
        </div>

        <div className="footer-center">
          <span className="footer-attribution">
            On-chain data via{' '}
            <a
              href="https://etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Etherscan API
            </a>
            {' '}· Ethereum Mainnet
          </span>
        </div>

        <div className="footer-right">
          <a
            href="https://github.com/Visheshmaurya12/ETH_wallet_tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="View source code on GitHub"
            title="View source on GitHub"
          >
            <FaGithub size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
