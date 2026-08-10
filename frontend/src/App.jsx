import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard/Dashboard';
import EmptyWalletState from './components/Dashboard/EmptyWalletState';
import ApiErrorState from './components/Dashboard/ApiErrorState';
import { CompleteDashboardSkeleton } from './components/Dashboard/SkeletonLoader';
import Footer from './components/Footer';
import EthBackground from './components/EthBackground';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [ensName, setEnsName] = useState('');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (walletAddress, resolvedEns = null) => {
    setAddress(walletAddress);
    setEnsName(resolvedEns || (walletAddress.toLowerCase() === '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' ? 'vitalik.eth' : ''));
    setLoading(true);
    setError(null);
    setBalance(null);
    setTransactions([]);

    try {
      const [balanceRes, txRes] = await Promise.all([
        fetch(`/api/balance?address=${walletAddress}`),
        fetch(`/api/transactions?address=${walletAddress}`)
      ]);

      const balanceData = await balanceRes.json();
      const txData = await txRes.json();

      if (balanceData.success && txData.success) {
        setBalance(balanceData.balance);
        setTransactions(txData.transactions);
      } else {
        setError(balanceData.error || txData.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('An error occurred while fetching data. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (address) {
      handleSearch(address, ensName);
    }
  };

  const handleTrackAnother = () => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTryExample = (exampleAddress) => {
    const inputEl = document.querySelector('.search-input');
    if (inputEl) {
      inputEl.value = exampleAddress;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const searchBtn = document.querySelector('.search-button');
    if (searchBtn) {
      searchBtn.click();
    }
  };

  const hasData = balance !== null || transactions.length > 0;

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="bg-layer">
        <EthBackground />
      </div>
      <Navbar />
      <main className="main-content" id="main-content" tabIndex="-1">
        <HeroSection />
        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <ApiErrorState
            errorMessage={error}
            onRetry={handleRefresh}
            onTryExample={handleTryExample}
          />
        )}

        {loading && <CompleteDashboardSkeleton />}

        {hasData && !loading && (
          <Dashboard
            address={address}
            ensName={ensName}
            balance={balance}
            transactions={transactions}
            onRefresh={handleRefresh}
            onTrackAnother={handleTrackAnother}
            loading={loading}
          />
        )}

        {!hasData && !loading && !error && (
          <EmptyWalletState
            message="Track your first Ethereum wallet"
            subtitle="Enter an address or ENS domain above to explore live balances, transactions, and historical metrics."
            onTryExample={handleTryExample}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
