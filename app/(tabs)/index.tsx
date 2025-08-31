import React, { useState, useRef, useEffect } from 'react';
import { useUsersStore } from '@/store/users-store';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownLeft, Plus, Send, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import TransactionCard from '@/components/TransactionCard';
import Avatar from '@/components/Avatar';
import BalanceCard from '@/components/BalanceCard';
import OrganizationCard from '@/components/OrganizationCard';
import PaginationDots from '@/components/PaginationDots';
import ThemeToggle from '@/components/ThemeToggle';
import WalletHashDisplay from '@/components/WalletHashDisplay';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useTransactionStore } from '@/store/transaction-store';
import { db } from '@/firebaseConfig';
import { QuerySnapshot } from 'firebase/firestore';
import { collection, getDocs, query, where } from "firebase/firestore";

import { organizations } from '@/mocks/organizations';
import { getAccountBalances, toDisplayFromBase } from '../utils/xion';
import { syncPendingTransactionsStatus } from '../utils/syncTransactionStatus';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 300;

type Transaction = {
  id: string;
  senderId?: string;
  receiverId?: string;
  amount: number | string;
  currency?: string;
  type: string;
  date: string;
  note?: string;
  status: string;
};
type XionBalance = {
  id: string;
  name?: string;
  amount: number | string;
  currency?: string;
  icon?: string;
  denom?: string;
};

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const { transactions, fetchTransactionHistory } = useTransactionStore();
  const [firestoreTransactions, setFirestoreTransactions] = useState<Transaction[]>([]);
  const { users, fetchAllUsers } = useUsersStore();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeBalanceIndex, setActiveBalanceIndex] = useState(0);
  const [resolvedBalances, setResolvedBalances] = useState([]);
  const [balances, setBalances] = useState<XionBalance[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const router = require('expo-router').useRouter();

  async function fetchBalance() {
    if (user?.wallets?.[0]?.account) {
      try {
        const balancesArr = await getAccountBalances(user.wallets[0].account);
        const mappedBalances = balancesArr
          .filter((item: any) => item.denom === 'uxion')
          .map((item: any, idx: number): XionBalance => ({
            id: item.denom || String(idx),
            name: 'XION',
            amount: toDisplayFromBase(item.amount),
            currency: 'XION',
            icon: '',
            denom: item.denom,
          }));
        setBalances(mappedBalances);
        if (!mappedBalances.length) {
          console.warn('No balance found for wallet:', user.wallets[0].account);
        }
      } catch (err) {
        console.error('Error fetching XION balance:', err);
      }
    }
  }

  useEffect(() => {
    fetchBalance();
    fetchAllUsers();
    fetchTransactionHistory();
    fetchTransactionsFromFirestore();
  }, [user]);

  async function fetchTransactionsFromFirestore() {
    if (!user?.wallets?.[0]?.account) return;
    try {
      const wallet = user.wallets[0].account;
      const qSent = query(collection(db, "transactions"), where("sender", "==", wallet));
      const qReceived = query(collection(db, "transactions"), where("recipient", "==", wallet));
      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(qSent),
        getDocs(qReceived)
      ]);
      const sentTxs = sentSnap.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          senderId: data.sender,
          receiverId: data.recipient,
          amount: data.amount,
          currency: data.currency,
          status: String(data.status ?? ''),
          type: data.direction === 'sent' ? 'send' : 'receive',
          date: data.timestamp && data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000).toISOString() : '',
          note: data.note || '',
        };
      });
      const receivedTxs = receivedSnap.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          senderId: data.sender,
          receiverId: data.recipient,
          amount: data.amount,
          currency: data.currency,
          status: String(data.status ?? ''),
          type: data.direction === 'received' ? 'receive' : 'send',
          date: data.timestamp && data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000).toISOString() : '',
          note: data.note || '',
        };
      });
      setFirestoreTransactions([...sentTxs, ...receivedTxs]);
    } catch (err) {
      console.error("Erro ao buscar transações do Firestore:", err);
    }
  }

  const recentTransactions = firestoreTransactions
    .map((tx) => ({
      ...tx,
      status: String(tx.status ?? ''),
    }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const currentUserWalletAddress = user?.wallets?.[0]?.account ?? '';

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    await fetchAllUsers();
    await fetchTransactionHistory();
    await syncPendingTransactionsStatus();
    await fetchTransactionsFromFirestore();
    setRefreshing(false);
  }, [user]);

  const handleBalanceScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CARD_WIDTH);
    setActiveBalanceIndex(index);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <ThemeToggle style={styles.themeToggle} />
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Avatar 
              uri={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80'} 
              size={50}
              showBorder
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceCarouselContainer}>
        {balances.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={balances}
            keyExtractor={(item, idx) => (item.denom ? item.denom : String(idx))}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.balanceCarouselContent}
            onMomentumScrollEnd={handleBalanceScroll}
            renderItem={({ item }) => (
              <BalanceCard 
                balance={item}
                onPress={() => {}}
              />
            )}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No balance found</Text>
          </View>
        )}
        <PaginationDots total={balances.length} current={activeBalanceIndex} />
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSendMoney}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
              <ArrowUpRight size={24} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleRequestMoney}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(41, 128, 185, 0.2)' }]}>
              <ArrowDownLeft size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Request Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(241, 196, 15, 0.2)' }]}>
              <Plus size={24} color={colors.highlight} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Add Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/payments')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              currentUserId={currentUserWalletAddress}
              contacts={user?.contacts || []}
              users={users}
              onPress={() => {
                // Navigate to transaction details
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No recent transactions</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  balanceCarouselContainer: {
    marginBottom: 24,
  },
  balanceCarouselContent: {
    paddingLeft: 16,
    paddingRight: 32,
  },
  organizationsSection: {
    marginBottom: 24,
  },
  organizationsCarouselContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  activitySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 16,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});




