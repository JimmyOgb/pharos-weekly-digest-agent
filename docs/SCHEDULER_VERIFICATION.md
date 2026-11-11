# PHAROS SCHEDULER & AUTOMATION VERIFICATION REPORT

**Target Agent:** Pharos Weekly Digest Agent  
**Environment:** GitHub Actions Scheduled Cron & Vercel Cron  
**Network:** Pharos Atlantic Testnet (`Chain ID: 688689`)  
**Audit Date:** November 11, 2026  

---

## 1. Scheduler Configuration Specifications

### A. GitHub Actions Cron Workflow
- **Workflow File:** `.github/workflows/scheduled-digest.yml`
- **Schedule Cron:** `0 0 * * 1` (Weekly, every Monday at 00:00:00 UTC)
- **Manual Trigger Support:** `workflow_dispatch` enabled with inputs:
  - `wallet`: target address (default: `0x299ce4113abf88f4997737184aa8a7a3d58ac15c`)
  - `force`: boolean (default: `false`)
- **Execution Script:** `npx tsx scripts/runDigest.ts`
- **Artifact Persistence:** Automatically commits and pushes new files in `data/digests/` and `data/runs/run_history.json`.

### B. Vercel Cron Configuration
- **Configuration File:** `vercel.json`
- **Endpoint:** `/api/cron/digest`
- **Schedule Cron:** `0 0 * * 1` (Weekly, Mondays 00:00 UTC)
- **Authorization & Trigger:** Handles `GET` and `POST` requests and executes `generateWeeklyDigest` with `trigger: 'CRON'`.

---

## 2. Live Invocation Evidence

### Invocation 1: Initial Autonomous Scheduled Run
- **Command:** `npx tsx scripts/runDigest.ts`
- **Trigger Type:** `SCHEDULED`
- **Normalized Period:** `2026-11-04T04:00:00.000Z` → `2026-11-11T04:00:00.000Z`
- **Execution Output:**
```text
=======================================================
 PHAROS WEEKLY DIGEST AGENT — AUTONOMOUS RUNNER
=======================================================
Target Wallet:  0x299ce4113abf88f4997737184aa8a7a3d58ac15c
Trigger:        SCHEDULED
Force Run:      false
Network:        Pharos Atlantic Testnet (Chain ID 688689)
-------------------------------------------------------
Execution Success: true
Run Status:        SUCCESS
Duration:          6621ms
Message:           Weekly digest successfully generated for 0x299ce4113abf88f4997737184aa8a7a3d58ac15c. Current period txs: 105, previous: 7.

--- DIGEST METRICS SUMMARY ---
Digest ID:         digest_1794371511341_299ce4
Reporting Period:  2026-11-04T04:00:00.000Z to 2026-11-11T04:00:00.000Z
Current Txs:       105 (105 succ / 0 fail)
Native Inflow:     +0 PROS
Native Outflow:    -0 PROS
Net Shift:         0 PROS
Gas Cost:          0.026111 PROS
Top Events:        3 ranked
Permalink:         /digest/digest_1794371511341_299ce4
```

---

## 3. Duplicate Run Protection Evidence

### Invocation 2: Immediate Repeat Execution
- **Command:** `npx tsx scripts/runDigest.ts`
- **Trigger Type:** `SCHEDULED`
- **Force Flag:** `false`
- **Execution Output:**
```text
=======================================================
 PHAROS WEEKLY DIGEST AGENT — AUTONOMOUS RUNNER
=======================================================
Target Wallet:  0x299ce4113abf88f4997737184aa8a7a3d58ac15c
Trigger:        SCHEDULED
Force Run:      false
Network:        Pharos Atlantic Testnet (Chain ID 688689)
-------------------------------------------------------
Execution Success: true
Run Status:        SKIPPED_DUPLICATE
Duration:          10ms
Message:           Digest already exists for period 2026-11-04T04:00:00.000Z to 2026-11-11T04:00:00.000Z. Duplicate generation prevented.
Digest ID:         digest_1794371511341_299ce4
```

**Verification Verdict:**
Duplicate execution was prevented in `10ms`. No duplicate digest was generated, and a `SKIPPED_DUPLICATE` run audit record was added to `run_history.json`.

---

## 4. Run History & Audit Records

Sample entry from `data/runs/run_history.json`:
```json
[
  {
    "runId": "run_1794371526487_8k2la",
    "timestamp": "2026-11-11T04:32:06.497Z",
    "trigger": "SCHEDULED",
    "status": "SKIPPED_DUPLICATE",
    "walletAddress": "0x299ce4113abf88f4997737184aa8a7a3d58ac15c",
    "periodStart": "2026-11-04T04:00:00.000Z",
    "periodEnd": "2026-11-11T04:00:00.000Z",
    "digestId": "digest_1794371511341_299ce4",
    "durationMs": 10,
    "message": "Digest already exists for period 2026-11-04T04:00:00.000Z to 2026-11-11T04:00:00.000Z. Duplicate generation prevented."
  },
  {
    "runId": "run_1794371511341_532ab",
    "timestamp": "2026-11-11T04:31:57.962Z",
    "trigger": "SCHEDULED",
    "status": "SUCCESS",
    "walletAddress": "0x299ce4113abf88f4997737184aa8a7a3d58ac15c",
    "periodStart": "2026-11-04T04:00:00.000Z",
    "periodEnd": "2026-11-11T04:00:00.000Z",
    "digestId": "digest_1794371511341_299ce4",
    "durationMs": 6621,
    "message": "Weekly digest successfully generated for 0x299ce4113abf88f4997737184aa8a7a3d58ac15c. Current period txs: 105, previous: 7."
  }
]
```

---

## 5. Next Scheduled Execution

- **Next Weekly Execution Time:** Monday, November 16, 2026 at `00:00:00 UTC`
- **Execution Target:** `0x299ce4113abf88f4997737184aa8a7a3d58ac15c`
- **Trigger Channel:** GitHub Actions `.github/workflows/scheduled-digest.yml` & Vercel `/api/cron/digest`
