import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';

import Avatar from './Avatar';
import { useThemeColors } from '@/constants/colors';

export type Transaction = {
  id: string;
  senderId?: string;
  receiverId?: string;
  amount: number | string;
  currency?: string;
  type: string;
  date: string;
  note?: string;
  status: string;
  [key: string]: any;
};

export type Contact = {
  id: string;
  name?: string;
  avatar?: string;
  walletAddress?: string;
  account?: string;
  uid_contato?: string;
  uid_user?: string;
};

export type TransactionCardProps = {
  transaction: Transaction;
  currentUserId: string;
  contacts?: Contact[];
  users?: Array<{
    uid: string;
    name?: string;
    avatar?: string;
    photo_url?: string;
    wallets?: Array<{ account: string }>;
  }>;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sentAmount: {
    color: '#E74C3C',
  },
  receivedAmount: {
    color: '#2ECC71',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
  },
  note: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default function TransactionCard({ transaction, currentUserId, contacts = [], users = [], onPress }: TransactionCardProps) {
  const colors = useThemeColors();
  const isSender = transaction.senderId === currentUserId;
  const otherPartyXionAddress = isSender ? transaction.receiverId : transaction.senderId;
  const otherPartyUser = users.find(u => u.wallets?.[0]?.account === otherPartyXionAddress);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return colors.primary;
      case 'pending':
        return colors.highlight;
      case 'failed':
        return colors.alert;
      default:
        return colors.textSecondary;
    }
  };

  const getTransactionIcon = () => {
    if (transaction.status === 'pending') {
      return <Clock size={20} color={getStatusColor()} />;
    }
    return isSender ? (
      <ArrowUpRight size={20} color={colors.alert} />
    ) : (
      <ArrowDownLeft size={20} color={colors.primary} />
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {otherPartyUser?.avatar || otherPartyUser?.photo_url ? (
          <Avatar uri={otherPartyUser?.avatar || otherPartyUser?.photo_url || ''} size={50} />
        ) : (
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontWeight: 'bold', fontSize: 20 }}>
              {otherPartyUser?.name?.[0] || otherPartyXionAddress?.slice(0,2) || '?'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.textPrimary }]}> 
            {otherPartyUser?.name || otherPartyXionAddress || 'Unknown'}
          </Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, isSender ? styles.sentAmount : styles.receivedAmount]}>
              {isSender ? '-' : '+'}{transaction.amount} {transaction.currency}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.statusContainer}>
            {getTransactionIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {transaction.status}
            </Text>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(transaction.date)}</Text>
        </View>

        {transaction.note && (
          <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}