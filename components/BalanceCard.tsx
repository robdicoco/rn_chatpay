import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import { Balance } from '@/mocks/balances';

interface BalanceCardProps {
  balance: Balance;
  onPress?: () => void;
  style?: any;
}

export default function BalanceCard({ balance, onPress, style }: BalanceCardProps) {
  const colors = useThemeColors();
  const hasChange = balance.change !== undefined;
  const isPositiveChange = hasChange && balance.change && balance.change.percentage > 0;
  
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
                source={{ uri: balance.icon }}
                style={styles.currencyIcon}
              />
              <Text style={[styles.currencyName, { color: colors.textPrimary }]}>{balance.name}</Text>
            </View>
            
            {hasChange && balance.change && (
              <View style={[
                styles.changeContainer,
                isPositiveChange ? styles.positiveChange : styles.negativeChange
              ]}>
                {isPositiveChange ? (
                  <ArrowUpRight size={14} color={colors.success} />
                ) : (
                  <ArrowDownRight size={14} color={colors.error} />
                )}
                <Text style={[
                  styles.changeText,
                  isPositiveChange ? styles.positiveChangeText : styles.negativeChangeText
                ]}>
                  {isPositiveChange ? '+' : ''}{balance.change?.percentage}%
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
              {balance.symbol === '$' ? `${balance.symbol}${balance.amount.toLocaleString()}` : 
                `${balance.amount.toLocaleString()} ${balance.symbol}`}
            </Text>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Receive</Text>
            </TouchableOpacity>
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