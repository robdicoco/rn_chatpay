import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, Clipboard, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
    // Abstraxion hooks
    const { data: account, logout, login, isConnected, isConnecting } = useAbstraxionAccount();


  // State variables
  const [loading, setLoading] = useState(false);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);



  const colors = useThemeColors();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);


  const clearResults = () => {
    // setQueryResult({});
    // setExecuteResult(undefined);
  };

  function handleLogout() {
    logout();
    clearResults();
  }



  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert("Success", "Address copied to clipboard!");
    } catch (error) {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>ChatPay Go</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Send money instantly to anyone, anywhere in the world
        </Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>💬</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Chat with friends while sending money</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>🌍</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Global payments with low fees</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>🔒</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Secure and encrypted transactions</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        {!isConnected ? (
            <View style={styles.connectButtonContainer}>
              <TouchableOpacity
                onPress={login}
                style={[styles.menuButton, styles.button, isConnecting && styles.disabledButton]}
                disabled={isConnecting}
              >
                <Text style={styles.buttonText}>
                  {isConnecting ? "Logging in..." : "Log In to Xion"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : ( <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
              {account?.bech32Address}
            </Text>
            <TouchableOpacity
              onPress={() => account?.bech32Address && copyToClipboard(account.bech32Address)}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={logout}
                style={[styles.menuButton, styles.logoutButton, styles.button, (loading || isOperationInProgress) && styles.disabledButton]}
                disabled={loading || isOperationInProgress}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
          </View>)}
        <Button
          title="Create Account"
          onPress={() => router.push('/signup')}
          gradient
          size="large"
          style={styles.button}
        />
        <Button
          title="Log In"
          onPress={() => router.push('/loguinho')}
          variant="outline"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
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
    maxWidth: '48%',
  },
  connectButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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
  logoutButton: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    width: '100%',
    maxWidth: '100%',
  },
});