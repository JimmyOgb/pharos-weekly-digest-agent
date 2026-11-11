import { RawPharosTx } from '../types';
import { callMcpTool } from './mcpClient';

export const PHAROS_NETWORK_NAME = 'Pharos Atlantic Testnet';
export const PHAROS_CHAIN_ID = 688689;
export const PHAROS_RPC_URL = process.env.PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com';
export const PHAROS_EXPLORER_URL = 'https://atlantic.pharosscan.xyz';
export const PHAROS_EXPLORER_API = 'https://api.socialscan.io/pharos-testnet/v1/explorer';

export interface BlockHeader {
  number: number;
  hash: string;
  timestamp: number;
}

export async function getLatestBlockNumber(): Promise<number> {
  // Try MCP tool first
  try {
    const mcpBlock = await callMcpTool('get_block_number');
    if (typeof mcpBlock === 'number') return mcpBlock;
    if (typeof mcpBlock === 'string') return parseInt(mcpBlock, 16);
    if (mcpBlock?.block_number) return Number(mcpBlock.block_number);
  } catch {
    // Graceful fallback to direct JSON-RPC
  }

  const res = await fetch(PHAROS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: []
    })
  });
  const data = await res.json();
  return parseInt(data.result, 16);
}

export async function getWalletBalancePros(address: string): Promise<string> {
  try {
    const mcpBal = await callMcpTool('get_balance', { address });
    if (mcpBal && typeof mcpBal === 'object' && mcpBal.balanceFormatted) {
      return mcpBal.balanceFormatted;
    }
  } catch {
    // fallback to RPC
  }

  const res = await fetch(PHAROS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getBalance',
      params: [address, 'latest']
    })
  });
  const data = await res.json();
  const wei = BigInt(data.result || '0x0');
  const whole = wei / 10n ** 18n;
  const fraction = wei % 10n ** 18n;
  const fracStr = fraction.toString().padStart(18, '0').slice(0, 4);
  return `${whole}.${fracStr}`;
}

/**
 * Fetches all indexed transactions for an address from the verified Pharos explorer API.
 */
export async function fetchAddressTransactions(
  address: string,
  maxPages = 3,
  pageSize = 100
): Promise<RawPharosTx[]> {
  const normalizedAddr = address.toLowerCase();
  const allTxs: RawPharosTx[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `${PHAROS_EXPLORER_API}/transactions?address=${normalizedAddr}&size=${pageSize}&page=${page}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Pharos-Weekly-Digest-Agent/1.0' },
        signal: AbortSignal.timeout(12000)
      });
      if (!res.ok) {
        break;
      }
      const json = await res.json();
      const items: any[] = json.data || [];
      if (items.length === 0) {
        break;
      }

      for (const item of items) {
        allTxs.push({
          hash: item.hash,
          from_address: item.from_address?.toLowerCase() || '',
          to_address: item.to_address?.toLowerCase() || '',
          value: item.value || '0',
          method: item.method || undefined,
          method_id: item.method_id || undefined,
          block_number: Number(item.block_number),
          block_timestamp: item.block_timestamp,
          transaction_fee: item.transaction_fee || undefined,
          receipt_status: item.receipt_status !== undefined ? Number(item.receipt_status) : undefined,
          receipt_gas_used: item.receipt_gas_used ? String(item.receipt_gas_used) : undefined,
          gas_price: item.gas_price ? String(item.gas_price) : undefined,
          receipt_contract_address: item.receipt_contract_address?.toLowerCase() || undefined
        });
      }

      if (items.length < pageSize) {
        break;
      }
    } catch (err: any) {
      console.warn(`[pharosFetcher] Page ${page} fetch warning for ${address}:`, err.message);
      break;
    }
  }

  return allTxs;
}

/**
 * Filter transactions falling strictly inside [startIso, endIso)
 */
export function filterTxsInPeriod(
  txs: RawPharosTx[],
  startIso: string,
  endIso: string
): RawPharosTx[] {
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();

  return txs.filter(tx => {
    const txMs = new Date(tx.block_timestamp).getTime();
    return txMs >= startMs && txMs < endMs;
  });
}
