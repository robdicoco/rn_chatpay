import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuthStore } from './auth-store';


type Blockchain = 'XION' | 'STELLAR' | 'TON' | 'STARKNET';

interface ConfigState {
  blockchain: String;
  setBlockchain: (chain: String) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      blockchain: 'XION',
      setBlockchain: (chain) => {
        set({ blockchain: chain });
        // Move useAuthStore inside a function or use get() if needed
        // const { user } = useAuthStore(); // Remove this line from top-level
        if (chain === 'XION') {
          setTimeout(() => {
            try {
              router.push('/(xion)');
            } catch (error) {
              console.warn('Navigation failed, router not ready:', error);
            }
          }, 100);
        }else if (chain === 'STELLAR') {
          setTimeout(() => {
            try {
             // router.push('./(stellar)');
            } catch (error) {
              console.warn('Navigation failed, router not ready:', error);
            }
          }, 100);
        }else if (chain === 'TON') {
          setTimeout(() => {
            try {
              //router.push('./(ton)');
            } catch (error) {
              console.warn('Navigation failed, router not ready:', error);
            }
          }, 100);
        }else if (chain === 'STARKNET') {
          setTimeout(() => {
            try {
              //router.push('./(starknet)');
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