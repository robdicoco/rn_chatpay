import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Clipboard,
} from "react-native";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { useAuthStore } from "@/store/auth-store";
import { router } from "expo-router";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { User, Chain } from '@/mocks/users';
import { Buffer } from "buffer";
import crypto from "react-native-quick-crypto";
import Button from "@/components/Button";

global.crypto = crypto;
global.Buffer = Buffer;

if (!process.env.EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS) {
  throw new Error(
    "EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS is not set in your environment file"
  );
}

export default function Index() {
  const { user } = useAuthStore();
  const firebaseUser = getAuth().currentUser;
  const [userWallet, setUserWallet] = useState<Chain>({name: "XION", account: " "});
  const currentUser = user?.email;
  const loggedUser: User = {
    email: currentUser || " ",
    id: firebaseUser?.uid || " ",
    wallets: [{name: userWallet.name, account: userWallet.account}],
  };

  // Abstraxion hooks
  const {
    data: account,
    logout,
    login,
    isConnected,
    isConnecting,
  } = useAbstraxionAccount();

  loggedUser.wallets = [{name: userWallet.name, account: account?.bech32Address}];

  const prevAccountRef = useRef<string | undefined>(account?.bech32Address || "");
  prevAccountRef.current = user?.wallets?.[0]?.account || "";
  const [loading, setLoading] = useState(false);
  const [hasWalletJustConnected, setHasWalletJustConnected] = useState(false);
  const prevWalletAddress = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      prevWalletAddress.current !== account?.bech32Address &&
      account?.bech32Address
    ) {
      setHasWalletJustConnected(true);
    }
    prevWalletAddress.current = account?.bech32Address;
  }, [account?.bech32Address]);

  useEffect(() => {
    if (hasWalletJustConnected) {
      router.push('/(tabs)/chat');
      setHasWalletJustConnected(false);
    }
  }, [hasWalletJustConnected]);

  useEffect(() => {
    const currentAccount = account?.bech32Address;
    if (
      currentAccount != null &&
      currentAccount !== " " &&
      prevAccountRef.current !== currentAccount
    ) {
      handleUserFirestoreAndAuthStore(loggedUser);
      prevAccountRef.current = currentAccount;
    }
  }, [account?.bech32Address]);

  useEffect(() => {
    if (isConnected && account?.bech32Address) {
      useAuthStore.getState().addWalletToCurrentUser(account.bech32Address);
    }
  }, [isConnected, account?.bech32Address]);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert("Success", "Address copied to clipboard!");
    } catch (error) {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Welcome to XION</Text>

      {!isConnected ? (
        <View style={styles.connectButtonContainer}>
          <Button
            title={isConnecting ? "Connecting..." : "Connect Wallet"}
            onPress={login}
            gradient
            size="large"
            style={styles.button}
            disabled={isConnecting}
          />
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.accountInfoContainer}>
            <Text style={styles.accountLabel}>Connected Account:</Text>
            <View style={styles.addressContainer}>
              <Text
                style={styles.addressText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {account?.bech32Address}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  account?.bech32Address &&
                  copyToClipboard(account.bech32Address)
                }
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={logout}
              style={[
                styles.menuButton,
                styles.logoutButton,
                (loading) && styles.disabledButton,
              ]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Async function to handle Firestore user query/update and auth-store save
async function handleUserFirestoreAndAuthStore(loggedUser: User) { 
    const userRef = collection(db, "users");
    const q = query(userRef, where("id", "==", loggedUser.id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(userRef, docId);
      await updateDoc(docRef, {
        ...loggedUser,
        createdAt: new Date()
      });
    }
    // Save to auth-store
    const prevUser = useAuthStore.getState().user;
    useAuthStore.setState({
      user: {
        ...prevUser,
        ...loggedUser,
        wallets: loggedUser.wallets,
      },
      isAuthenticated: true,
    });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ECEFF1",
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    gap: 20,
  },
  accountInfoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  accountLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  menuButton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    alignItems: "center",
    flex: 1,
    minWidth: 120,
    maxWidth: "48%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#000",
  },
  connectButtonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 15,
    backgroundColor: "#dc3545",
    width: "100%",
    maxWidth: "100%",
  },
});