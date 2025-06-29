import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentUser } from '@/mocks/users';
import {auth} from '@/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { router } from 'expo-router';


interface AuthState {
  isAuthenticated: boolean;
  user: typeof currentUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}
let errorMessage: string | null = null ;
let newUser: typeof currentUser | null;
export const useAuthStore = create<AuthState>()(
  
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        let errorMessage = null;
        set({ isLoading: true, error: null });
        try {
           await signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
           
             currentUser.id = userCredential.user.uid;
             currentUser.email = userCredential.user.email || "";
             currentUser.name = userCredential.user.displayName || "";  
             console.log("Success..." + currentUser.email);          
        
         
            // ...
          })
          .catch((error) => {
            const errorCode = error.code as FirebaseError;
            errorMessage = error.message ;
            alert("Signin error " + errorMessage);
            // ..
          });

           if (errorMessage == null) {
             set({ isAuthenticated: true, user: { ...currentUser }, isLoading: false });
                router.replace("/(chain)");
                
              }
          
         
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
        let errorMessage = null;
         set({ isLoading: true, error: null });
        try {              
          await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              // Signed up
              const user = userCredential.user;
              console.log(user);
              // For demo purposes, create a new user based on the mock
                newUser = { ...currentUser, name, email };
          //set({ isAuthenticated: true, user: newUser, isLoading: false }); 
              // router.replace("/(tabs)");
              
              // ...
            })
            .catch((error) => {
              const errorCode = error.code as FirebaseError;
              errorMessage = error.message;
              console.log(errorMessage);
              alert("Registration failed: " + errorMessage);
              set({ isLoading: false, error: errorMessage });
              // ..
            });
           // console.log("Out first catch=== " +errorMessage);

            if (errorMessage == null) {
               set({ isAuthenticated: true, user: newUser, isLoading: false });
                router.replace("/(xion)");
              } 
                
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Signup failed', 
            isLoading: false 
          });
        }
        /*  console.log("Out second catch=== " +errorMessage);
        if (errorMessage == null) {
                router.replace("/(tabs)");
              }  */
      },
      forgotPassword: async (email) => {
        let errorMessage = null;
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth ,email)
            .then(() => {
              // Password reset email sent!
              // ..
              alert("Password reset email sent!");
            })
            .catch((error) => {
              const errorCode = error.code as FirebaseError;
              errorMessage = error.message;
              console.log(errorMessage);
              alert("Password reset email failed: " + errorMessage);
              set({ isLoading: false, error: errorMessage });
              // ..
            });

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Password reset failed', 
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