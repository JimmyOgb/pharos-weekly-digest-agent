import fs from 'fs';
import path from 'path';
import { DigestReport, RunRecord } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DIGESTS_DIR = path.join(DATA_DIR, 'digests');
const RUNS_FILE = path.join(DATA_DIR, 'runs', 'run_history.json');

// In-memory fallback for serverless environments with read-only root FS
const memoryDigests = new Map<string, DigestReport>();
const memoryRuns: RunRecord[] = [];

function ensureDirs() {
  try {
    if (!fs.existsSync(DIGESTS_DIR)) {
      fs.mkdirSync(DIGESTS_DIR, { recursive: true });
    }
    const runsDir = path.dirname(RUNS_FILE);
    if (!fs.existsSync(runsDir)) {
      fs.mkdirSync(runsDir, { recursive: true });
    }
  } catch {
    // Ignore in read-only environments
  }
}

export function saveDigest(digest: DigestReport): void {
  memoryDigests.set(digest.id, digest);

  try {
    ensureDirs();
    const filePath = path.join(DIGESTS_DIR, `${digest.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(digest, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[storage] Warning saving digest to disk (memory retained):', err.message);
  }
}

export function getDigestById(id: string): DigestReport | null {
  if (memoryDigests.has(id)) {
    return memoryDigests.get(id)!;
  }

  try {
    const filePath = path.join(DIGESTS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      memoryDigests.set(id, data);
      return data;
    }
  } catch (err: any) {
    console.warn('[storage] Error reading digest from disk:', err.message);
  }

  return null;
}

export function listAllDigests(): DigestReport[] {
  const map = new Map<string, DigestReport>(memoryDigests);

  try {
    ensureDirs();
    if (fs.existsSync(DIGESTS_DIR)) {
      const files = fs.readdirSync(DIGESTS_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(DIGESTS_DIR, file), 'utf8'));
          if (content && content.id) {
            map.set(content.id, content);
          }
        } catch {}
      }
    }
  } catch (err: any) {
    console.warn('[storage] Error reading digests directory:', err.message);
  }

  const list = Array.from(map.values());
  // Sort descending by generatedAt
  list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  return list;
}

export function getLatestDigest(walletAddress?: string): DigestReport | null {
  const digests = listAllDigests();
  if (!walletAddress) {
    return digests[0] || null;
  }
  const target = walletAddress.toLowerCase();
  return digests.find(d => d.walletAddress.toLowerCase() === target) || null;
}

export function isDuplicateRun(
  walletAddress: string,
  periodStart: string,
  periodEnd: string
): { isDuplicate: boolean; existingDigestId?: string } {
  const target = walletAddress.toLowerCase();
  const digests = listAllDigests();

  const found = digests.find(d => 
    d.walletAddress.toLowerCase() === target &&
    d.reportingPeriod.start === periodStart &&
    d.reportingPeriod.end === periodEnd
  );

  if (found) {
    return { isDuplicate: true, existingDigestId: found.id };
  }
  return { isDuplicate: false };
}

export function saveRunRecord(run: RunRecord): void {
  memoryRuns.unshift(run);

  try {
    ensureDirs();
    let runs: RunRecord[] = [];
    if (fs.existsSync(RUNS_FILE)) {
      runs = JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8'));
    }
    runs.unshift(run);
    // keep latest 100 runs
    if (runs.length > 100) {
      runs = runs.slice(0, 100);
    }
    fs.writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[storage] Warning saving run record to disk:', err.message);
  }
}

export function listRunRecords(): RunRecord[] {
  const seen = new Set<string>();
  const combined: RunRecord[] = [];

  for (const r of memoryRuns) {
    if (!seen.has(r.runId)) {
      seen.add(r.runId);
      combined.push(r);
    }
  }

  try {
    if (fs.existsSync(RUNS_FILE)) {
      const fromDisk: RunRecord[] = JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8'));
      for (const r of fromDisk) {
        if (!seen.has(r.runId)) {
          seen.add(r.runId);
          combined.push(r);
        }
      }
    }
  } catch {}

  combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return combined;
}
