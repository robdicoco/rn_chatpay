import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import ConversationItem from '@/components/ConversationItem';
import { useThemeColors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { User } from 'lucide-react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig';

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    conversations,
    fetchConversationsFromFirestore,
    setActiveConversation,
    isLoading,
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();
  const [conversationsWithContact, setConversationsWithContact] = useState<any[]>([]);

  useEffect(() => {
    async function enrichConversations() {
      if (!user?.id || conversations.length === 0) {
        setConversationsWithContact([]);
        return;
      }
      const enriched = await Promise.all(
        conversations.map(async (conv) => {
          const otherId = conv.participants.find((id: string) => id !== user.id);
          if (!otherId) return { ...conv, contactName: "Unknown", contactAvatar: "" };
          const ref = doc(db, "users", otherId);
          const snap = await getDoc(ref);
          let contactName = "Unknown";
          let contactAvatar = "";
          if (snap.exists()) {
            const data = snap.data();
            contactName = data.name || data.display_name || "Unknown";
            contactAvatar = data.avatar || data.photo_url || data.foto || "";
          }
          return { ...conv, contactName, contactAvatar };
        })
      );
      setConversationsWithContact(enriched);
    }
    enrichConversations();
  }, [conversations, user?.id]);

  // Buscar conversas do usuário ao abrir ou ao enviar mensagem
  // Atualiza conversas ao focar na tela
  // Removido redirecionamento automático e bloqueio de renderização por falta de wallet. O fluxo será manual.
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchConversationsFromFirestore(user.id);
      }
    }, [user?.id])
  );

  // Filtro de busca (por texto da última mensagem)
  const filteredConversationsWithContact = searchQuery
    ? conversationsWithContact.filter(conv =>
        (conv.contactName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.message || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversationsWithContact;

  const handleConversationPress = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Messages</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[
            styles.newChatButton,
            {
              backgroundColor: colors.card,
              marginRight: 12,
              borderWidth: 2,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => router.push('/chat/contacts')}
        >
          <User size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.newChatButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/chat/add-contact')}
        >
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
      <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: colors.textPrimary }]}
        placeholder="Search messages..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={filteredConversationsWithContact}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            contactName={item.contactName}
            contactAvatar={item.contactAvatar}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              {isLoading ? 'Loading...' : 'No conversations yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start a new chat by tapping the + button
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
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
});