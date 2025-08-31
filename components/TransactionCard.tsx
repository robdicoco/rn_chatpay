import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle } from 'lucide-react-native';

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

  // Clean, profissional, UX/UI refinado
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        marginBottom: 12,
        backgroundColor: colors.card,
        borderWidth: 0,
        shadowColor: colors.textPrimary,
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
        minHeight: 72,
      }}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Avatar */}
      <View style={{ marginRight: 14 }}>
        {otherPartyUser?.avatar || otherPartyUser?.photo_url ? (
          <Avatar uri={otherPartyUser?.avatar || otherPartyUser?.photo_url || ''} size={44} />
        ) : (
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontWeight: 'bold', fontSize: 18 }}>
              {otherPartyUser?.name?.[0] || otherPartyXionAddress?.slice(0,2) || '?'}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, letterSpacing: 0.1 }} numberOfLines={1}>
            {otherPartyUser?.name || otherPartyXionAddress || 'Unknown'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isSender ? (
              <ArrowUpRight size={18} color={colors.alert} style={{ marginRight: 2 }} />
            ) : (
              <ArrowDownLeft size={18} color={colors.success} style={{ marginRight: 2 }} />
            )}
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: isSender ? colors.alert : colors.success,
              letterSpacing: 0.2,
            }}>
              {isSender ? '-' : '+'}{transaction.amount} {transaction.currency}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          {transaction.status === 'completed' || transaction.status === 'confirmed' ? (
            <CheckCircle size={16} color={colors.success} style={{ marginRight: 4 }} />
          ) : transaction.status === 'pending' ? (
            <Clock size={16} color={colors.highlight} style={{ marginRight: 4 }} />
          ) : (
            <XCircle size={16} color={colors.alert} style={{ marginRight: 4 }} />
          )}
          <Text style={{
            fontSize: 13,
            color: transaction.status === 'completed' || transaction.status === 'confirmed'
              ? colors.success
              : transaction.status === 'pending'
                ? colors.highlight
                : colors.alert,
            fontWeight: '500',
            letterSpacing: 0.1,
          }}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
            {formatDate(transaction.date)}
          </Text>
        </View>

        {transaction.note && (
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2, letterSpacing: 0.1 }} numberOfLines={1}>
            {transaction.note}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}