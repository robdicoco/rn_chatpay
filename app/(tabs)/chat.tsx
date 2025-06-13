import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import ConversationItem from '@/components/ConversationItem';
import { useThemeColors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';

export default function ChatScreen() {
  const { conversations, setActiveConversation } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();
  
  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        // This is a simplified search that would need to be improved in a real app
        const lastMessageText = conv.lastMessage.text.toLowerCase();
        return lastMessageText.includes(searchQuery.toLowerCase());
      })
    : conversations;
  
  const handleConversationPress = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Messages</Text>
      <TouchableOpacity style={[styles.newChatButton, { backgroundColor: colors.primary }]}>
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
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
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No conversations yet</Text>
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