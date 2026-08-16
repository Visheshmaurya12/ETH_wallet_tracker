# Ethereum Wallet Tracker

A modern Web3 wallet analytics application for tracking Ethereum wallet balances, ENS domains, and on-chain transactions.

## Overview
Ethereum Wallet Tracker is a full-stack Web3 application that allows users to explore publicly available Ethereum wallet information through a clean, responsive interface.

Users can search using:
Ethereum wallet addresses
ENS domains

The application retrieves and presents wallet information such as:
ETH balance
Transaction history
Wallet activity
ENS resolution
Ethereum network information

The project uses a React + Vite frontend with a Node.js + Express backend, while blockchain data is retrieved through external Ethereum/Etherscan services.

## ✨ Features
🔍 Wallet Tracking

Search for any publicly accessible Ethereum wallet address and explore its on-chain activity.

0x742d35Cc6634C0532925a3b844Bc454e4438f44e
🌐 ENS Resolution

Search using ENS domains such as:

vitalik.eth

ENS resolution is handled dynamically rather than relying on hardcoded wallet mappings.

💰 ETH Balance

Retrieve the wallet's current ETH balance with Web3-safe numeric handling.

The backend avoids JavaScript floating-point arithmetic for Wei values to prevent precision loss when working with large blockchain numbers.

## 📜 Transaction History

View wallet transactions with relevant information such as:

Transaction hash
Sender
Receiver
ETH value
Timestamp
Transaction status
⚡ Performance Optimizations

The backend includes caching and optimized request handling to reduce unnecessary calls to external blockchain APIs.

🛡️ Rate Limiting

Expensive API endpoints are protected against excessive requests to prevent abuse and external API quota exhaustion.

## 🔐 Secure Backend

The backend includes:

Input validation
CORS configuration
Security headers
Environment-based secrets
Structured error handling
Request timeouts
🔄 Frontend ↔ Backend Coordination

The frontend uses a centralized API service instead of scattering raw API requests throughout components.

Request cancellation prevents stale requests from overwriting newer wallet searches.

## 📱 Responsive UI

The interface is designed for:

Desktop
Laptop
Tablet
Mobile
## 🏗️ Architecture

The application follows a layered architecture:

                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React + Vite      │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   API Service       │
                    │  Request Handling   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │                     │
                    │ Routes              │
                    │ Controllers         │
                    │ Middleware          │
                    │ Services            │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Blockchain /        │
                    │ External API Layer  │
                    │                     │
                    │ Ethereum / Etherscan│
                    └─────────────────────┘

The original implementation used a monolithic Express server as a proxy to Etherscan V2; the backend was subsequently structured into dedicated configuration, services, controllers, middleware, routes, and utility layers.
