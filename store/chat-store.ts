import { create } from 'zustand';
// Persistência local cross-platform (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';
const getLastSeenKey = (chatId: string, userId: string) => `lastSeen_${chatId}_${userId}`;
const setLastSeen = async (chatId: string, userId: string, timestamp: string) => {
  try {
    await AsyncStorage.setItem(getLastSeenKey(chatId, userId), timestamp);
  } catch {}
};
const getLastSeen = async (chatId: string, userId: string): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(getLastSeenKey(chatId, userId));
    return value || '';
  } catch {}
  return '';
};
import { db } from '@/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  orderBy,
  getDoc,
} from 'firebase/firestore';

export interface Message {
  id: string;
  chatId: string;
  message: string;
  senderId: string;
  timestamp: string;
  attachedTransaction?: {
    amount: number;
    currency: 'XION' | 'USDC';
    type: string;
    txHash: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt?: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchConversationsFromFirestore: (userId: string) => Promise<void>;
  fetchMessagesFromFirestore: (chatId: string, userId?: string) => Promise<void>;
  setActiveConversation: (chatId: string) => void;
  sendMessageToFirestore: (
    chatId: string,
    params: { message: string; senderId: string; attachedTransaction?: { amount: number; currency: 'XION' | 'USDC'; type: string; txHash: string } }
  ) => Promise<void>;
  addConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  activeConversationId: null,
  isLoading: false,
  error: null,

  // Buscar conversas do usuário
  fetchConversationsFromFirestore: async (userId: string) => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, 'chats'));
      const snapshot = await getDocs(q);
      const conversations: Conversation[] = [];
      for (const chatDoc of snapshot.docs) {
        const chatId = chatDoc.id;
        // Participantes: extrai do chatId
        const participants = chatId.split('_');
        if (!participants.includes(userId)) continue;
        // Busca última mensagem (ordenando por timestamp decrescente)
        const messagesSnap = await getDocs(query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'desc')
        ));
        const messagesArr = messagesSnap.docs.map(msgDoc => {
          const data = msgDoc.data();
          return {
            id: msgDoc.id,
            chatId,
            message: data.message,
            text: data.message,
            senderId: data.senderId,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : '',
            attachedTransaction: data.attachedTransaction,
          };
        });
        const lastMessage = messagesArr.length > 0 ? messagesArr[0] : null;
        // Calcular não lidas: mensagens recebidas após último visto
        const lastSeen = await getLastSeen(chatId, userId);
        const unreadCount = messagesArr.filter(msg =>
          msg.senderId !== userId &&
          (!lastSeen || new Date(msg.timestamp) > new Date(lastSeen))
        ).length;
        conversations.push({
          id: chatId,
          participants,
          lastMessage,
          unreadCount,
          createdAt: messagesArr[0]?.timestamp || '',
        });
      }
      set({ conversations, isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao buscar conversas', isLoading: false });
    }
  },

  // Buscar mensagens de um chat (subcoleção)
  fetchMessagesFromFirestore: async (chatId: string, userId?: string) => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          chatId,
          message: data.message,
          senderId: data.senderId,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : '',
          attachedTransaction: data.attachedTransaction,
        };
      });
      set({ messages, isLoading: false });
      // Marca como lido: salva timestamp da última mensagem
      if (messages.length > 0 && userId) {
        await setLastSeen(chatId, userId, messages[messages.length - 1].timestamp);
        // Atualiza conversas para zerar unreadCount imediatamente
        await get().fetchConversationsFromFirestore(userId);
      }
    } catch (error) {
      set({ error: 'Erro ao buscar mensagens', isLoading: false });
    }
  },

  // Ativar chat
  setActiveConversation: (chatId) => {
    set({ activeConversationId: chatId });
  },

  // Enviar mensagem para Firestore (subcoleção)
  sendMessageToFirestore: async (chatId, { message, senderId, attachedTransaction }) => {
    set({ isLoading: true });
    try {
      // Garante que o chat existe
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, { createdAt: serverTimestamp() });
      }
      // Usa os parâmetros recebidos diretamente
      const msgData: any = {
        message,
        senderId,
        timestamp: serverTimestamp(),
      };
      // Se attachedTransaction foi passado, inclui no objeto
      if (attachedTransaction) {
        msgData.attachedTransaction = attachedTransaction;
      }
      await addDoc(collection(db, 'chats', chatId, 'messages'), msgData);
      // Atualiza mensagens e conversas imediatamente
      await get().fetchMessagesFromFirestore(chatId);
      await get().fetchConversationsFromFirestore(senderId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao enviar mensagem', isLoading: false });
    }
  },

  // Adicionar conversa localmente (pouco usado, pois agora é via Firestore)
  addConversation: (conversation) => {
    set((state) => ({
      conversations: [...state.conversations, conversation],
    }));
  },
}));