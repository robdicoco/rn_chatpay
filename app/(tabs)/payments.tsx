import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import TransactionCard from '@/components/TransactionCard';
import { useThemeColors } from '@/constants/colors';
import { useTransactionStore } from '@/store/transaction-store';

export default function PaymentsScreen() {
  const { transactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sent' | 'received'>('all');
  const colors = useThemeColors();
  
  const filteredTransactions = transactions
    .filter(transaction => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'sent') return transaction.type === 'send';
      if (activeFilter === 'received') return transaction.type === 'receive';
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleSendMoney = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/send-money');
  };

  const handleRequestMoney = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/request-money');
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Transactions</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'all' ? colors.primary : colors.lightGray }
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'all' ? colors.white : colors.textSecondary }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'sent' ? colors.primary : colors.lightGray }
          ]}
          onPress={() => setActiveFilter('sent')}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'sent' ? colors.white : colors.textSecondary }
          ]}>
            Sent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: activeFilter === 'received' ? colors.primary : colors.lightGray }
          ]}
          onPress={() => setActiveFilter('received')}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'received' ? colors.white : colors.textSecondary }
          ]}>
            Received
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleSendMoney}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: 'rgba(231, 76, 60, 0.2)' }]}>
            <ArrowUpRight size={20} color={colors.alert} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Send Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleRequestMoney}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
            <ArrowDownLeft size={20} color={colors.success} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Request Money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() => {
              // Navigate to transaction details
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No transactions found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your transaction history will appear here
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
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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