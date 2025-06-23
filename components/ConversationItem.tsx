import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Conversation } from '@/mocks/messages';
import { contacts, currentUser } from '@/mocks/users';
import Avatar from './Avatar';
import { useThemeColors } from '@/constants/Colors';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export default function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const colors = useThemeColors();
  const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
  const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const hasTransaction = conversation.lastMessage.attachedTransaction !== undefined;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar 
          uri={otherParticipant?.avatar || ''} 
          size={56}
          showBorder={conversation.unreadCount > 0}
          borderColor={colors.primary}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{otherParticipant?.name || 'Unknown'}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(conversation.lastMessage.timestamp)}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.message, 
              { color: colors.textSecondary },
              conversation.unreadCount > 0 && [styles.unreadMessage, { color: colors.textPrimary }]
            ]}
            numberOfLines={1}
          >
            {hasTransaction && '💰 '}
            {conversation.lastMessage.text}
          </Text>
          
          {conversation.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '500',
  },
  badge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});