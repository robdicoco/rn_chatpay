import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion-react-native";
import { useAuthStore } from "@/store/auth-store";
import { useThemeColors } from "@/constants/colors";
import { router } from "expo-router";
import Button from "@/components/Button";
import { Loader, CheckCircle, Copy } from "lucide-react-native";

const DETECTING_MIN_TIME = 6000; // ms
const CHECK_PHASE_TIME = 2500; // ms

export default function XionConnectGate() {
  const { user } = useAuthStore();
  const {
    data: account,
    login: walletLogin,
    logout: walletLogout,
    isConnected,
    isConnecting,
  } = useAbstraxionAccount();

  // Use design system colors
  const colors = useThemeColors();
  const address = account?.bech32Address ?? "";

  // State machine
  const [phase, setPhase] = useState<"detecting" | "idle" | "connecting" | "check" | "ready">("detecting");
  const [userClickedConnect, setUserClickedConnect] = useState(false);
  const [detectingDone, setDetectingDone] = useState(false);

  // Loader spinner
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let anim: Animated.CompositeAnimation | undefined;
    if (phase === "connecting") {
      spinAnim.setValue(0);
      anim = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
      );
      anim.start();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [phase]);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  // Detecting phase: wait minimum time before deciding next state
  useEffect(() => {
    setPhase("detecting");
    setDetectingDone(false);
    const timer = setTimeout(() => setDetectingDone(true), DETECTING_MIN_TIME);
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Main state machine
  useEffect(() => {
    if (!user) return;

    if (!detectingDone) {
      setPhase("detecting");
      return;
    }

    if (isConnected && address) {
      if (phase !== "check" && phase !== "ready") {
        setPhase("check");
        setTimeout(() => setPhase("ready"), CHECK_PHASE_TIME);
      }
      return;
    }

    if ((isConnecting || userClickedConnect) && isConnected && address) {
      if (phase !== "check" && phase !== "ready") {
        setPhase("check");
        setTimeout(() => setPhase("ready"), CHECK_PHASE_TIME);
      }
      return;
    }

    if (isConnecting || userClickedConnect) {
      setPhase("connecting");
      return;
    }

    if (isConnected && !address) {
      setPhase("detecting");
      return;
    }

    if (!isConnected && !isConnecting && detectingDone) {
      setPhase("idle");
      return;
    }
  }, [isConnected, isConnecting, address, userClickedConnect, detectingDone, phase, user]);

  useEffect(() => {
    if (phase === "ready" && address) {
      useAuthStore.getState().addWalletToCurrentUser(address).catch(() => {});
    }
  }, [phase, address]);

  const handleConnect = async () => {
    setUserClickedConnect(true);
    setPhase("connecting");
    try {
      await walletLogin();
    } catch {
      setUserClickedConnect(false);
      setPhase("idle");
    }
  };

  const handleLogout = async () => {
    setUserClickedConnect(false);
    try {
      await walletLogout();
    } finally {
      await useAuthStore.getState().logout();
      setPhase("detecting");
    }
  };

  const copyAddress = async (addr?: string) => {
    if (!addr) return;
    try {
      const { Clipboard } = await import("react-native");
      Clipboard.setString(addr);
      Alert.alert("Copied!", "Wallet address copied to clipboard.");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.background, colors.card]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerWrap}>
          {/* Detecting wallet */}
          {user && phase === "detecting" && (
            <>
              <Text style={[styles.title, { color: colors.primary }]}>
                Welcome to ChatPay Go
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                To get started, connect your wallet.
              </Text>
              <View style={styles.loaderWrap}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Loader size={44} color={colors.primary} />
                </Animated.View>
              </View>
              <Text style={[styles.detectingText, { color: colors.textPrimary }]}>
                We are checking if you already have a wallet connected to your account.
              </Text>
              <Text style={[styles.detectingTextSmall, { color: colors.textSecondary }]}>
                This process may take a few seconds. Please wait...
              </Text>
            </>
          )}

          {user && phase === "connecting" && (
            <>
              <Text style={[styles.title, { color: colors.primary }]}>Connecting wallet...</Text>
              <View style={styles.loaderWrap}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Loader size={44} color={colors.primary} />
                </Animated.View>
              </View>
              <Text style={[styles.detectingText, { color: colors.textSecondary }]}>
                Initializing secure connection.
              </Text>
            </>
          )}

          {user && phase === "idle" && (
            <>
              <Text style={[styles.title, { color: colors.primary }]}>Connect your wallet</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                To get started, connect your wallet. It's quick and secure.
              </Text>
              <Button
                title="Connect Wallet"
                onPress={handleConnect}
                isLoading={false}
                gradient
                size="large"
                style={styles.connectButton}
                textStyle={{ color: colors.white, fontWeight: "700", fontSize: 17 }}
              />
            </>
          )}

          {user && phase === "check" && (
            <>
              <CheckCircle size={44} color={colors.primary} style={{ marginBottom: 18 }} />
              <Text style={[styles.title, { color: colors.primary }]}>Wallet connected!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your wallet is ready to use.</Text>
            </>
          )}

          {user && phase === "ready" && address && (
            <>
              <View style={[styles.walletCard, { backgroundColor: colors.card, shadowColor: colors.black }]}> 
                <Text style={[styles.walletCardTitle, { color: colors.textPrimary }]}>Wallet Connected</Text>
                <View style={styles.walletAddressRow}>
                  <Text
                    style={{
                      ...styles.walletCardAddress,
                      color: colors.primary,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    }}
                    selectable
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {address}
                  </Text>
                  <TouchableOpacity
                    style={{ ...styles.walletCopyButton, borderColor: colors.border }}
                    onPress={() => copyAddress(address)}
                    activeOpacity={0.7}
                  >
                    <Copy color={colors.primary} size={20} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.walletCardLabel, { color: colors.textSecondary }]}> 
                  This is your wallet address. Keep it safe!
                </Text>
                <View style={styles.walletCardActions}>
                  <Button
                    title="Logout"
                    onPress={handleLogout}
                    size="small"
                    gradient={false}
                    style={{
                      ...styles.walletLogoutButton,
                      backgroundColor: colors.alert,
                    }}
                    textStyle={{ color: colors.white, fontWeight: "600", fontSize: 13 }}
                  />
                </View>
              </View>
              <Button
                title="Proceed to app"
                gradient
                size="large"
                style={styles.walletProceedButtonOutside}
                textStyle={{ color: colors.white, fontWeight: "700", fontSize: 17 }}
                onPress={() => router.replace("/(tabs)/chat")}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 28,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  loaderWrap: {
    marginVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detectingText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
    lineHeight: 22,
  },
  detectingTextSmall: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  connectButton: {
    width: "100%",
    marginBottom: 8,
  },
  walletCard: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 6,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  walletCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  walletAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    width: "100%",
  },
  walletCardAddress: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: "70%",
    textAlign: "center",
    borderWidth: 1,
  },
  walletCopyButton: {
    marginLeft: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  walletCardLabel: {
    fontSize: 14,
    marginBottom: 18,
    textAlign: "center",
  },
  walletCardActions: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 8,
  },
  walletLogoutButton: {
    width: 90,
    height: 32,
    marginBottom: 0,
    borderRadius: 8,
    alignSelf: "flex-end",
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  walletProceedButtonOutside: {
    width: "100%",
    marginTop: 10,
    borderRadius: 14,
    alignSelf: "center",
  },
});