# InFlow (Backend) 🌐⚡

InFlow is the high-performance, decentralized backend engine powering a cutting-edge SocialFi platform designed to shift digital sovereignty back to creators. 

By eliminating centralized algorithmic manipulation and data monetization exploitation, InFlow allows creators to truly own their content through **NFT-backed posts**, monetize engagement directly via smart-contract integrations, and foster community governance through tokenized incentives. The backend serves as a resilient orchestration layer bridging Web2 database speeds with Web3 blockchain transparency and security.

---

## 🛠️ Technical Architecture & Stack

* **Framework:** **NestJS / Node.js** (TypeScript) – Engineered using modular, domain-driven design principles ensuring strong separation of concerns (e.g., identity, monetization, content, governance).
* **Blockchain Integrations:** Ethers.js / Web3.js – Integrating with smart contracts to handle decentralized identities, on-chain state synchronization, and reward payouts.
* **Authentication:** **JWT Auth** coupled with cryptographic wallet-signature verification (e.g., SIWE - Sign-In with Ethereum principles) for secure session management.
* **Database & Ledger Cache:** [PostgreSQL / MongoDB - *Insert Database here*] – Scalable database architecture managing high-velocity social interactions (likes, comments, follows) linked to immutable on-chain records.
* **Validation & Security:** Strict enterprise-grade middleware handling payload sanitization via `class-validator`, rate limiting, and CORS configuration.

---

## ✨ Core System Workflows & Engineering Challenges

* **🎨 NFT-Backed Content Ownership:** Backend orchestration for tokenizing posts. When creators publish premium content, the backend handles file metadata structures compliant with ERC-721/ERC-1155 standards before anchoring them to the blockchain.
* **💰 Tokenized Engagement & Monetization:** A secure computational engine that calculates real-time engagement metrics (shares, comments, likes) and converts them into tokenized reward allocations without centralized middle-men intervention.
* **🛡️ Decentralized Identity & Auth:** Replaced traditional password systems with a hybrid crypto-wallet-based authentication flow, validating cryptographic signatures on the backend before granting access tokens.
* **🏛️ Community Governance APIs:** Manages snapshotting mechanisms and consensus-proposal metadata allowing micro-communities to self-govern through token weightings.

---

## 🚀 REST API Architecture Overview

The backend architecture implements clean RESTful principles with precise status coding and role-based access control.

### 🔐 Web3 Identity & Session
* `POST /api/v1/auth/nonce` - Generates a unique cryptographic challenge to prevent replay attacks.
* `POST /api/v1/auth/verify` - Validates wallet signatures and issues a stateless session JWT.

### 📝 Content & NFT Syncing
* `POST /api/v1/posts` - Creates a new social feed item and prepares metadata for on-chain minting. 🔒
* `GET /api/v1/posts/:id` - Fetches aggregated off-chain interactions and token verification data.

### 📈 Monetization & Governance
* `POST /api/v1/rewards/claim` - Triggers background validation mechanisms before certifying token reward eligibility. 🔒
* `POST /api/v1/governance/proposals` - Registers an encrypted proposal draft for community voting. 🔒

---

## ⚙️ Local Setup and Installation

### Prerequisites
* Ensure you have **Node.js (v18+)** and your database engine active.
* Access to a Web3 RPC Node provider (e.g., Alchemy, Infura) if running live smart-contract hooks.

### 1. Installation
```bash
git clone [https://github.com/Shukazuby/inflow-backend.git](https://github.com/Shukazuby/inflow-backend.git)
cd inflow-backend
npm install
