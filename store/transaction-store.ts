import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './auth-store';
import { useUsersStore } from './users-store';
import { getAddressTransactionsREST, getAccountBalances } from '../app/utils/xion';
import { saveTransactionToFirestore } from '../app/utils/transactionFirestore';

// Denom para nome amigável (opcional)
export function mapDenom(denom: string): string {
  if (!denom) return '';
  const d = denom.toLowerCase();
  if (d === 'uxion') return 'XION';
  if (d === 'uusdc') return 'USDC';
  if (d.startsWith('ibc/') || d.includes('usdc')) return 'USDC';
  return denom.toUpperCase();
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;   // 'send' | 'receive'
  date: string;
  note?: string;  // contato
}

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  balance: any;

  fetchTransactionHistory: () => Promise<void>;
  fetchAndUpdateBalance: () => Promise<void>;
  saveTransaction: (params: {
    txHash: string;
    sender: string;
    recipient: string;
    amount: number;
    currency: string;
    status?: string;
    timestamp?: Date;
    note?: string;
    direction?: 'sent' | 'received';
  }) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      isLoading: false,
      error: null,
      balance: undefined,

      fetchTransactionHistory: async () => {
        set({ isLoading: true });
        try {
          const { user } = useAuthStore.getState();
          const { users } = useUsersStore.getState();
          if (!user?.wallets || user.wallets.length === 0) {
            throw new Error('User has no wallet');
          }
          const walletAddress = user.wallets[0].account;

          const txs = await getAddressTransactionsREST(walletAddress, 50);

          const parsed: Transaction[] = txs.map((tx) => {
            let type: 'send' | 'receive' | '' = '';
            let contactName = 'Unknown';

            if (tx.sender === walletAddress) {
              type = 'send';
              const contact = users.find((u) => u.wallets && u.wallets[0]?.account === tx.recipient);
              contactName = contact?.name || 'Unknown';
            } else if (tx.recipient === walletAddress) {
              type = 'receive';
              const contact = users.find((u) => u.wallets && u.wallets[0]?.account === tx.sender);
              contactName = contact?.name || 'Unknown';
            }

            return {
              id: tx.hash,
              senderId: tx.sender,
              receiverId: tx.recipient,
              amount: parseFloat(tx.amount),      // tx.amount já vem em XION (display)
              currency: tx.denom,                 // "XION" na maioria
              status: 'completed',
              type,
              date: tx.timestamp,
              note: contactName,
            };
          });

          set({ transactions: parsed, isLoading: false });
        } catch (error: any) {
          set({ error: error?.message || 'Error fetching transactions', isLoading: false });
        }
      },

      fetchAndUpdateBalance: async () => {
        try {
          const { user } = useAuthStore.getState();
          if (!user?.wallets || user.wallets.length === 0) return;

          const address = user.wallets[0].account;
          if (!address) return;

          const balances = await getAccountBalances(address);

          const result = {
            balances, // array { denom, amount } (uxion etc.)
            xionDisplay: (() => {
              const b = balances.find(b => b.denom === 'uxion')?.amount ?? '0';
              return Number(b) / 1_000_000;
            })(),
          };

          set({ balance: result });
        } catch {
          set({ error: 'Error fetching balance' });
        }
      },

      saveTransaction: async (params) => {
        try {
          await saveTransactionToFirestore({
            txHash: params.txHash,
            sender: params.sender,
            recipient: params.recipient,
            amount: params.amount,
            currency: params.currency,
            status: params.status || 'pending',
            timestamp: params.timestamp || new Date(),
            note: params.note,
            direction: params.direction,
          });
        } catch (error) {
          console.error('Error saving transaction:', error);
        }
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);