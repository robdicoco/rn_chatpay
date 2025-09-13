import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/constants/colors';
import { Plus } from 'lucide-react-native';
import WalletHashDisplay from '@/components/WalletHashDisplay';

export default function FaucetScreen() {
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFaucet = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      // Simulação do faucet
      await new Promise(resolve => setTimeout(resolve, 1800));
      setStatus('success');
      Alert.alert('Success', 'Testnet tokens sent to your wallet!');
    } catch (err) {
      setStatus('error');
      Alert.alert('Error', 'Failed to request faucet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary }] }>
          <Plus size={40} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Testnet Faucet</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Get free testnet tokens to try all features. These tokens have no real value.</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleFaucet}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Request Testnet Tokens</Text>
            )}
          </TouchableOpacity>
          {status === 'success' && (
            <Text style={[styles.status, { color: colors.success }]}>Tokens sent! Check your wallet balance.</Text>
          )}
          {status === 'error' && (
            <Text style={[styles.status, { color: colors.error }]}>Error requesting faucet. Try again.</Text>
          )}
          <Text style={[styles.info, { color: colors.warning }]}>This faucet is for testnet only. Tokens are for testing purposes.</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  walletSection: {
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  walletHash: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  info: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
