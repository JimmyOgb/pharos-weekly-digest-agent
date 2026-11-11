import { RawPharosTx, PeriodMetrics, DataCoverageStatus } from '../types';

export function computePeriodMetrics(
  txs: RawPharosTx[],
  targetAddress: string,
  periodStart: string,
  periodEnd: string,
  durationDays: number,
  coverageStatus: DataCoverageStatus = 'COMPLETE',
  disclosures: string[] = []
): PeriodMetrics {
  const target = targetAddress.toLowerCase();

  let successCount = 0;
  let failedCount = 0;
  let nativeInflowWei = 0n;
  let nativeOutflowWei = 0n;
  let totalGasUsedBig = 0n;
  let gasCostWei = 0n;
  let contractInteractions = 0;
  let contractCreations = 0;
  const uniqueContracts = new Set<string>();

  for (const tx of txs) {
    // Status
    if (tx.receipt_status === 1) {
      successCount++;
    } else if (tx.receipt_status === 0) {
      failedCount++;
    } else {
      // In absence of explicit receipt_status, treat as success if on chain
      successCount++;
    }

    // Inflow / Outflow
    const valWei = BigInt(tx.value || '0');
    if (tx.to_address === target && tx.from_address !== target) {
      nativeInflowWei += valWei;
    }
    if (tx.from_address === target) {
      nativeOutflowWei += valWei;

      // Only sender pays gas
      if (tx.receipt_gas_used) {
        totalGasUsedBig += BigInt(tx.receipt_gas_used);
      }
      if (tx.transaction_fee) {
        // e.g. "0.006493524" PROS
        const parts = tx.transaction_fee.split('.');
        const whole = BigInt(parts[0] || '0') * 10n ** 18n;
        const fracStr = (parts[1] || '').padEnd(18, '0').slice(0, 18);
        const frac = BigInt(fracStr);
        gasCostWei += (whole + frac);
      }
    }

    // Contract interactions & creations
    if (tx.method === 'Contract Creation' || tx.receipt_contract_address) {
      contractCreations++;
      if (tx.receipt_contract_address) {
        uniqueContracts.add(tx.receipt_contract_address.toLowerCase());
      }
    } else if (tx.to_address && tx.to_address !== target) {
      contractInteractions++;
      uniqueContracts.add(tx.to_address.toLowerCase());
    }
  }

  const netNativeWei = nativeInflowWei - nativeOutflowWei;

  const toProsFloat = (wei: bigint): number => {
    const isNeg = wei < 0n;
    const abs = isNeg ? -wei : wei;
    const whole = Number(abs / 10n ** 18n);
    const frac = Number(abs % 10n ** 18n) / 1e18;
    const total = whole + frac;
    return isNeg ? -total : total;
  };

  return {
    periodStart,
    periodEnd,
    durationDays,
    txCount: txs.length,
    successCount,
    failedCount,
    nativeInflowPros: Number(toProsFloat(nativeInflowWei).toFixed(6)),
    nativeOutflowPros: Number(toProsFloat(nativeOutflowWei).toFixed(6)),
    netNativeChangePros: Number(toProsFloat(netNativeWei).toFixed(6)),
    totalGasUsed: totalGasUsedBig.toString(),
    gasCostPros: Number(toProsFloat(gasCostWei).toFixed(6)),
    contractInteractions,
    contractCreations,
    uniqueContractsInteracted: Array.from(uniqueContracts),
    dataCoverage: coverageStatus,
    coverageDisclosures: disclosures
  };
}
