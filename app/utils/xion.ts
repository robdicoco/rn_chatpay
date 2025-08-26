/**
 * xion.ts
 * Utilitários para integração React Native + Abstraxion com XION (testnet-2)
 *
 * - Consulta de histórico de transações (REST, MsgSend)
 * - Consulta de saldo e info de conta (REST)
 * - Consulta de blocos (REST tendermint)
 * - Envio de tokens e execução de contratos via Abstraxion
 * - Consulta de contratos via REST (base64)
 * - Hook useXionApi() para expor API centralizada
 */

import { Buffer } from "buffer";
import { useMemo } from "react";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";

/** =========================
 *  CONFIG
 *  ========================= */
export const XION = {
  RPC: process.env.EXPO_PUBLIC_RPC_ENDPOINT?.replace(/\/+$/, "") || "https://rpc.xion-testnet-2.burnt.com",
  REST: process.env.EXPO_PUBLIC_REST_ENDPOINT?.replace(/\/+$/, "") || "https://api.xion-testnet-2.burnt.com",
  CHAIN_ID: "xion-testnet-2",
  BASE_DENOM: "uxion",
  DISPLAY_DENOM: "XION",
  DISPLAY_FACTOR: 1_000_000, // 1 XION = 1_000_000 uxion
} as const;

/** =========================
 *  TYPES
 *  ========================= */
export interface Transaction {
  height: number;
  hash: string;
  timestamp: string;
  type: string;
  amount: string;     // human (XION), e.g. "1.234"
  denom: string;      // e.g. "XION" or other
  sender: string;
  recipient: string;
}

export interface Balance {
  denom: string;      // e.g. "uxion"
  amount: string;     // raw, in base denom (uxion)
}

/** =========================
 *  HELPERS
 *  ========================= */
// Helpers
const stripTrailSlash = (s: string) => s.replace(/\/+$/, "");
const toBase64 = (data: string) => Buffer.from(data).toString("base64");
export function toDisplayFromBase(amountInBase: string, factor = XION.DISPLAY_FACTOR): string {
  const v = Number(amountInBase) / factor;
  return Number.isFinite(v) ? v.toString() : "0";
}
function pick<T>(val: T | undefined, fallback: T): T {
  return typeof val === "undefined" || val === null ? fallback : val;
}

// =========================
// ACCOUNTS (REST)
// =========================
export async function getAccountBalances(address: string): Promise<Balance[]> {
  const url = `${stripTrailSlash(XION.REST)}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=100`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch balances");
  const json = await r.json();
  return (json?.balances ?? []) as Balance[];
}

export async function getAccountInfo(address: string) {
  const url = `${stripTrailSlash(XION.REST)}/cosmos/auth/v1beta1/accounts/${address}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch account info");
  return r.json();
}

// =========================
// BLOCKS (REST)
// =========================
export async function getLatestBlock() {
  const url = `${stripTrailSlash(XION.REST)}/cosmos/base/tendermint/v1beta1/blocks/latest`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch latest block");
  return r.json();
}

export async function getLatestBlockHeight(): Promise<number> {
  const latest = await getLatestBlock();
  const heightStr = latest?.block?.header?.height ?? latest?.sdk_block?.header?.height;
  return Number(heightStr ?? 0);
}

export async function getBlockByHeight(height: number) {
  const url = `${stripTrailSlash(XION.REST)}/cosmos/base/tendermint/v1beta1/blocks/${height}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch block");
  return r.json();
}

// =========================
// TRANSAÇÕES (REST)
// =========================
type TxResp = {
  txs: any[];
  tx_responses: Array<{
    height: string;
    txhash: string;
    timestamp: string;
    tx?: any;
  }>;
  pagination?: { next_key?: string | null };
};

/**
 * Busca transações por evento (query REST)
 */
async function fetchTxsByEvent(event: string, limit = 50) {
  const base = `${stripTrailSlash(XION.REST)}/cosmos/tx/v1beta1/txs`;
  const out: TxResp["tx_responses"] = [];
  let key: string | undefined;
  while (out.length < limit) {
    let url = `${base}?query=${encodeURIComponent(event)}&order_by=ORDER_BY_DESC`;
    if (key) url += `&pagination.key=${key}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to fetch txs for event: ${event} (HTTP ${r.status})`);
    const json: TxResp = await r.json();
    out.push(...(json?.tx_responses ?? []));
    key = json?.pagination?.next_key ?? undefined;
    if (!key) break;
  }
  return out.slice(0, limit);
}

/**
 * Normaliza MsgSend (direto ou via Authz) para Transaction
 */
