import React from 'react';
import './DashboardTabs.css';

export default function DashboardTabs({ activeTab, onTabChange, txCount = 0 }) {
  const tabs = [
    {
      id: 'transactions',
      label: 'Transactions',
      badge: txCount > 0 ? txCount : null,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      badge: null,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'assets',
      label: 'Assets',
      badge: null,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12V7H5a2 2 0 010-4h14v4" />
          <path d="M3 5v14a2 2 0 002 2h16v-5" />
          <path d="M18 12a1 1 0 100 4 1 1 0 000-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dash-tabs-bar">
      <div className="dash-tabs-nav" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`dash-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="dash-tab-icon">{tab.icon}</span>
              <span className="dash-tab-label">{tab.label}</span>
              {tab.badge !== null && tab.badge !== undefined && (
                <span className="dash-tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
