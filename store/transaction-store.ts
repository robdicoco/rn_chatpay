import { create } from 'zustand';
import { transactions, Transaction } from '@/mocks/transactions';
import { currentUser } from '@/mocks/users';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  sendMoney: (receiverId: string, amount: number, currency: string, note?: string) => Promise<Transaction>;
  requestMoney: (senderId: string, amount: number, currency: string, note?: string) => Promise<Transaction>;
  getTransactionHistory: () => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: transactions,
  isLoading: false,
  error: null,
  
  sendMoney: async (receiverId, amount, currency, note) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        senderId: currentUser.id,
        receiverId,
        amount,
        currency,
        status: 'completed',
        type: 'send',
        date: new Date().toISOString(),
        note,
      };
      
      const updatedTransactions = [...get().transactions, newTransaction];
      set({ transactions: updatedTransactions, isLoading: false });
      
      return newTransaction;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Transaction failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  requestMoney: async (senderId, amount, currency, note) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        senderId,
        receiverId: currentUser.id,
        amount,
        currency,
        status: 'pending',
        type: 'request',
        date: new Date().toISOString(),
        note,
      };
      
      const updatedTransactions = [...get().transactions, newTransaction];
      set({ transactions: updatedTransactions, isLoading: false });
      
      return newTransaction;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Request failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  getTransactionHistory: () => {
    return get().transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
}));