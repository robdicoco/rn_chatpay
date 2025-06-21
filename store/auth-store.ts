import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentUser } from '@/mocks/users';
import {auth} from '@/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword } from "firebase/auth";


interface AuthState {
  isAuthenticated: boolean;
  user: typeof currentUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
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
          // Simulate API call
         // await new Promise(resolve => setTimeout(resolve, 1000));
         await signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            //const user = userCredential.user;
             // For demo purposes, any email/password combination works
             currentUser.id = userCredential.user.uid;
             currentUser.email = userCredential.user.email || "";
             currentUser.name = userCredential.user.displayName || "";                        
            
          set({ isAuthenticated: true, user: { ...currentUser }, isLoading: false });
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
          });
          
         
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          
          // Simulate API call
          //await new Promise(resolve => setTimeout(resolve, 1000));

          await createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
             console.log(user);
             // For demo purposes, create a new user based on the mock
          const newUser = { ...currentUser, name, email };
          set({ isAuthenticated: true, user: newUser, isLoading: false });
             

            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
          });
         
          
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Signup failed', 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);