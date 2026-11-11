# PHAROS TASK REQUIREMENTS AUDIT
## Task: Weekly Digest Agent (MediumSupport / Reporting)

**Official Arena Task Page:** [https://pharos-agent-arena.vercel.app/tasks/weekly-digest-agent](https://pharos-agent-arena.vercel.app/tasks/weekly-digest-agent)  
**Task Category:** Medium Support / Reporting  
**Base Points:** 100  
**Optional Video Bonus:** +50  
**Total Points Available:** 150  
**Date Audited:** November 11, 2026  
**Auditor:** Pharos Engineering Agent  

---

## 1. Official Task Requirements & Scope

According to the official Pharos Agent Arena task specification:

> **What you'll build:**  
> An agent that produces a periodic summary of a wallet's or protocol's activity, covering what changed, key numbers and notable events, and delivers it on a schedule.

### The 4 Core Scoring Requirements

| # | Requirement | Official Description | Implementation Strategy | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Runs on a schedule** | Weekly by default, configurable schedule and timezone. Supports manual trigger, run history, duplicate protection, safe retry. | GitHub Actions scheduled cron workflow (`.github/workflows/scheduled-digest.yml`), Vercel cron configuration (`vercel.json`), plus authenticated manual trigger API (`POST /api/digest/generate`). | Persisted run history with ISO timestamps, run duration, schedule status, duplicate-run detection tests, and workflow dispatch runs. |
| **02** | **Covers key metrics with previous-period comparison** | Summary of what changed: tx count, success/fail counts, native token inflows & outflows, token transfers, gas expenditure, active contract interactions. Compared to previous equivalent period. | On-chain aggregation engine querying Pharos Atlantic Testnet. Strict period windowing with ISO timestamps. Computation of absolute change and percentage change. Explicit distinction between `0`, `UNKNOWN`, `UNAVAILABLE`, and `PARTIAL`. | Live comparison table showing current period vs. previous period with absolute and percentage deltas. Unit tests verifying zero-denominator and edge cases. |
| **03** | **Highlights top 3 notable events** | Top 3 notable events of the period (e.g., largest value transfer, contract deployment, highest gas, failed tx). | Multi-factor event scoring algorithm: ranks events by value magnitude, gas expenditure, transaction failure, and novel contract creation. If fewer than 3 qualify (e.g. 1 or 2), agent renders only qualifying events and states the reason without fabricating fillers. | Explicit itemization with transaction hash, block number, timestamp, event type, amount, gas, reason for selection, and direct clickable block explorer link (`https://atlantic.pharosscan.xyz/tx/...`). |
| **04** | **Delivers to a real channel or published page** | Delivers to a real channel (email, Telegram, Discord) or as a published page readable without login. | Publicly accessible Next.js/Tailwind web application deployed on Vercel with dedicated digest permalinks (`/digest/[id]`), latest digest view (`/`), historical archive (`/archive`), and manual digest generation dashboard. | Live production URL reachable via public internet without authentication, tested via HTTP GET, rendering complete digest cards with responsiveness and dark mode. |

---

## 2. Submission Requirements & Proof Criteria

| Submission Field | Official Requirement | Project Implementation |
| :--- | :--- | :--- |
| **Proof Link** | "A proof link reviewers can open — a share link from ai.pharos.xyz, a tx hash on the explorer, or a deployed demo." | Production Vercel deployment URL (`https://pharos-weekly-digest.vercel.app`) featuring the live digest dashboard and permalinks. |
| **Repo Link** | "A repo link if you wrote code." | Public GitHub repository under `JimmyOgb`: `https://github.com/JimmyOgb/pharos-weekly-digest-agent` |
| **Optional Video** | "+50 points for video walking through build." | Documented pipeline ready for optional recording; stopped per instructions waiting for user approval. |

---

## 3. Official Resources & Infrastructure Audit

| Resource | Official URL / Specification | Operational Status & Capabilities |
| :--- | :--- | :--- |
| **Pharos AI** | `https://ai.pharos.xyz` | Live web interface for agent prompts and skill discovery. |
| **Pharos Docs** | `https://docs.pharos.xyz` | Official technical documentation for smart contract development and integration. |
| **Pharos DevHub** | `https://www.pharos.xyz/devhub` | Resource hub and guidelines for Season of AI arena builders. |
| **Pharos MCP Server** | `https://mcp.pharos.xyz/mcp` | Official JSON-RPC over HTTP/SSE endpoint. Verified active. Tools include `get_chain_info`, `get_block_number`, `get_balance`, `get_transaction_count`, `get_gas_price`, `get_block`, `get_transaction`, `get_transaction_receipt`, `get_logs`, `eth_call`. |
| **Pharos Atlantic RPC** | `https://atlantic.dplabs-internal.com` | Verified active. Chain ID `688689` (`0xa8231`), latest block > 32,608,000. Fast JSON-RPC responses for state and receipt verification. |
| **Pharos Atlantic Explorer** | `https://atlantic.pharosscan.xyz` | Blockscout/SocialScan web explorer for transaction and address inspection. |
| **Pharos Explorer API** | `https://api.socialscan.io/pharos-testnet/v1/explorer/transactions` | Verified active indexed REST API supporting address transaction histories with timestamps, status, gas used, and method IDs. |

---

## 4. Requirement-to-Implementation Traceability Matrix

| Requirement ID | Code Component | Test Suite | Deployment Check |
| :--- | :--- | :--- | :--- |
| **REQ-01: Scheduled Execution** | `src/services/scheduler.ts`<br>`.github/workflows/scheduled-digest.yml`<br>`vercel.json` | `tests/scheduler.test.ts` | Verify GitHub Actions workflow run & Vercel cron route `/api/cron/digest` |
| **REQ-02: Key Metrics & Period Comparison** | `src/services/metricsEngine.ts`<br>`src/services/comparator.ts` | `tests/metrics.test.ts`<br>`tests/comparator.test.ts` | Verify mathematical delta calculations, zero handling, and live metrics table |
| **REQ-03: Top 3 Notable Events** | `src/services/eventRanker.ts` | `tests/ranker.test.ts` | Verify event selection criteria, sorting, and <=3 event display |
| **REQ-04: Published Digest Page** | `src/app/page.tsx`<br>`src/app/digest/[id]/page.tsx`<br>`src/components/DigestCard.tsx` | `tests/render.test.ts` | Verify public accessibility, live browser render, and responsive UI |
| **REQ-05: Trust & Data Integrity** | `src/services/pharosFetcher.ts`<br>`src/services/mcpClient.ts` | `tests/liveIntegration.test.ts` | Raw on-chain receipt verification against Atlantic Testnet (Chain ID 688689) |
| **REQ-06: Duplicate-Run Protection** | `src/services/storage.ts` | `tests/duplicateProtection.test.ts` | Verify idempotent hashing per period and wallet |

---

## 5. Security & Zero-Cost Compliance

- **No Private Keys / Signing:** The agent operates strictly on read-only EVM state, RPC queries, and MCP tool calls. No transactions are broadcast and no private keys are requested or held.
- **Zero Paid Services:** Utilizes free GitHub Actions cron compute, free Vercel hosting tier, and public Pharos RPC/MCP infrastructure. No paid APIs or databases required.
- **Strict Data Provenance:** Every metric identifies the exact network (`Pharos Atlantic Testnet`, Chain ID `688689`), block range, timestamp interval, and verification status.
