import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { User } from '@/mocks/users';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_FIREBASE_API_KEY,
  authDomain: "chatpaygo.firebaseapp.com",
  projectId: "chatpaygo",
  storageBucket: "chatpaygo.firebasestorage.app",
  messagingSenderId: process.env.EXPO_FIREBASE_MSGSENDER_ID,
  appId: process.env.EXPO_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
const USERS_COLLECTION = 'users';

export interface FirebaseUser extends Omit<User, 'id'> {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  xionWalletHash: string; // Store the Xion wallet hash
}

export class FirebaseService {
  /**
   * Check if a user exists by their Xion wallet hash
   */
  static async checkUserByWalletHash(walletHash: string): Promise<FirebaseUser | null> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('xionWalletHash', '==', walletHash));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking user by wallet hash:', error);
      throw error;
    }
  }

  /**
   * Create a new user in Firebase
   */
  static async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDoc = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await setDoc(doc(collection(db, USERS_COLLECTION)), userDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<FirebaseUser | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as FirebaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get all users (for testing purposes)
   */
  static async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseUser[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Delete a user (for testing purposes)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(userRef, { deleted: true, updatedAt: new Date() });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
} 