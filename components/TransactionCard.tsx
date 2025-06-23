import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { Transaction } from '@/mocks/transactions';
import { contacts, currentUser } from '@/mocks/users';
import Avatar from './Avatar';
import { useThemeColors } from '@/constants/Colors';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const colors = useThemeColors();
  const isSender = transaction.senderId === currentUser.id;
  const otherPartyId = isSender ? transaction.receiverId : transaction.senderId;
  const otherParty = contacts.find(contact => contact.id === otherPartyId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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
        <Avatar uri={otherParty?.avatar || ''} size={50} />
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{otherParty?.name || 'Unknown'}</Text>
          <View style={styles.amountContainer}>
            <Text style={[
              styles.amount,
              isSender ? styles.sentAmount : styles.receivedAmount
            ]}>
              {isSender ? '-' : '+'}{transaction.currency} {transaction.amount.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statusContainer}>
            {getTransactionIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
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