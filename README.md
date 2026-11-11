# Pharos Weekly Digest Agent

An autonomous, production-ready periodic weekly activity digest and reporting agent for accounts and smart contracts on the **Pharos Network**.

Built for the **Pharos Agent Arena (Season of AI)**, integrating directly with the official Pharos Model Context Protocol (MCP) server, Pharos Atlantic Testnet JSON-RPC, and verified on-chain event streams.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    Pharos Weekly Digest Agent Engine   │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┼────────────────────────┐
                 ▼                       ▼                        ▼
       ┌───────────────────┐   ┌───────────────────┐    ┌───────────────────┐
       │ Official Pharos   │   │ Pharos Atlantic   │    │ Verified On-Chain │
       │ MCP Server        │   │ JSON-RPC Node     │    │ Receipts & Events │
       │ (tools/call)      │   │ (Chain ID 688689) │    │ (SocialScan Index)│
       └─────────┬─────────┘   └─────────┬─────────┘    └─────────┬─────────┘
                 │                       │                        │
                 └───────────────────────┼────────────────────────┘
                                         ▼
                      ┌────────────────────────────────────────┐
                      │    Autonomous Aggregator & Ranker      │
                      │ • Key Numbers & Metric Derivations     │
                      │ • Period-over-Period Delta Math        │
                      │ • Top 3 Notable Events Scorer          │
                      │ • Idempotent Duplicate Protection      │
                      └──────────────────┬─────────────────────┘
                                         ▼
                      ┌────────────────────────────────────────┐
                      │    Published Public Digest & Permalinks│
                      │ • Web Dashboard & Detailed Permalinks  │
                      │ • Historical Archive & Run Logs        │
                      │ • GitHub Actions Cron & Vercel Cron    │
                      └────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. Genuine Scheduled Execution
- **Weekly Cadence:** Runs autonomously on schedule (weekly by default every Monday at 00:00 UTC via GitHub Actions cron and Vercel cron).
- **Configurable Schedule & Timezone:** Supports custom period windows and timezone alignment.
- **Manual Trigger:** Web interface "Run Digest Now" button and API endpoint (`POST /api/digest/generate`) for on-demand generation.
- **Run History & Audit:** Persistent run records with timestamps, execution duration, and trigger type.
- **Duplicate Run Protection:** Idempotent hashing per period and target wallet prevents redundant runs and duplicate archives.
- **Safe Retry & Circuit Breaking:** Graceful handling of network timeouts and upstream rate limits with clear error disclosures.

### 2. Current-Period Key Metrics
- **Transaction Totals:** Total transactions, successful vs. failed count.
- **Native Value Flows:** Native `PROS` inflows, outflows, and net balance shift.
- **Gas Accounting:** Total gas units consumed and cumulative execution fees in `PROS`.
- **Contract Interactivity:** Number of smart contract method invocations, novel contract deployments, and unique target contracts.
- **Integrity Classification:** Distinguishes genuine zero activity (`0`) from `UNKNOWN`, `UNAVAILABLE`, and `PARTIAL` coverage.

### 3. Previous-Period Comparative Analysis
- Evaluates the current 7-day reporting window against the immediately preceding 7-day period.
- Provides absolute change (`+X.XXXX PROS`) and percentage delta (`+Y.Y%`).
- Employs zero-denominator handling (`NEW` activity classification instead of dividing by zero).
- Includes plain-English agent interpretation for each metric.

### 4. Top 3 Notable Events
- Multi-factor algorithmic ranking based on:
  - Value magnitude in native `PROS`
  - Smart contract creation and deployments
  - On-chain transaction reverts and failures
  - Peak gas consumption and execution fees
- Full provenance for every ranked event: transaction hash, block number, timestamp, event type, amount, fee, block explorer link, and selection rationale.
- **Zero Hallucination Rule:** If fewer than 3 events qualify (e.g. 1 or 2), only qualifying events are shown alongside an explanatory disclosure. Never fabricates filler events.

### 5. Public Published Digest & Permalinks
- Reviewer-friendly, responsive web application accessible without login or authentication.
- Dedicated permalinks (`/digest/[id]`) for every published report.
- Historical archive (`/archive`) with search and filter capabilities.

---

## Target Network Configuration

- **Network:** Pharos Atlantic Testnet
- **Chain ID:** `688689` (`0xa8231`)
- **Native Currency:** `PROS` (18 decimals)
- **JSON-RPC Endpoint:** `https://atlantic.dplabs-internal.com`
- **Official MCP Server:** `https://mcp.pharos.xyz/mcp`
- **Block Explorer:** [https://atlantic.pharosscan.xyz](https://atlantic.pharosscan.xyz)

---

## Quick-Start Guide

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### Installation

```bash
git clone https://github.com/JimmyOgb/pharos-weekly-digest-agent.git
cd pharos-weekly-digest-agent
npm install
```

### Running Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Test Suite

Run the complete 12-stage test suite covering period boundaries, delta math, event ranking, duplicate protection, and live network integration:

```bash
npm test
```

### Generating a Digest via CLI

```bash
# Generate for default monitored wallet
npm run generate

# Generate for custom target wallet
npx tsx scripts/runDigest.ts --wallet=0x299ce4113abf88f4997737184aa8a7a3d58ac15c

# Force regenerate (bypass duplicate period check)
npx tsx scripts/runDigest.ts --force
```

### Building for Production

```bash
npm run build
npm start
```

---

## Autonomous Scheduler Configuration

### 1. GitHub Actions Workflow
The workflow at `.github/workflows/scheduled-digest.yml` runs every Monday at 00:00 UTC:
- Automatically fetches genuine on-chain observations.
- Prevents duplicate generation if the period is already archived.
- Commits and pushes new digest artifacts directly into the repository.
- Supports manual dispatch (`workflow_dispatch`) with custom wallet and force-run options.

### 2. Vercel Cron
Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/digest",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

---

## Environment Variables

| Variable | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PHAROS_RPC_URL` | Optional | `https://atlantic.dplabs-internal.com` | Official Pharos Atlantic Testnet RPC |
| `MCP_ENDPOINT` | Optional | `https://mcp.pharos.xyz/mcp` | Official Pharos Model Context Protocol server |
| `WALLET_ADDRESS` | Optional | `0x299ce4113abf88f4997737184aa8a7a3d58ac15c` | Default target wallet for periodic digestion |
| `FORCE_RUN` | Optional | `false` | Set `true` to bypass duplicate run detection |

---

## Data Provenance & Disclosures

1. **Read-Only Operation:** This agent strictly executes read-only JSON-RPC queries (`eth_getTransactionReceipt`, `eth_getBlockByNumber`, `eth_getBalance`) and official Pharos MCP tool calls (`get_chain_info`, `get_balance`, `get_logs`). It never requests or stores private keys, signs transactions, or spends gas.
2. **Strict Time Boundaries:** Periods are evaluated strictly within standard ISO-8601 intervals `[start, end)`.
3. **Receipt Verification:** Every transaction cited in top notable events contains verified on-chain transaction hashes with direct block explorer links.
4. **Historical Coverage:** Explorer transaction histories are indexed up to 300 recent transactions across the reporting span. In case of page boundary limits, data coverage is explicitly flagged as `PARTIAL` rather than silently truncated.
