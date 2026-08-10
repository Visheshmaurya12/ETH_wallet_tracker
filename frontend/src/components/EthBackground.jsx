import React from 'react';
import './EthBackground.css';

export default function EthBackground() {
  return (
    <div className="eth-bg" aria-hidden="true">
      {/* Subtle radial glow */}
      <div className="eth-bg__glow" />

      {/* Dot grid */}
      <div className="eth-bg__grid" />

      {/* Faint Ethereum diamond geometry — centered, barely visible */}
      <div className="eth-bg__eth-geometry">
        <svg viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="currentColor" opacity="0.5"/>
          <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="currentColor" opacity="0.7"/>
          <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="currentColor" opacity="0.5"/>
          <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="currentColor" opacity="0.7"/>
          <path d="M127.961 287.958L255.922 212.32L127.961 154.159Z" fill="currentColor" opacity="0.35"/>
          <path d="M0 212.32L127.962 287.958V154.159L0 212.32Z" fill="currentColor" opacity="0.55"/>
        </svg>
      </div>

      {/* Tiny blockchain node dots */}
      <div className="eth-bg__nodes">
        <span className="eth-bg__node" style={{top: '15%', left: '12%'}} />
        <span className="eth-bg__node" style={{top: '25%', left: '78%'}} />
        <span className="eth-bg__node" style={{top: '45%', left: '8%'}} />
        <span className="eth-bg__node" style={{top: '55%', left: '88%'}} />
        <span className="eth-bg__node" style={{top: '72%', left: '22%'}} />
        <span className="eth-bg__node" style={{top: '82%', left: '68%'}} />
        <span className="eth-bg__node eth-bg__node--sm" style={{top: '20%', left: '45%'}} />
        <span className="eth-bg__node eth-bg__node--sm" style={{top: '60%', left: '52%'}} />
        <span className="eth-bg__node eth-bg__node--sm" style={{top: '38%', left: '35%'}} />
        <span className="eth-bg__node eth-bg__node--sm" style={{top: '78%', left: '42%'}} />
      </div>

      {/* Faint connection lines between nodes */}
      <svg className="eth-bg__lines" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="120" y1="150" x2="450" y2="200" stroke="white" strokeWidth="0.5" opacity="0.04"/>
        <line x1="780" y1="250" x2="520" y2="600" stroke="white" strokeWidth="0.5" opacity="0.03"/>
        <line x1="80" y1="450" x2="350" y2="380" stroke="white" strokeWidth="0.5" opacity="0.035"/>
        <line x1="880" y1="550" x2="680" y2="820" stroke="white" strokeWidth="0.5" opacity="0.03"/>
        <line x1="220" y1="720" x2="520" y2="600" stroke="white" strokeWidth="0.5" opacity="0.04"/>
        <line x1="450" y1="200" x2="780" y2="250" stroke="white" strokeWidth="0.5" opacity="0.025"/>
      </svg>

      {/* Noise texture */}
      <div className="eth-bg__noise" />

      {/* Edge vignette */}
      <div className="eth-bg__vignette" />
    </div>
  );
}
