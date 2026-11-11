# PHAROS TEST REPORT

**Project:** Pharos Weekly Digest Agent  
**Environment:** Node.js v24.15.0 / TypeScript 5.6.3 / Next.js 14.2.35  
**Test Runner:** `node:test` via `tsx --test`  
**Network:** Pharos Atlantic Testnet (`Chain ID: 688689`)  
**Execution Date:** November 11, 2026  

---

## 1. Summary of Test Execution

| Total Tests | Passed | Failed | Skipped | Test Duration | Verdict |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **12** | **12** | **0** | **0** | **7.68 seconds** | **100% PASSED** |

---

## 2. Detailed Test Results

| # | Test Case Description | Scope / Requirement | Duration | Result |
| :---: | :--- | :--- | :---: | :---: |
| **1** | Genuine Network Configuration | Validates Chain ID `688689` & Atlantic Testnet name | `39.7ms` | **PASS** |
| **2** | Correct Period Boundaries Filtering | Strict half-open interval `[start, end)` time windowing | `0.6ms` | **PASS** |
| **3** | Current-vs-Previous Comparison & Delta Math | Inflows, outflows, absolute delta & percentage calculations | `1.9ms` | **PASS** |
| **4** | Event Ranking with Multi-Factor Significance | Prioritizes on-chain reverts, deployments, magnitude, gas | `2.0ms` | **PASS** |
| **5** | Fewer Than Three Qualifying Events Handling | Zero filler hallucination, strict integrity disclaimer | `1.3ms` | **PASS** |
| **6** | Empty Activity Periods Handling | Clean zero metrics without erroring or fabricating events | `0.5ms` | **PASS** |
| **7** | Partial or Unavailable Source Data Distinction | Explicitly distinguishes `0` from `PARTIAL` / `UNAVAILABLE` | `0.3ms` | **PASS** |
| **8** | Duplicate Scheduled Runs Prevention | Idempotent period check preventing redundant runs | `17.0ms` | **PASS** |
| **9** | Safe Retry & Run Logging | Run records saved with timestamps, trigger, and latency | `5.3ms` | **PASS** |
| **10** | Persistence & Retrieval of Generated Digests | File system and memory persistence round-trip | `2.5ms` | **PASS** |
| **11** | Zero Denominator Comparison Math | Handled as `0%` or `NEW` rather than `NaN` or dividing by zero | `0.8ms` | **PASS** |
| **12** | Live End-to-End Invocations with Real Pharos Data | Live query against Atlantic RPC and MCP verifying receipts | `6822.3ms` | **PASS** |

---

## 3. Raw Execution Console Output

```text
✔ 1. Genuine Network Configuration (39.7274ms)
✔ 2. Correct Period Boundaries Filtering (0.6176ms)
✔ 3. Current-versus-Previous Comparison & Delta Math (1.8958ms)
✔ 4. Event Ranking with Multi-Factor Significance (1.9885ms)
✔ 5. Fewer Than Three Qualifying Events Handling (1.2562ms)
✔ 6. Empty Activity Periods Handling (0.4662ms)
✔ 7. Partial or Unavailable Source Data Distinction (0.2686ms)
✔ 8. Duplicate Scheduled Runs Prevention (17.0302ms)
✔ 9. Safe Retry & Run Logging (5.3311ms)
✔ 10. Persistence & Retrieval of Generated Digests (2.4532ms)
✔ 11. Zero Denominator Comparison Math (0.7683ms)
✔ 12. Live End-to-End Digest Engine Invocations with Real Pharos Atlantic Data (6822.3323ms)

ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7677.4714
```
