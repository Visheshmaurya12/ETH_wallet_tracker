import React from 'react';
import './SkeletonLoader.css';

export function HeaderSkeleton() {
  return (
    <div className="skeleton-header-card" aria-hidden="true">
      <div className="skeleton-top-bar">
        <div className="skeleton-identity">
          <div className="skeleton-avatar" />
          <div className="skeleton-meta">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-sub" />
          </div>
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-btn" />
          <div className="skeleton-btn" />
          <div className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="skeleton-kpi-grid" aria-hidden="true">
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-val" />
      </div>
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-val" />
      </div>
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-val" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="skeleton-chart-card" aria-hidden="true">
      <div className="skeleton-chart-header">
        <div className="skeleton-line skeleton-title" style={{ width: '120px' }} />
        <div className="skeleton-line skeleton-readout" style={{ width: '90px', height: '24px' }} />
      </div>
      <div className="skeleton-chart-canvas" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="skeleton-table-wrapper" aria-hidden="true">
      <div className="skeleton-table-header">
        <div className="skeleton-line skeleton-th" style={{ width: '50px' }} />
        <div className="skeleton-line skeleton-th" style={{ width: '130px' }} />
        <div className="skeleton-line skeleton-th" style={{ width: '80px' }} />
        <div className="skeleton-line skeleton-th" style={{ width: '70px' }} />
        <div className="skeleton-line skeleton-th" style={{ width: '110px' }} />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-table-row" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="skeleton-cell" style={{ width: '64px', height: '22px', borderRadius: '4px' }} />
          <div className="skeleton-cell" style={{ width: '140px' }} />
          <div className="skeleton-cell" style={{ width: '75px' }} />
          <div className="skeleton-cell" style={{ width: '80px' }} />
          <div className="skeleton-cell" style={{ width: '110px' }} />
        </div>
      ))}
    </div>
  );
}

export function CompleteDashboardSkeleton() {
  return (
    <div
      className="skeleton-dashboard-wrapper"
      role="region"
      aria-label="Loading wallet dashboard content"
      aria-busy="true"
    >
      <div className="sr-only" aria-live="polite" role="status">
        Loading live balance and transaction history...
      </div>
      <HeaderSkeleton />
      <KpiGridSkeleton />
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}
