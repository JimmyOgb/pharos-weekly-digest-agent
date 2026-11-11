import { PeriodMetrics, MetricComparison } from '../types';

export function comparePeriodMetrics(
  current: PeriodMetrics,
  previous: PeriodMetrics
): MetricComparison[] {
  const comparisons: MetricComparison[] = [];

  const addComp = (
    key: string,
    label: string,
    currVal: number,
    prevVal: number,
    unit: string,
    higherIsPositive = true
  ) => {
    const diff = currVal - prevVal;
    let pct: number | null = null;
    let trend: 'UP' | 'DOWN' | 'NEUTRAL' | 'N/A' = 'NEUTRAL';
    let interpretation = '';

    if (prevVal === 0) {
      if (currVal === 0) {
        pct = 0;
        trend = 'NEUTRAL';
        interpretation = 'No activity in either period';
      } else {
        pct = null;
        trend = currVal > 0 ? 'UP' : 'DOWN';
        interpretation = `New activity: ${currVal > 0 ? '+' : ''}${currVal.toFixed(unit === 'PROS' ? 4 : 0)} ${unit} from zero`;
      }
    } else {
      pct = Number(((diff / Math.abs(prevVal)) * 100).toFixed(1));
      if (pct > 0) {
        trend = 'UP';
        interpretation = `Increased by ${pct}% (+${diff.toFixed(unit === 'PROS' ? 4 : 0)} ${unit})`;
      } else if (pct < 0) {
        trend = 'DOWN';
        interpretation = `Decreased by ${Math.abs(pct)}% (${diff.toFixed(unit === 'PROS' ? 4 : 0)} ${unit})`;
      } else {
        trend = 'NEUTRAL';
        interpretation = 'Unchanged from previous period';
      }
    }

    // Format absolute change
    const absChangeFormatted = (diff >= 0 ? '+' : '') + (unit === 'PROS' ? diff.toFixed(4) : diff.toString());

    comparisons.push({
      key,
      label,
      currentValue: unit === 'PROS' ? Number(currVal.toFixed(4)) : currVal,
      previousValue: unit === 'PROS' ? Number(prevVal.toFixed(4)) : prevVal,
      absoluteChange: absChangeFormatted,
      percentChange: pct,
      unit,
      trend,
      interpretation
    });
  };

  // 1. Transaction count
  addComp('txCount', 'Total Transactions', current.txCount, previous.txCount, 'txs');

  // 2. Successful transactions
  addComp('successCount', 'Successful Transactions', current.successCount, previous.successCount, 'txs');

  // 3. Failed transactions
  addComp('failedCount', 'Failed Transactions', current.failedCount, previous.failedCount, 'txs', false);

  // 4. Native Inflow
  addComp('nativeInflow', 'Native PROS Inflow', current.nativeInflowPros, previous.nativeInflowPros, 'PROS');

  // 5. Native Outflow
  addComp('nativeOutflow', 'Native PROS Outflow', current.nativeOutflowPros, previous.nativeOutflowPros, 'PROS');

  // 6. Net Change
  addComp('netNativeChange', 'Net Native Balance Shift', current.netNativeChangePros, previous.netNativeChangePros, 'PROS');

  // 7. Gas Expenditure
  addComp('gasCost', 'Gas Expenditure', current.gasCostPros, previous.gasCostPros, 'PROS', false);

  // 8. Contract Interactions
  addComp('contractInteractions', 'Contract Interactions', current.contractInteractions, previous.contractInteractions, 'calls');

  return comparisons;
}
