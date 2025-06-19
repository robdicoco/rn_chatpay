import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseService, FirebaseUser } from '@/services/firebase';
import { currentUser, contacts } from '@/mocks/users';
import { useThemeColors } from '@/constants/colors';

export default function FirebaseTestScreen() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const colors = useThemeColors();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await FirebaseService.getAllUsers();
      setUsers(allUsers);
      addTestResult(`Loaded ${allUsers.length} users from Firebase`);
    } catch (error) {
      addTestResult(`Error loading users: ${error}`);
      Alert.alert('Error', 'Failed to load users from Firebase');
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      const testUserData = {
        name: 'Test User',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
        phoneNumber: '+1 (555) 999-9999',
        email: 'test@example.com',
        isRegistered: true,
        walletHash: '0xTestWalletHash123',
        xionWalletHash: 'xion1testwallet123456789',
      };

      const userId = await FirebaseService.createUser(testUserData);
      addTestResult(`Created test user with ID: ${userId}`);
      await loadAllUsers(); // Refresh the list
    } catch (error) {
      addTestResult(`Error creating test user: ${error}`);
      Alert.alert('Error', 'Failed to create test user');
    } finally {
      setLoading(false);
    }
  };

  const checkUserByWalletHash = async (walletHash: string) => {
    setLoading(true);
    try {
      const user = await FirebaseService.checkUserByWalletHash(walletHash);
      if (user) {
        addTestResult(`Found user: ${user.name} (${user.email})`);
      } else {
        addTestResult(`No user found with wallet hash: ${walletHash}`);
      }
    } catch (error) {
      addTestResult(`Error checking user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const syncMockDataToFirebase = async () => {
    setLoading(true);
    try {
      // Sync current user
      const currentUserData = {
        ...currentUser,
        xionWalletHash: currentUser.walletHash || 'xion1currentuser123',
      };
      
      const existingUser = await FirebaseService.checkUserByWalletHash(currentUserData.xionWalletHash);
      if (!existingUser) {
        await FirebaseService.createUser(currentUserData);
        addTestResult('Synced current user to Firebase');
      } else {
        addTestResult('Current user already exists in Firebase');
      }

      // Sync contacts
      for (const contact of contacts) {
        const contactData = {
          ...contact,
          xionWalletHash: contact.walletHash || `xion1contact${contact.id}123`,
        };
        
        const existingContact = await FirebaseService.checkUserByWalletHash(contactData.xionWalletHash);
        if (!existingContact) {
          await FirebaseService.createUser(contactData);
          addTestResult(`Synced contact: ${contact.name}`);
        }
      }

      await loadAllUsers(); // Refresh the list
    } catch (error) {
      addTestResult(`Error syncing mock data: ${error}`);
      Alert.alert('Error', 'Failed to sync mock data to Firebase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Firebase Test Page</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test Firebase integration and data structure
        </Text>

        {/* Test Controls */}
        <View style={styles.testControls}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={loadAllUsers}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Refresh Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.secondary }]}
            onPress={createTestUser}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Create Test User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={() => checkUserByWalletHash('xion1testwallet123456789')}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Check Test User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.secondary }]}
            onPress={syncMockDataToFirebase}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Sync Mock Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#dc3545' }]}
            onPress={clearTestResults}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
          </View>
        )}

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Test Results</Text>
          <View style={[styles.resultsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {testResults.length === 0 ? (
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                No test results yet. Run some tests to see results here.
              </Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} style={[styles.resultText, { color: colors.textPrimary }]}>
                  {result}
                </Text>
              ))
            )}
          </View>
        </View>

        {/* Firebase Users */}
        <View style={styles.usersSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Firebase Users ({users.length})
          </Text>
          {users.map((user, index) => (
            <View key={user.id || index} style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              <Text style={[styles.userWallet, { color: colors.textSecondary }]}>
                Xion: {user.xionWalletHash}
              </Text>
              <Text style={[styles.userDate, { color: colors.textSecondary }]}>
                Created: {user.createdAt?.toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Auth</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  testControls: {
    marginBottom: 24,
    gap: 12,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultsContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 100,
  },
  noResultsText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
  },
  usersSection: {
    marginBottom: 24,
  },
  userCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userWallet: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  userDate: {
    fontSize: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 