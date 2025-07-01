import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownLeft, Plus, Send, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
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
import { collection, getDocs } from 'firebase/firestore';

import { Balance } from '@/mocks/balances';
import { organizations } from '@/mocks/organizations';
import { getAccountBalance } from '../utils/xion_rpc';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 300;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeBalanceIndex, setActiveBalanceIndex] = useState(0);
  const [resolvedBalances, setResolvedBalances] = useState([]);
  const [balances, setBalances] = useState<Balance[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'balances')).then((querySnapshot: QuerySnapshot) => {
      const fetchedBalances: Balance[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBalances.push(doc.data() as Balance);
      });
      setBalances(fetchedBalances);
      
    });
  }, []); // Only run once on mount

  var myBalance =  getAccountBalance('xion1ydp3wsw4rkgzxsvn0dm34ec0866sdz58mw555xzrl7sg8x8uwuqs7yg5ls');
  const value = myBalance.then((res) => {
    console.log('myBalance', res);
    return res;
  });
  

  const flatListRef = useRef<FlatList>(null);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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

      {user?.wallets?.[0]?.account && (
        <WalletHashDisplay hash={user.wallets?.[0]?.account} />
      )}

      <View style={styles.balanceCarouselContainer}>
        <FlatList
          ref={flatListRef}
          data={balances} // Now using the resolved balances

          keyExtractor={(item) => item.id}
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
              onPress={() => {
                // Navigate to balance details
              }}
            />
          )}
        />
        <PaginationDots total={ balances.length} current={activeBalanceIndex} />
      </View>

      <View style={styles.organizationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Donate for a Cause</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={organizations}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.organizationsCarouselContent}
          renderItem={({ item }) => (
            <OrganizationCard 
              organization={item} 
              onPress={() => {
                router.push(`/(tabs)/organization/${item.id}`);
              }}
            />
          )}
        />
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



