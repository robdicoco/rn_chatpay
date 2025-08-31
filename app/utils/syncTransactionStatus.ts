import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getTxByHash } from "@/app/utils/xion";

/**
 * Checks and updates the status of all pending transactions in Firestore.
 */
export async function syncPendingTransactionsStatus() {
  try {
    const q = query(collection(db, "transactions"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    for (const txDoc of snapshot.docs) {
      const txData = txDoc.data();
      const txHash = txData.txHash;

      // Query blockchain for transaction status
      const blockchainTx = await getTxByHash(txHash);

      let newStatus = "pending";
      const code = blockchainTx?.tx_response?.code;
      if (typeof code !== 'undefined') {
        if (code === 0) {
          newStatus = "confirmed";
        } else {
          newStatus = "failed";
        }
      }

      // Only update if status changed
      if (txData.status !== newStatus) {
        await updateDoc(doc(db, "transactions", txDoc.id), { status: newStatus });
      }
    }
  } catch (error) {
    console.error("[SYNC] Error syncing transaction status:", error);
  }
}