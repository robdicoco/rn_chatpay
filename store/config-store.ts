import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type Blockchain = 'XION' | 'STELLAR' | 'TON' | 'STARKNET';

interface ConfigState {
  blockchain: String;
  setBlockchain: (chain: String) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      blockchain: 'XION',
      setBlockchain: (chain) => {
        set({ blockchain: chain });
        if (chain === 'XION') {
          // Use setTimeout to ensure navigation happens after component mount
          setTimeout(() => {
            try {
              router.replace('/(xion)');
            } catch (error) {
              console.warn('Navigation failed, router not ready:', error);
            }
          }, 100);
        }
      },      
      // ... existing state
    }),

    {
      name: 'chain-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
        clear: async () => {
          await AsyncStorage.clear();
        }
      })),
    }
    
  )
);