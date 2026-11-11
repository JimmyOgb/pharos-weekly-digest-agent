import { RawPharosTx, NotableEvent } from '../types';
import { PHAROS_EXPLORER_URL } from './pharosFetcher';

export interface RankerResult {
  notableEvents: NotableEvent[];
  explanation: string;
}

export function rankNotableEvents(
  txs: RawPharosTx[],
  targetAddress: string
): RankerResult {
  const target = targetAddress.toLowerCase();
  const scoredEvents: NotableEvent[] = [];

  for (const tx of txs) {
    const valWei = BigInt(tx.value || '0');
    const valPros = Number(valWei) / 1e18;
    const isOutbound = tx.from_address === target;
    const isInbound = tx.to_address === target;
    const isFailed = tx.receipt_status === 0;
    const isContractCreation = tx.method === 'Contract Creation' || !!tx.receipt_contract_address;

    let feePros = '0';
    if (tx.transaction_fee) {
      feePros = tx.transaction_fee;
    } else if (tx.receipt_gas_used && tx.gas_price) {
      const gUsed = BigInt(tx.receipt_gas_used);
      const gPrice = BigInt(tx.gas_price);
      const feeWei = gUsed * gPrice;
      feePros = (Number(feeWei) / 1e18).toFixed(6);
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Transaction Failure
    if (isFailed) {
      score += 150;
      reasons.push('Execution failed/reverted on chain');
    }

    // 2. Smart Contract Deployment
    if (isContractCreation) {
      score += 120;
      reasons.push(`Contract creation initiated (deployed address: ${tx.receipt_contract_address || 'pending'})`);
    }

    // 3. Native Value Transfer Magnitude
    if (valPros > 0) {
      const magnitudeScore = Math.min(100, Math.log10(valPros + 1) * 30);
      score += magnitudeScore;
      if (valPros >= 0.01) {
        reasons.push(`${isOutbound ? 'Outbound' : 'Inbound'} native PROS transfer of ${valPros.toFixed(4)} PROS`);
      }
    }

    // 4. Gas Expenditure Magnitude
    const feeNum = parseFloat(feePros);
    if (feeNum > 0.005) {
      score += 40;
      reasons.push(`High transaction execution fee (${feePros} PROS)`);
    }

    // 5. Significant Contract Call
    if (tx.method && tx.method !== 'Transfer' && !isContractCreation) {
      score += 25;
      reasons.push(`Protocol contract interaction: ${tx.method}`);
    } else if (tx.method_id && !tx.method) {
      score += 15;
      reasons.push(`Contract interaction method: ${tx.method_id}`);
    }

    // Determine event classification
    let eventType = 'Native Transfer';
    if (isContractCreation) {
      eventType = 'Contract Deployment';
    } else if (isFailed) {
      eventType = 'Failed Transaction';
    } else if (tx.method) {
      eventType = tx.method;
    } else if (tx.method_id) {
      eventType = `Call (${tx.method_id})`;
    }

    if (score > 0) {
      scoredEvents.push({
        txHash: tx.hash,
        blockNumber: tx.block_number,
        timestamp: tx.block_timestamp,
        eventType,
        amount: valPros > 0 ? `${valPros.toFixed(4)} PROS` : '0 PROS',
        token: 'PROS',
        gasUsed: tx.receipt_gas_used || 'UNKNOWN',
        feePros,
        explorerUrl: `${PHAROS_EXPLORER_URL}/tx/${tx.hash}`,
        reason: reasons.length > 0 ? reasons.join('; ') : 'Observed on-chain transaction',
        score
      });
    }
  }

  // Sort descending by score, tiebreak by block number descending
  scoredEvents.sort((a, b) => b.score - a.score || b.blockNumber - a.blockNumber);

  // Take up to 3 genuinely notable events
  const topEvents = scoredEvents.slice(0, 3);

  let explanation = '';
  if (topEvents.length === 0) {
    explanation = 'No notable transactions or contract events occurred during this reporting period.';
  } else if (topEvents.length < 3) {
    explanation = `Only ${topEvents.length} transaction(s) met the criteria for notable significance during this period. No synthetic filler events were created, ensuring strict data integrity.`;
  } else {
    explanation = 'Top 3 notable events ranked by on-chain value magnitude, contract creation significance, execution status, and gas consumption.';
  }

  return {
    notableEvents: topEvents,
    explanation
  };
}
