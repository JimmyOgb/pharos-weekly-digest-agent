export type DataCoverageStatus = 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';

export type DigestStatus = 'CURRENT' | 'STALE' | 'PARTIAL' | 'EMPTY' | 'FAILED';

export type RunTrigger = 'SCHEDULED' | 'MANUAL' | 'WORKFLOW_DISPATCH' | 'CRON';

export type RunStatus = 'SUCCESS' | 'SKIPPED_DUPLICATE' | 'FAILED';

export interface RawPharosTx {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  method?: string;
  method_id?: string;
  block_number: number;
  block_timestamp: string;
  transaction_fee?: string;
  receipt_status?: number;
  receipt_gas_used?: string;
  gas_price?: string;
  receipt_contract_address?: string;
}

export interface PeriodMetrics {
  periodStart: string;
  periodEnd: string;
  durationDays: number;
  txCount: number;
  successCount: number;
  failedCount: number;
  nativeInflowPros: number;
  nativeOutflowPros: number;
  netNativeChangePros: number;
  totalGasUsed: string;
  gasCostPros: number;
  contractInteractions: number;
  contractCreations: number;
  uniqueContractsInteracted: string[];
  dataCoverage: DataCoverageStatus;
  coverageDisclosures: string[];
}

export interface MetricComparison {
  key: string;
  label: string;
  currentValue: number | string;
  previousValue: number | string;
  absoluteChange: number | string;
  percentChange: number | string | null;
  unit: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL' | 'N/A';
  interpretation: string;
}

export interface NotableEvent {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: string;
  amount: string;
  token: string;
  gasUsed: string;
  feePros: string;
  explorerUrl: string;
  reason: string;
  score: number;
}

export interface DigestReport {
  id: string;
  walletAddress: string;
  network: string;
  chainId: number;
  generatedAt: string;
  status: DigestStatus;
  reportingPeriod: {
    start: string;
    end: string;
    durationDays: number;
  };
  previousPeriod: {
    start: string;
    end: string;
    durationDays: number;
  };
  currentMetrics: PeriodMetrics;
  previousMetrics: PeriodMetrics;
  comparisons: MetricComparison[];
  notableEvents: NotableEvent[];
  notableEventsExplanation: string;
  sourceDisclosures: {
    rpcUrl: string;
    mcpEndpoint: string;
    explorerUrl: string;
    historicalIndexingNote: string;
    verificationMethod: string;
  };
  provenance: {
    rawTxCountCurrent: number;
    rawTxCountPrevious: number;
    mcpVerified: boolean;
    rpcVerified: boolean;
    latestBlockAtRun: number;
  };
}

export interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  targetWallet: string;
  lookbackDays: number;
}

export interface RunRecord {
  runId: string;
  timestamp: string;
  trigger: RunTrigger;
  status: RunStatus;
  walletAddress: string;
  periodStart: string;
  periodEnd: string;
  digestId?: string;
  durationMs: number;
  message: string;
}
