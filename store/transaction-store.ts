// Mapeia denom para nome amigável
export function mapDenom(denom: string): string {
  if (!denom) return '';
  if (denom === 'uxion') return 'XION';
  if (denom === 'uusdc') return 'USDC';
  if (denom.startsWith('ibc/') || denom.toLowerCase().includes('usdc')) return 'USDC';
  return denom.toUpperCase();
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './auth-store';

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  date: string;
  note?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  sendMoney?: (receiverId: string, amount: number, currency: string, note?: string) => Promise<Transaction>;
  requestMoney?: (senderId: string, amount: number, currency: string, note?: string) => Promise<Transaction>;
  fetchTransactionHistory: () => Promise<void>;
  fetchBlockchainTransactions?: () => Promise<Transaction[]>;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,

      // Buscar histórico de transações do blockchain XION
      fetchTransactionHistory: async () => {
        set({ isLoading: true });
        try {
          const { user } = useAuthStore.getState();
          if (!user?.wallets || user.wallets.length === 0) throw new Error('Usuário sem wallet');
          const wallet = user.wallets[0];
          const xionAddress = wallet?.account || '';
          if (!xionAddress) throw new Error('Wallet sem endereço XION');
          // Importa função do helper
          const { getAddressTransactions } = require('../app/utils/xion_rpc');
          const rawTxs = await getAddressTransactions(xionAddress, 50);

          if (!Array.isArray(rawTxs)) {
            set({ error: 'Histórico blockchain inválido', isLoading: false });
            return;
          }
          const blockchainTxs: Transaction[] = rawTxs.map((tx: any, idx: number): Transaction => {
            return {
              id: tx.hash || `chain-${tx.height}-${idx}`,
              senderId: tx.sender || '',
              receiverId: tx.recipient || '',
              amount: tx.amount ? Number(tx.amount) : 0,
              currency: mapDenom(tx.denom),
              status: 'completed',
              type: tx.sender === xionAddress ? 'send' : 'receive',
              date: tx.timestamp || new Date().toISOString(),
              note: '',
            };
          });
          // Ordena por data decrescente
          const allTxs: Transaction[] = blockchainTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          set({ transactions: allTxs, isLoading: false });
        } catch (error) {
          set({ error: 'Erro ao buscar histórico blockchain', isLoading: false });
        }
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);