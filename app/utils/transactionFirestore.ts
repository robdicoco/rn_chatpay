// Utility functions for saving and managing transactions in Firestore

import { db } from "@/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Saves a transaction to the 'transactions' collection in Firestore
 * @param tx Main transaction data
 */
export async function saveTransactionToFirestore(tx: {
  txHash: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: string;
  status: string; // 'pending', 'confirmed', 'failed', etc
  timestamp?: Date;
  note?: string;
  direction?: 'sent' | 'received';
}) {
  try {
    await addDoc(collection(db, "transactions"), {
      txHash: tx.txHash,
      sender: tx.sender,
      recipient: tx.recipient,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      timestamp: tx.timestamp ? tx.timestamp : serverTimestamp(),
      note: tx.note || '',
      direction: tx.direction || '',
    });
  } catch (error) {
    console.error("Error saving transaction to Firestore:", error);
    throw error;
  }
}
