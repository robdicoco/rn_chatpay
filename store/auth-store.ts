// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { router } from 'expo-router';
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isRegistered: boolean;
  wallets: Array<{ account: string }>;
  contacts: Array<any>;
}

// Utilitário para montar o User
export function buildUserFromFirebase(user: any, extra?: Partial<User>): User {
  return {
    id: user?.uid || user?.id || extra?.id || '',
    name: user?.displayName || user?.display_name || extra?.name || '',
    email: user?.email || extra?.email || '',
    avatar: user?.photoURL || user?.photo_url || extra?.avatar || '',
    isRegistered: extra?.isRegistered ?? true,
    wallets: extra?.wallets || [],
    contacts: extra?.contacts || [],
  };
}

export async function fetchUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: userId,
      name: data.display_name || data.name || "",
      email: data.email || "",
      avatar: data.avatar || data.photo_url || "",
      isRegistered: true,
      wallets: data.wallets || [],
      contacts: data.contacts || [],
    };
  } catch (e) {
    console.log("Erro ao buscar usuário do Firestore:", e);
    return null;
  }
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;

  // NOVO: adicionar wallet vinculando ao usuário atual
  addWalletToCurrentUser: (bech32Address: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const userFromFirestore = await fetchUserFromFirestore(cred.user.uid);
          const user = userFromFirestore || buildUserFromFirebase(cred.user);
          set({ isAuthenticated: true, user, isLoading: false });
          router.replace("/(xion)");
        } catch (err: any) {
          const errorMessage = err instanceof FirebaseError ? err.message : 'Login failed';
          alert("Signin error " + errorMessage);
          set({ error: errorMessage, isLoading: false });
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem('auth-storage');
        set({ isAuthenticated: false, user: null });
      },

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          if (cred.user) {
            await updateProfile(cred.user, { displayName: name });
            await setDoc(doc(db, "users", cred.user.uid), {
              display_name: name,
              email,
              photo_url: cred.user.photoURL || "",
              uid: cred.user.uid,
              contacts: [],
              wallets: [],
            });
          }
          const user = buildUserFromFirebase(cred.user, { name, email });
          set({ isAuthenticated: true, user, isLoading: false });
          router.replace("/(xion)");
        } catch (err: any) {
          const errorMessage = err instanceof FirebaseError ? err.message : 'Signup failed';
          alert("Registration failed: " + errorMessage);
          set({ isLoading: false, error: errorMessage });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          alert("Password reset email sent!");
          set({ isLoading: false });
        } catch (err: any) {
          const errorMessage = err instanceof FirebaseError ? err.message : 'Password reset failed';
          alert("Password reset email failed: " + errorMessage);
          set({ isLoading: false, error: errorMessage });
        }
      },

      updateUser: async (u) => {
        try {
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: u.name, photoURL: u.avatar });
          }
          await setDoc(
            doc(db, "users", u.id),
            {
              display_name: u.name,
              photo_url: u.avatar,
              email: u.email,
              uid: u.id,
              contacts: u.contacts || [],
              wallets: u.wallets || [],
            },
            { merge: true }
          );
          const updated = buildUserFromFirebase({ ...auth.currentUser, ...u }, { ...u });
          set({ user: updated });
        } catch (e) {
          console.log("Erro ao atualizar usuário:", e);
        }
      },

      /** Adiciona/atualiza wallet do usuário atual após login no Abstraxion */
      addWalletToCurrentUser: async (bech32Address: string) => {
        const state = get();
        const user = state.user;
        if (!user?.id || !bech32Address) return;

        const wallets = Array.isArray(user.wallets) ? user.wallets.slice() : [];
        const exists = wallets.some(w => w.account === bech32Address);
        if (!exists) wallets.unshift({ account: bech32Address });

        await setDoc(
          doc(db, "users", user.id),
          { wallets },
          { merge: true }
        );

        const updated = { ...user, wallets };
        set({ user: updated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
