import React from 'react';
import './SkeletonLoader.css';

export function HeaderSkeleton() {
  return (
    <div className="skeleton-header-card" aria-hidden="true">
      <div className="skeleton-top-bar">
        <div className="skeleton-identity">
          <div className="skeleton-avatar skeleton-shimmer" />
          <div className="skeleton-meta">
            <div className="skeleton-line skeleton-title skeleton-shimmer" />
            <div className="skeleton-line skeleton-sub skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-btn skeleton-shimmer" />
          <div className="skeleton-btn skeleton-shimmer" />
          <div className="skeleton-btn skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="skeleton-kpi-grid" aria-hidden="true">
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label skeleton-shimmer" />
        <div className="skeleton-line skeleton-val skeleton-shimmer" />
      </div>
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label skeleton-shimmer" />
        <div className="skeleton-line skeleton-val skeleton-shimmer" />
      </div>
      <div className="skeleton-kpi-card">
        <div className="skeleton-line skeleton-label skeleton-shimmer" />
        <div className="skeleton-line skeleton-val skeleton-shimmer" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="skeleton-chart-card" aria-hidden="true">
      <div className="skeleton-chart-header">
        <div className="skeleton-line skeleton-title skeleton-shimmer" style={{ width: '120px' }} />
        <div className="skeleton-line skeleton-readout skeleton-shimmer" style={{ width: '90px', height: '24px' }} />
      </div>
      <div className="skeleton-chart-canvas skeleton-shimmer" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="skeleton-table-wrapper" aria-hidden="true">
      <div className="skeleton-table-header">
        <div className="skeleton-line skeleton-th skeleton-shimmer" style={{ width: '50px' }} />
        <div className="skeleton-line skeleton-th skeleton-shimmer" style={{ width: '130px' }} />
        <div className="skeleton-line skeleton-th skeleton-shimmer" style={{ width: '80px' }} />
        <div className="skeleton-line skeleton-th skeleton-shimmer" style={{ width: '70px' }} />
        <div className="skeleton-line skeleton-th skeleton-shimmer" style={{ width: '110px' }} />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-table-row" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '64px', height: '22px', borderRadius: '4px' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '140px' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '75px' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '80px' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '110px' }} />
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