export function normalizeTxResponse(txResp: any): Transaction[] {
  const height = Number(txResp?.height ?? 0);
  const hash = txResp?.txhash ?? "";
  const timestamp = txResp?.timestamp ?? "";
  const msgs = txResp?.tx?.body?.messages ?? [];
  const txs: Transaction[] = [];
  for (const msg of msgs) {
    const type = msg?.["@type"] || msg?.typeUrl || "unknown";
    // MsgSend direto
    if (type.includes("cosmos.bank.v1beta1.MsgSend")) {
      const amounts = msg?.amount ?? msg?.value?.amount ?? [];
      const coin = amounts?.[0] ?? {};
      const baseDenom = coin?.denom ?? XION.BASE_DENOM;
      const denom = baseDenom === XION.BASE_DENOM ? XION.DISPLAY_DENOM : baseDenom;
      const amount = coin?.amount ? toDisplayFromBase(coin.amount, XION.DISPLAY_FACTOR) : "0";
      const sender = msg?.fromAddress ?? msg?.from_address ?? "";
      const recipient = msg?.toAddress ?? msg?.to_address ?? "";
      txs.push({ height, hash, timestamp, type, amount, denom, sender, recipient });
    }
    // MsgExec (Authz) - pode conter vários MsgSend
    if (type.includes("cosmos.authz.v1beta1.MsgExec")) {
      const innerMsgs = msg?.msgs ?? [];
      for (const inner of innerMsgs) {
        const innerType = inner?.["@type"] || inner?.typeUrl || "";
        if (innerType.includes("cosmos.bank.v1beta1.MsgSend")) {
          const amounts = inner?.amount ?? inner?.value?.amount ?? [];
          const coin = amounts?.[0] ?? {};
          const baseDenom = coin?.denom ?? XION.BASE_DENOM;
          const denom = baseDenom === XION.BASE_DENOM ? XION.DISPLAY_DENOM : baseDenom;
          const amount = coin?.amount ? toDisplayFromBase(coin.amount, XION.DISPLAY_FACTOR) : "0";
          const sender = inner?.from_address ?? inner?.fromAddress ?? "";
          const recipient = inner?.to_address ?? inner?.toAddress ?? "";
          txs.push({ height, hash, timestamp, type: innerType, amount, denom, sender, recipient });
        }
      }
    }
  }
  return txs;
}

/**
 * Retorna histórico de transferências reais (MsgSend) para um endereço
 */
export async function getAddressTransactionsREST(address: string, limit = 20): Promise<Transaction[]> {
  const query = `message.sender='${address}'`;
  const txs = await fetchTxsByEvent(query, limit);
  const allParsed: Transaction[] = [];
  for (const tx of txs) {
    const parsedArr = normalizeTxResponse(tx);
    for (const p of parsedArr) {
      if (p.type.includes('cosmos.bank.v1beta1.MsgSend') && p.denom === XION.DISPLAY_DENOM) {
        allParsed.push(p);
      }
    }
  }
  return allParsed;
}

// =========================
// TX por hash
// =========================
export async function getTxByHash(hash: string) {
  const url = `${stripTrailSlash(XION.REST)}/cosmos/tx/v1beta1/txs/${hash}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch tx by hash");
  return r.json();
}

// =========================
// Consulta de contrato (REST)
// =========================
export async function queryContractSmart(contract: string, queryMsg: object) {
  const q = toBase64(JSON.stringify(queryMsg));
  const url = `${stripTrailSlash(XION.REST)}/cosmwasm/wasm/v1/contract/${contract}/smart/${q}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Contract query failed");
  return r.json();
}

// =========================
// EXECUÇÃO (Abstraxion signing client)
// =========================
/**
 * Envia tokens XION via Abstraxion
 */
export async function sendTokensXion(params: {
  signingClient: any;
  fromAddress: string;
  toAddress: string;
  amountInDisplay: string;
  memo?: string;
}) {
  const { signingClient, fromAddress, toAddress, amountInDisplay, memo } = params;
  const inBase = Math.round(Number(amountInDisplay) * XION.DISPLAY_FACTOR).toString();
  const coins = [{ denom: XION.BASE_DENOM, amount: inBase }];
  return await signingClient?.sendTokens?.(
    fromAddress,
    toAddress,
    coins,
    "auto",
    memo ?? "transfer via abstraxion"
  );
}

/**
 * Executa contrato CosmWasm via Abstraxion
 */
export async function executeContractXion(params: {
  signingClient: any;
  sender: string;
  contract: string;
  msg: Record<string, any>;
  funds?: Array<{ denom: string; amount: string }>;
  memo?: string;
}) {
  const { signingClient, sender, contract, msg, funds = [], memo } = params;
  return await signingClient?.execute?.(
    sender,
    contract,
    msg,
    "auto",
    memo ?? "",
    funds
  );
}

// =========================
// HOOK: useXionApi()
// =========================
/**
 * Retorna API centralizada já bindada aos clients do Abstraxion
 */
export function useXionApi() {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const { client: signingClient } = useAbstraxionSigningClient();
  return useMemo(() => ({
    // Contas
    getBalances: (addr?: string) => getAccountBalances(addr ?? account?.bech32Address ?? ""),
    getAccountInfo: (addr?: string) => getAccountInfo(addr ?? account?.bech32Address ?? ""),
    // Blocos
    getLatestBlock,
    getLatestBlockHeight,
    getBlockByHeight,
    // Transações
    getTxByHash,
    getAddressTransactions: (addr?: string, limit?: number) =>
      getAddressTransactionsREST(addr ?? account?.bech32Address ?? "", pick(limit, 20)),
    // WASM
    queryContractSmart,
    // Execução
    sendTokens: (to: string, amountInDisplay: string, memo?: string) =>
      sendTokensXion({
        signingClient,
        fromAddress: account?.bech32Address ?? "",
        toAddress: to,
        amountInDisplay,
        memo,
      }),
    executeContract: (contract: string, msg: Record<string, any>, funds?: Array<{ denom: string; amount: string }>, memo?: string) =>
      executeContractXion({
        signingClient,
        sender: account?.bech32Address ?? "",
        contract,
        msg,
        funds,
        memo,
      }),
    // Expor raw clients se precisar
    _raw: { queryClient, signingClient, account },
  }), [account, queryClient, signingClient]);
}
