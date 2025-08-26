import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useThemeColors } from '@/constants/colors';

type XionBalance = {
  id: string;
  name?: string;
  amount: number | string;
  currency?: string;
  icon?: string;
  denom?: string;
};

interface BalanceCardProps {
  balance: XionBalance;
  onPress?: () => void;
  style?: any;
}

export default function BalanceCard({ balance, onPress, style }: BalanceCardProps) {
  const colors = useThemeColors();
  let denom = '';
  let displayAmount: string | number = balance.amount;
  let tokenIcon: any = null;
  if (balance.denom === 'uxion') {
    denom = 'XION';
    const amount = typeof balance.amount === 'string' ? parseFloat(balance.amount) : balance.amount;
    displayAmount = amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
    tokenIcon = require('../assets/images/xion.png');
  } else if (
    balance.denom === 'uusdc' ||
    (balance.denom && balance.denom.toLowerCase().includes('usdc'))
  ) {
    // Não exibe USDC
    return null;
  } else if (balance.denom && balance.denom.startsWith('ibc/')) {
    // Token IBC: nome amigável e valor formatado
    denom = balance.denom.slice(0, 13) + '...';
    const amount = typeof balance.amount === 'string' ? parseFloat(balance.amount) : balance.amount;
    displayAmount = (amount / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 6 });
    tokenIcon = balance.icon ? { uri: balance.icon } : null;
  } else {
    denom = balance.denom || '';
    const amount = typeof balance.amount === 'string' ? parseFloat(balance.amount) : balance.amount;
    displayAmount = amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
    tokenIcon = balance.icon ? { uri: balance.icon } : null;
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}> 
          <View style={styles.header}> 
            <View style={styles.currencyInfo}> 
              <Image
                source={tokenIcon}
                style={styles.currencyIcon}
              />
              <Text style={[styles.currencyName, { color: colors.textPrimary }]}>{denom}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}> 
              {displayAmount} {denom}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 300,
    marginRight: 16,
  },
  gradient: {
    padding: 1,
  },
  content: {
    borderRadius: 15,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positiveChange: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  positiveChangeText: {
    color: '#2ECC71',
  },
  negativeChangeText: {
    color: '#E74C3C',
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});