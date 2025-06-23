import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Send, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import MessageBubble from '@/components/MessageBubble';
import Avatar from '@/components/Avatar';
import { useThemeColors } from '@/constants/Colors';
import { useChatStore } from '@/store/chat-store';
import { contacts, currentUser } from '@/mocks/users';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages, conversations, sendMessage, activeConversationId } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();
  
  const flatListRef = useRef<FlatList>(null);
  
  // Find the conversation and other participant
  const conversation = conversations.find(c => c.id === id);
  const otherParticipantId = conversation?.participants.find(
    participantId => participantId !== currentUser.id
  );
  const otherParticipant = contacts.find(contact => contact.id === otherParticipantId);
  
  // Filter messages for this conversation
  const conversationMessages = messages
    .filter(message => message.conversationId === id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && conversationMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationMessages.length]);
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !otherParticipantId) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      sendMessage(messageText.trim(), otherParticipantId);
      setMessageText('');
      setIsLoading(false);
    }, 500);
  };
  
  const handleSendMoney = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push({
      pathname: '/send-money',
      params: { receiverId: otherParticipantId }
    });
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: otherParticipant?.name || 'Chat',
          headerRight: () => (
            <Avatar
              uri={otherParticipant?.avatar || ''}
              size={36}
              style={{ marginRight: 8 }}
            />
          ),
        }}
      />
      
      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onTransactionPress={(transactionId) => {
              // Navigate to transaction details
            }}
          />
        )}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No messages yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Send a message to start the conversation
            </Text>
          </View>
        }
      />
      
      <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[styles.sendMoneyButton, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}
          onPress={handleSendMoney}
        >
          <DollarSign size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={[styles.textInputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            (!messageText.trim() || isLoading) && [styles.sendButtonDisabled, { backgroundColor: 'rgba(46, 204, 113, 0.5)' }]
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Send size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  sendMoneyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});