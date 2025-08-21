import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentUser, User } from '@/mocks/users';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { router } from 'expo-router';
import { doc, getDoc, setDoc } from "firebase/firestore";

// Função utilitária para garantir todos os campos obrigatórios do user
function buildUserFromFirebase(user: any, extra?: Partial<User>): User {
  return {
    id: user.uid || user.id || extra?.id || '',
    name: user.displayName || user.display_name || extra?.name || '',
    email: user.email || extra?.email || '',
    avatar: user.photoURL || user.photo_url || extra?.avatar || '',
    isRegistered: extra?.isRegistered ?? true,
    wallets: extra?.wallets || [],
    contacts: extra?.contacts || [],
  };
}

// Função para buscar usuário + contatos do Firestore (ADICIONADO)
export async function fetchUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userId,
        avatar: data.avatar || data.photo_url || data.foto || "",
        contacts: data.contacts || [],
      } as User;
    }
    return null;
  } catch (error) {
    console.log("Erro ao buscar usuário do Firestore:", error);
    return null;
  }
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userFromFirestore = await fetchUserFromFirestore(userCredential.user.uid);
          const user = userFromFirestore || buildUserFromFirebase(userCredential.user);
          set({ isAuthenticated: true, user, isLoading: false });
          router.replace("/(xion)");
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? error.message : 'Login failed';
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
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
            await setDoc(doc(db, "users", userCredential.user.uid), {
              display_name: name,
              email,
              photo_url: userCredential.user.photoURL || "",
              uid: userCredential.user.uid,
              contacts: [],
              wallets: [],
            });
          }
          const user = buildUserFromFirebase(userCredential.user, { name, email });
          set({ isAuthenticated: true, user, isLoading: false });
          // Redireciona para XION, mas só permite sair após conectar carteira
          router.replace("/(xion)");
          // O redirecionamento para as tabs será feito na tela XION após conectar carteira
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? error.message : 'Signup failed';
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
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? error.message : 'Password reset failed';
          alert("Password reset email failed: " + errorMessage);
          set({ isLoading: false, error: errorMessage });
        }
      },
      updateUser: async (user) => {
        try {
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: user.name, photoURL: user.avatar });
          }

          await setDoc(doc(db, "users", user.id), {
            display_name: user.name,
            photo_url: user.avatar,
            email: user.email,
            uid: user.id,
            contacts: user.contacts || [],
            wallets: user.wallets || [],
          }, { merge: true });

          const updatedUser = buildUserFromFirebase({ ...auth.currentUser, ...user }, { ...user });
          set({ user: updatedUser });
        } catch (error) {
          console.log("Erro ao atualizar usuário:", error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);