import React, { useState } from 'react';
import WalletHeader from './WalletHeader';
import KpiGrid from './KpiGrid';
import DashboardTabs from './DashboardTabs';
import TransactionFeed from './TransactionFeed';
import AnalyticsView from './AnalyticsView';
import ActivityVisualization from './ActivityVisualization';
import HistoricalBalanceChart from './HistoricalBalanceChart';
import AssetBreakdown from './AssetBreakdown';
import './Dashboard.css';

export default function Dashboard({ address, ensName, balance, transactions, onRefresh, onTrackAnother, loading }) {
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <div className="dashboard-container">
      {/* Master Wallet Header: Identity, Address, Actions */}
      <WalletHeader
        address={address}
        ensName={ensName}
        balance={balance}
        transactions={transactions}
        onRefresh={onRefresh}
        onTrackAnother={onTrackAnother}
        loading={loading}
      />

      {/* Clean 3-Card Summary Row */}
      <KpiGrid balance={balance} transactions={transactions} address={address} />

      {/* Navigation Tabs */}
      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        txCount={transactions.length}
      />

      {/* Tab View Content */}
      <div className="tab-content-area">
        {activeTab === 'transactions' && (
          <TransactionFeed transactions={transactions} trackedAddress={address} />
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <HistoricalBalanceChart currentBalance={balance} transactions={transactions} address={address} />
            <ActivityVisualization transactions={transactions} address={address} />
            <AnalyticsView transactions={transactions} balance={balance} />
          </div>
        )}

        {activeTab === 'assets' && <AssetBreakdown balance={balance} />}
      </div>
    </div>
  );
}
