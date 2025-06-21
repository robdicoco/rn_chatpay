import { create } from 'zustand';
import { conversations, messages, Message } from '@/mocks/messages';
import { currentUser } from '@/mocks/users';

interface ChatState {
  conversations: typeof conversations;
  messages: typeof messages;
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (text: string, receiverId: string, transactionDetails?: {
    amount: number;
    currency: string;
    type: 'send' | 'request';
  }) => void;
  markConversationAsRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: conversations,
  messages: messages,
  activeConversationId: null,
  isLoading: false,
  error: null,
  
  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
    get().markConversationAsRead(conversationId);
  },
  
  sendMessage: (text, receiverId, transactionDetails) => {
    const { conversations, messages, activeConversationId } = get();
    
    // Find existing conversation or create a new one
    let conversationId = activeConversationId;
    if (!conversationId) {
      const existingConversation = conversations.find(
        c => c.participants.includes(receiverId) && c.participants.includes(currentUser.id)
      );
      
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        conversationId = `conv-${conversations.length + 1}`;
        const newConversation = {
          id: conversationId,
          participants: [currentUser.id, receiverId],
          lastMessage: {} as Message, // Will be updated below
          unreadCount: 0,
        };
        set({ conversations: [...conversations, newConversation] });
      }
      set({ activeConversationId: conversationId });
    }
    
    // Create new message
    const newMessage: Message = {
      id: `msg-${messages.length + 1}`,
      conversationId,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    // Add transaction details if provided
    if (transactionDetails) {
      const transactionId = `tx-${Date.now()}`;
      newMessage.attachedTransaction = {
        id: transactionId,
        amount: transactionDetails.amount,
        currency: transactionDetails.currency,
        status: 'completed',
        type: transactionDetails.type,
      };
    }
    
    // Update messages
    const updatedMessages = [...messages, newMessage];
    
    // Update conversation's last message and unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: newMessage,
        };
      }
      return conv;
    });
    
    set({
      messages: updatedMessages,
      conversations: updatedConversations,
    });
  },
  
  markConversationAsRead: (conversationId) => {
    const { conversations, messages } = get();
    
    // Mark all messages in the conversation as read
    const updatedMessages = messages.map(msg => {
      if (msg.conversationId === conversationId && !msg.isRead && msg.receiverId === currentUser.id) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    
    // Update conversation's unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
        };
      }
      return conv;
    });
    
    set({
      messages: updatedMessages,
      conversations: updatedConversations,
    });
  },
}));