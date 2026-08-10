import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './SearchBar.css';

const ENS_MAP = {
  'vitalik.eth': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
};

const DEFAULT_ENS_EXAMPLE = 'vitalik.eth';

const SearchBar = ({ onSearch, loading }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [pastedNotice, setPastedNotice] = useState(false);
  const [status, setStatus] = useState('default'); // default | valid | invalid | loading | success
  const formRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Global '/' or 'Ctrl+K' / 'Cmd+K' keyboard shortcut to focus input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Validate input (Ethereum 0x address or .eth ENS name)
  useEffect(() => {
    const val = inputValue.trim().toLowerCase();
    if (!val) {
      setStatus('default');
      setError('');
      return;
    }

    const isEthAddr = /^0x[a-fA-F0-9]{40}$/.test(val);
    const isEnsName = /^[a-zA-Z0-9-]+\.eth$/.test(val);

    if (isEthAddr || isEnsName) {
      setStatus('valid');
      setError('');
    } else {
      setStatus('invalid');
      if (val.length < 3) {
        setError('Address too short. Must start with 0x (42 characters) or end with .eth');
      } else if (!val.startsWith('0x') && !val.endsWith('.eth')) {
        setError('Enter a valid 42-character address starting with 0x or a .eth ENS domain');
      } else if (val.startsWith('0x') && val.length !== 42) {
        setError(`Address length is ${val.length} chars (required: 42 characters).`);
      } else {
        setError('Invalid Ethereum address format.');
      }
    }
  }, [inputValue]);

  // Sync loading state
  useEffect(() => {
    if (loading) {
      setStatus('loading');
    } else if (status === 'loading') {
      setStatus(inputValue.trim() ? 'valid' : 'default');
    }
  }, [loading]);

  const triggerErrorShake = () => {
    gsap.fromTo(
      formRef.current,
      { x: -6 },
      { x: 6, duration: 0.05, repeat: 3, yoyo: true, ease: 'power1.inOut', clearProps: 'x' }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawVal = inputValue.trim();
    const lowerVal = rawVal.toLowerCase();

    if (!rawVal) {
      setError('Please enter a valid 42-character Ethereum address or ENS domain');
      setStatus('invalid');
      triggerErrorShake();
      return;
    }

    let targetAddress = rawVal;

    // Handle ENS resolution
    if (lowerVal.endsWith('.eth')) {
      targetAddress = ENS_MAP[lowerVal] || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      setError('Invalid Ethereum address. Check the 42-character hex address and try again.');
      setStatus('invalid');
      triggerErrorShake();
      return;
    }

    setError('');
    setStatus('success');
    onSearch(targetAddress, lowerVal.endsWith('.eth') ? lowerVal : null);
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API unavailable');
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setError('Clipboard is empty.');
        setStatus('invalid');
        return;
      }
      setInputValue(text.trim());
      setPastedNotice(true);
      inputRef.current?.focus();

      setTimeout(() => {
        setPastedNotice(false);
      }, 2500);
    } catch {
      setError('Clipboard permission denied. Please paste manually using Ctrl+V or Cmd+V.');
      setStatus('invalid');
      triggerErrorShake();
    }
  };

  const handleClear = () => {
    setInputValue('');
    setError('');
    setPastedNotice(false);
    setStatus('default');
    inputRef.current?.focus();
  };

  const handleExample = () => {
    setInputValue(DEFAULT_ENS_EXAMPLE);
    setError('');
    setPastedNotice(false);
    inputRef.current?.focus();
  };

  const statusClass = status !== 'default' ? `search-form--${status}` : '';

  return (
    <div className="search-container" ref={formRef} id="search-section">
      {/* Live Region for Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {pastedNotice && 'Address pasted from clipboard.'}
        {status === 'valid' && `Valid ${inputValue.trim().endsWith('.eth') ? 'ENS Name' : 'Ethereum address'}`}
        {error && `Error: ${error}`}
        {loading && 'Fetching wallet data from Ethereum Mainnet...'}
      </div>

      <form className={`search-form ${statusClass}`} onSubmit={handleSubmit} noValidate>
        {/* Wallet icon */}
        <div className="input-icon-wrapper" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
            <path d="M3 5v14a2 2 0 002 2h16v-5"/>
            <path d="M18 12a1 1 0 100 4 1 1 0 000-4z"/>
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          id="wallet-search-input"
          className="search-input"
          placeholder="Enter wallet address (0x...) or ENS (e.g. vitalik.eth)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Ethereum wallet address or ENS domain"
          aria-invalid={status === 'invalid'}
          aria-describedby="search-feedback"
        />

        {/* Clear Button (shown when input has text) */}
        {inputValue && !loading && (
          <button
            type="button"
            className="clear-input-btn"
            onClick={handleClear}
            aria-label="Clear input text"
            title="Clear text"
          >
            ✕
          </button>
        )}

        {/* Paste button */}
        <button
          type="button"
          className={`paste-btn ${pastedNotice ? 'pasted-active' : ''}`}
          onClick={handlePaste}
          disabled={loading}
          aria-label="Paste address from clipboard"
          title="Paste from clipboard"
        >
          {pastedNotice ? (
            <span className="paste-btn-pasted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Address pasted
            </span>
          ) : (
            'Paste'
          )}
        </button>

        {/* Submit button */}
        <button
          type="submit"
          className="search-button"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? (
            <span className="button-content">
              <span className="btn-spinner" aria-hidden="true" />
              <span>Fetching...</span>
            </span>
          ) : (
            <span className="button-content">
              <span>Track Wallet</span>
              <svg className="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          )}
        </button>
      </form>

      {/* Feedback area */}
      <div className="search-feedback" id="search-feedback" role="region" aria-live="polite">
        {error && (
          <p className="input-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{error}</span>
          </p>
        )}
        {status === 'valid' && !error && (
          <p className="input-valid">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Valid {inputValue.trim().endsWith('.eth') ? 'ENS Name' : '42-character Ethereum address'}</span>
          </p>
        )}
        {pastedNotice && !error && status !== 'valid' && (
          <p className="input-pasted-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Address pasted from clipboard</span>
          </p>
        )}
      </div>

      {/* Example wallet link prioritizing vitalik.eth */}
      <button
        type="button"
        className="example-link"
        onClick={handleExample}
        disabled={loading}
        aria-label="Try vitalik.eth as an example wallet domain"
      >
        <span>Try vitalik.eth</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
