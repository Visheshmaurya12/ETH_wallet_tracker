import React, { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard/Dashboard';
import EmptyWalletState from './components/Dashboard/EmptyWalletState';
import ApiErrorState from './components/Dashboard/ApiErrorState';
import { CompleteDashboardSkeleton } from './components/Dashboard/SkeletonLoader';
import Footer from './components/Footer';
import EthBackground from './components/EthBackground';
import api from './services/api';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [ensName, setEnsName] = useState('');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Race-condition protection — two independent mechanisms:
   *
   * 1. AbortController: cancels the in-flight HTTP request as soon as a new
   *    search begins, so the browser stops waiting for the old response.
   *
   * 2. Request ID counter: even if an aborted fetch somehow resolves (e.g.
   *    from a service-worker cache), the stale callback compares its captured
   *    `requestId` against the current `activeRequestId.current` and silently
   *    discards any state updates that are no longer for the latest search.
   *
   * Together they ensure that only the most recent search can write to state.
   */
  const abortControllerRef = useRef(null);
  const activeRequestIdRef = useRef(0); // Monotonically increasing request counter
  const mountedRef = useRef(true);      // Unmount guard

  // Mark component as unmounted so async callbacks don't set state after cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort any in-flight request on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSearch = useCallback(async (inputQuery) => {
    if (!inputQuery) return;
    const cleanQuery = inputQuery.trim();

    // ── Step 1: Cancel the previous in-flight request ──────────────────────
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // ── Step 2: Stamp this request with a unique ID ─────────────────────────
    // Any async callback from a previous search will see a stale ID and bail out.
    activeRequestIdRef.current += 1;
    const thisRequestId = activeRequestIdRef.current;

    /**
     * Guard: returns true only if this callback is still the active search
     * and the component is still mounted.
     */
    const isStillRelevant = () =>
      mountedRef.current && activeRequestIdRef.current === thisRequestId;

    setLoading(true);
    setError(null);
    setBalance(null);
    setTransactions([]);

    try {
      let targetAddress = cleanQuery;
      let resolvedEnsName = '';

      // ── ENS resolution ────────────────────────────────────────────────────
      if (cleanQuery.toLowerCase().endsWith('.eth')) {
        resolvedEnsName = cleanQuery.toLowerCase();
        const ensRes = await api.resolveEns(resolvedEnsName, signal);

        // Bail immediately if a newer search has already started
        if (!isStillRelevant()) return;

        if (!ensRes || !ensRes.address) {
          throw new Error(
            `Could not resolve ENS domain "${cleanQuery}". ` +
            'Please check the domain or enter a direct 0x wallet address.'
          );
        }
        targetAddress = ensRes.address;
      }

      if (!isStillRelevant()) return;

      setAddress(targetAddress);
      setEnsName(resolvedEnsName);

      // ── Parallel data fetch ───────────────────────────────────────────────
      const [balanceData, txData] = await Promise.all([
        api.getBalance(targetAddress, signal),
        api.getTransactions(targetAddress, 25, signal),
      ]);

      // Final relevance check before writing any state from the response
      if (!isStillRelevant()) return;

      const safeBalanceStr =
        balanceData.balance_eth !== undefined
          ? balanceData.balance_eth
          : String(balanceData.balance || '0');

      setBalance(safeBalanceStr);
      setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
    } catch (err) {
      // AbortError = intentional cancellation — never show an error to the user
      if (err.name === 'AbortError') return;

      // Only show the error if this request is still the active one
      if (isStillRelevant()) {
        setError(err.message || 'An error occurred while fetching wallet data. Please try again.');
      }
    } finally {
      // Only clear the loading indicator for the request that is still active.
      // Without this guard, an aborted request's finally block would set
      // loading=false while the newer request's loading=true is already set,
      // making the skeleton disappear prematurely.
      if (isStillRelevant()) {
        setLoading(false);
      }
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (ensName) {
      handleSearch(ensName);
    } else if (address) {
      handleSearch(address);
    }
  }, [ensName, address, handleSearch]);

  const handleTrackAnother = useCallback(() => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleTryExample = useCallback((exampleQuery) => {
    const inputEl = document.querySelector('.search-input');
    if (inputEl) {
      inputEl.value = exampleQuery;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const searchBtn = document.querySelector('.search-button');
    if (searchBtn) {
      searchBtn.click();
    }
  }, []);

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
