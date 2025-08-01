import { StargateClient } from '@cosmjs/stargate';
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

// Network configuration
export const XION_CONFIG = {
  RPC_URL: "https://rpc.xion-testnet-2.burnt.com",
  REST_URL: "https://api.xion-testnet-2.burnt.com",
  CHAIN_ID: "xion-testnet-2",
};

interface Transaction {
  height: number;
  hash: string;
  timestamp: string;
  type: string;
  amount: string;
  denom: string;
  sender: string;
  recipient: string;
}

/**
 * Creates a read-only client for querying the blockchain
 * This client can be used for all operations that don't require signing
 */
export async function getQueryClient() {
  return await StargateClient.connect(XION_CONFIG.RPC_URL);
}

/**
 * Get transaction history for an address
 * @param address The bech32 address to query
 * @param limit Maximum number of transactions to return
 * @returns Array of transactions
 */
export async function getAddressTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
  const client = await getQueryClient();
  
  // Query sent transactions
  const sentQuery = `message.sender='${address}'`;
  const sentTxs = await client.searchTx(sentQuery);
  console.log('[XION_RPC] SentTxs:', sentTxs);

  // Query received transactions
  const receivedQuery = `transfer.recipient='${address}'`;
  const receivedTxs = await client.searchTx(receivedQuery);
  console.log('[XION_RPC] ReceivedTxs:', receivedTxs);

  // Combine and sort by height (descending)
  const allTxs = [...sentTxs, ...receivedTxs]
    .sort((a, b) => b.height - a.height)
    .slice(0, limit);
  console.log('[XION_RPC] AllTxs:', allTxs);

  // Busca o timestamp real do bloco para cada transação
  async function getBlockTimestamp(height: number): Promise<string> {
    try {
      const block = await client.getBlock(height);
      return block.header.time;
    } catch {
      return new Date().toISOString();
    }
  }

  // Transforma transactions em um formato mais legível
  return await Promise.all(allTxs.map(async tx => {
    const decodedTx = Tx.decode(tx.tx);
    const msg = decodedTx.body?.messages?.[0];
    let amount = '0';
    let denom = 'XION';
    let sender = '';
    let recipient = '';

    // Extrai dados de transferências (bank send)
    if (msg && msg.typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
      try {
        let value: any = msg.value || msg;
        // Se value for um buffer, tenta decodificar para objeto
        if (value instanceof Uint8Array) {
          try {
            value = JSON.parse(Buffer.from(value).toString('utf8'));
          } catch (jsonErr) {
            value = {};
          }
        }
        sender = value.fromAddress || value.from_address || address;
        recipient = value.toAddress || value.to_address || address;
        if (value.amount && Array.isArray(value.amount) && value.amount.length > 0) {
          // Converte para XION (dividindo por 1_000_000)
          const rawAmount = value.amount[0].amount || '0';
          amount = (parseFloat(rawAmount) / 1_000_000).toString();
          denom = value.amount[0].denom || 'XION';
        }
      } catch (e) {
        amount = '0';
        denom = 'XION';
        sender = address;
        recipient = address;
      }
    }
    // Outros tipos de mensagem podem ser tratados aqui
    const timestamp = await getBlockTimestamp(tx.height);
    
    return {
      height: tx.height,
      hash: tx.hash,
      timestamp,
      type: msg?.typeUrl || 'unknown',
      amount,
      denom,
      sender,
      recipient,
    };
  }));
}

/**
 * Get account balance
 * @param address The bech32 address to query
 * @returns Array of balances with denom and amount
 */
export async function getAccountBalance(address: string) {
  const response = await fetch(
    `${XION_CONFIG.REST_URL}/cosmos/bank/v1beta1/balances/${address}?pagination.offset=0&pagination.limit=12&pagination.count_total=true&pagination.reverse=false&resolve_denom=false`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch account balance');
  }
  
  return response.json();
}

/**
 * Get account information
 * @param address The bech32 address to query
 * @returns Account information including sequence and account number
 */
export async function getAccountInfo(address: string) {
  const response = await fetch(
    `${XION_CONFIG.REST_URL}/cosmos/auth/v1beta1/accounts/${address}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch account information');
  }
  
  return response.json();
}

/**
 * Get block information
 * @param height Block height to query
 * @returns Block information
 */
export async function getBlock(height: number) {
  const client = await getQueryClient();
  return client.getBlock(height);
}

/**
 * Get latest block height
 * @returns Current block height
 */
export async function getLatestBlockHeight() {
  const client = await getQueryClient();
  return client.getHeight();
} 