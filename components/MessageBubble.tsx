import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '@/mocks/messages';
import { currentUser } from '@/mocks/users';
import { useThemeColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
  message: Message;
  onTransactionPress?: (transactionId: string) => void;
}

export default function MessageBubble({ message, onTransactionPress }: MessageBubbleProps) {
  const colors = useThemeColors();
  const isCurrentUser = message.senderId === currentUser.id;
  const hasTransaction = message.attachedTransaction !== undefined;
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionStatusColor = () => {
    if (!message.attachedTransaction) return colors.textSecondary;
    
    switch (message.attachedTransaction.status) {
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

  const renderTransactionBubble = () => {
    if (!message.attachedTransaction) return null;
    
    const { amount, currency, status, type } = message.attachedTransaction;
    const isReceiving = type === 'receive';
    
    return (
      <TouchableOpacity
        style={styles.transactionContainer}
        onPress={() => onTransactionPress && onTransactionPress(message.attachedTransaction!.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.transactionGradient}
        >
          <View style={[styles.transactionContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.transactionTitle, { color: colors.textPrimary }]}>
              {isReceiving ? 'Payment Received' : 'Payment Sent'}
            </Text>
            <Text style={[styles.transactionAmount, { color: colors.textPrimary }]}>
              {currency} {amount.toFixed(2)}
            </Text>
            <View style={styles.transactionStatusContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: getTransactionStatusColor() }
              ]} />
              <Text style={[
                styles.transactionStatus,
                { color: getTransactionStatusColor() }
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      {hasTransaction && renderTransactionBubble()}
      
      <View style={[
        styles.messageBubble,
        isCurrentUser ? [styles.currentUserBubble, { backgroundColor: colors.primary }] : [styles.otherUserBubble, { backgroundColor: colors.lightGray }],
        hasTransaction && styles.messageWithTransaction
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : [styles.otherUserText, { color: colors.textPrimary }]
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          isCurrentUser ? styles.currentUserTimestamp : [styles.otherUserTimestamp, { color: colors.textSecondary }]
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 2,
  },
  currentUserBubble: {
    backgroundColor: '#2ECC71',
  },
  otherUserBubble: {
    backgroundColor: '#F5F5F5',
  },
  messageWithTransaction: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: '#7F8C8D',
  },
  transactionContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  transactionGradient: {
    borderRadius: 16,
    padding: 1,
  },
  transactionContent: {
    borderRadius: 15,
    padding: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  transactionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
});