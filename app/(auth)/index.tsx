import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import { router } from 'expo-router';
import Button from '@/components/Button';
import TouchableButton from '@/components/TouchableButton';
import { useThemeColors } from '@/constants/Colors';
import { useAuthStore } from '@/store/auth-store';
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion-react-native";
import { FirebaseService } from '@/services/firebase';

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
  // Abstraxion hooks
  const { data: account, logout, login, isConnected, isConnecting } = useAbstraxionAccount();

  // State variables
  const [loading, setLoading] = useState(false);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const [localIsConnected, setLocalIsConnected] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);

  const colors = useThemeColors();

  // Monitor connection status changes
  useEffect(() => {
    setLocalIsConnected(isConnected);
  }, [isConnected]);

  // Monitor account changes and check user existence
  useEffect(() => {
    if (account?.bech32Address) {
      setLocalIsConnected(true);
      checkUserExistence(account.bech32Address);
    }
  }, [account?.bech32Address]);

  const checkUserExistence = async (walletHash: string) => {
    setCheckingUser(true);
    try {
      const existingUser = await FirebaseService.checkUserByWalletHash(walletHash);
      if (!existingUser) {
        // User doesn't exist in Firebase, redirect to signup
        console.log('User not found in Firebase, redirecting to signup');
        router.push('/signup');
      } else {
        console.log('User found in Firebase:', existingUser.name);
        // User exists, can proceed to main app
        // You might want to update the auth store with the Firebase user data
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      Alert.alert('Error', 'Failed to check user account. Please try again.');
    } finally {
      setCheckingUser(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login();
      // Add a small delay to allow the connection to establish
      setTimeout(() => {
        setLocalIsConnected(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      Alert.alert("Login Error", "Failed to connect to Xion. Please try again.");
    }
  };

  const refreshConnectionStatus = () => {
    // Force refresh the connection status
    if (account?.bech32Address) {
      setLocalIsConnected(true);
    } else {
      setLocalIsConnected(isConnected);
    }
  };

  // Add periodic refresh of connection status
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConnectionStatus();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [account?.bech32Address, isConnected]);

  const clearResults = () => {
    // setQueryResult({});
    // setExecuteResult(undefined);
  };

  function handleLogout() {
    logout();
    setLocalIsConnected(false);
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
      
      <View style={[styles.contentContainer, { 
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingTop: 60,
        flexDirection: 'column'
      }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>ChatPay Go</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Send money instantly to anyone, anywhere in the world
        </Text>
        
        {!localIsConnected ? (<View style={styles.featureContainer}>
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
        ) : (
          <>
          </>
        )}
      </View>
      
      <View style={[styles.contentContainer, { 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        flexDirection: 'column'
      }]}>
        {!localIsConnected ? ( 
          <View style={{width: '100%', alignItems: 'center', flexDirection: 'column'}}>
            <TouchableButton
              title={isConnecting ? "Logging in..." : "Log In to Xion"}
              onPress={handleLogin}
              variant="outline"
              size="large"
              disabled={isConnecting}
            />

            <Button
              title="Log In Test"
              onPress={() => router.push('/log_xion_sample')}
              variant="outline"
              size="large"
              style={styles.button}
            />

            <Button
              title="Firebase Test"
              onPress={() => router.push('/firebase-test')}
              variant="secondary"
              size="large"
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column'}}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your Xion Account:
              </Text>
              <View style={styles.featureItem}>
                <Text style={[styles.featureText, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="middle">
                  {account?.bech32Address}
                </Text>
                
                <TouchableButton
                  title="📋"
                  onPress={() => account?.bech32Address && copyToClipboard(account.bech32Address)}
                  variant="text"
                  size="small"
                />

                {/* <TouchableButton
                  title="🔄"
                  onPress={refreshConnectionStatus}
                  variant="text"
                  size="small"
                /> */}
              </View>
            </View>
            
            {checkingUser && (
              <View style={styles.checkingUserContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.checkingUserText, { color: colors.textSecondary }]}>
                  Checking user account...
                </Text>
              </View>
            )}
            
            <TouchableButton
              title="Logout from Xion"
              onPress={handleLogout}
              variant="danger"
              size="medium"
              disabled={loading || isOperationInProgress}
            />
          </View>
        )}
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
  connectButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  copyButton: {
    minWidth: 15,
  },
  checkingUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  checkingUserText: {
    fontSize: 14,
  },
});
