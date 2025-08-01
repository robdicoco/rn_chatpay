import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface User {
  uid: string;
  name?: string;
  avatar?: string;
  photo_url?: string;
  wallets?: Array<{ account: string }>;
}

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchAllUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchAllUsers: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.display_name || data.name || '',
          avatar: data.avatar || data.photo_url || '',
          photo_url: data.photo_url || '',
          wallets: data.wallets || [],
        };
      });
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao buscar usuários', isLoading: false });
    }
  },
}));
