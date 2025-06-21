import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/constants/Colors';

interface WalletHashDisplayProps {
  hash: string;
}

export default function WalletHashDisplay({ hash }: WalletHashDisplayProps) {
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  // Format the hash to show only the beginning and end
  const formatHash = (hash: string) => {
    if (!hash) return '';
    if (hash.length <= 15) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(hash);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Show alert on web since there's no haptic feedback
      if (Platform.OS === 'web') {
        Alert.alert('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      Alert.alert('Failed to copy to clipboard');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Wallet Address</Text>
        <Text style={[styles.hash, { color: colors.textPrimary }]}>{formatHash(hash)}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.copyButton, { backgroundColor: copied ? 'rgba(46, 204, 113, 0.2)' : 'rgba(41, 128, 185, 0.2)' }]}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        {copied ? (
          <Check size={20} color={colors.success} />
        ) : (
          <Copy size={20} color={colors.secondary} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  hash: {
    fontSize: 16,
    fontWeight: '500',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});