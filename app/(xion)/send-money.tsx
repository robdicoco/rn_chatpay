import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';
// Removido o mock de contatos
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useTransactionStore } from '@/store/transaction-store';
import { useChatStore } from '@/store/chat-store';
import { useAbstraxionSigningClient, useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

export type Contact = {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  photo?: string;
  uid_contato: string;
  uid_user: string;
};

export default function SendMoneyScreen() {
  const { client } = useAbstraxionSigningClient();
  const { data: account, isConnected } = useAbstraxionAccount();
  const { receiverId } = useLocalSearchParams<{ receiverId?: string }>();

  // Garante que o contato selecionado tenha o campo walletAddress
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Busca contatos reais do Firestore
  useEffect(() => {
    async function fetchContacts() {
      const db = getFirestore();
      const userId = require('@/store/auth-store').useAuthStore.getState().user?.id;
      if (!userId) return;
      const q = query(collection(db, "contact"), where("uid_user", "==", userId));
      const snapshot = await getDocs(q);
      const contactsList: Contact[] = await Promise.all(snapshot.docs.map(async contactDoc => {
        const contatoId = contactDoc.data().uid_contato;
        const userSnap = await getDoc(doc(db, "users", contatoId));
        let avatar = "";
        if (userSnap.exists()) {
          const userData = userSnap.data() as Record<string, any>;
          avatar = userData.avatar || userData.photo_url || userData.foto || "";
        }
        return {
          id: contatoId,
          name: contactDoc.data().name,
          email: contactDoc.data().email,
          avatar,
          uid_contato: contatoId,
          uid_user: userId,
        };
      }));
      setContacts(contactsList);
      if (receiverId) {
        const found = contactsList.find(c => c.id === receiverId);
        setSelectedContact(found ?? null);
      }
    }
    fetchContacts();
  }, [receiverId]);
  const [recipientWallet, setRecipientWallet] = useState<string | null>(null);

  // Busca o wallet address do destinatário na coleção users
  useEffect(() => {
    async function fetchRecipientWallet() {
      if (selectedContact?.uid_contato) {
        const db = getFirestore();
        const userRef = doc(db, 'users', selectedContact.uid_contato);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.wallets && userData.wallets.length > 0 && userData.wallets[0].account) {
            setRecipientWallet(userData.wallets[0].account);
          } else {
            setRecipientWallet(null);
          }
        } else {
          setRecipientWallet(null);
        }
      } else {
        setRecipientWallet(null);
      }
    }
    fetchRecipientWallet();
  }, [selectedContact]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'XION' | 'USDC'>('XION');
  
  const { sendMoney } = useTransactionStore();
  const { sendMessageToFirestore } = useChatStore();
  const { transferTokens } = require('@/app/utils/web3_abstraction_helper').useWeb3Helper();
  const colors = useThemeColors();
  
  const handleAmountChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      return;
    }
    
    setAmount(filtered);
  };
  
  const handleSendMoney = async () => {
    if (!selectedContact) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

  
    if (!isConnected) {
      Alert.alert('Error', 'Wallet is not connected. Please connect your wallet.');
      return;
    }
    if (!client) {
      Alert.alert('Error', 'Wallet client is not available.');
      return;
    }
    if (!account || !account.bech32Address) {
      console.log('[DEBUG] Falha: account ou bech32Address está undefined');
      Alert.alert('Error', 'Wallet is not connected or address not found.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsLoading(true);

    try {
      const denom = selectedCurrency === 'XION' ? 'uxion' : 'uusdc';
      const amountMicro = (parseFloat(amount) * 1_000_000).toString();
      const sender = account && account.bech32Address ? account.bech32Address : null;
      if (!sender) throw new Error('Connected wallet does not have a valid address.');
      const recipient = recipientWallet;
      if (!recipient) throw new Error('Recipient does not have a connected wallet.');
      const result = await transferTokens({ sender, recipient, amount: amountMicro, denom });
      const txHash = result.transactionHash;

      // Envia mensagem especial no chat
      const userId = require('@/store/auth-store').useAuthStore.getState().user?.id;
      const chatId = [userId, selectedContact.id].sort().join('_');
      await sendMessageToFirestore(chatId, {
        message: `Payment of ${amount} ${selectedCurrency}${note ? ` (${note})` : ''}`,
        senderId: userId,
        attachedTransaction: {
          amount: parseFloat(amount),
          currency: selectedCurrency,
          type: 'send',
          txHash,
        }
      });

      // Atualiza saldo e histórico
      if (typeof require !== 'undefined') {
        const { useTransactionStore } = require('@/store/transaction-store');
        await useTransactionStore.getState().fetchTransactionHistory();
      }

      Alert.alert(
        'Success',
        `You sent ${amount} ${selectedCurrency} to ${selectedContact.name}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Erro ao enviar:', error);
      let errorMsg = 'Failed to send payment. Please try again.';
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMsg = error.message;
        } else if (typeof error.toString === 'function') {
          errorMsg = error.toString();
        }
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: 'Send Money' }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.recipientSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recipient</Text>
          
          {selectedContact ? (
            <View style={[styles.selectedContactContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Avatar uri={selectedContact.avatar || ''} size={60} />
              <View style={styles.selectedContactInfo}>
                <Text style={[styles.selectedContactName, { color: colors.textPrimary }]}>{selectedContact.name}</Text>
                {/* If contact has no wallet, show onboarding hint */}
                {recipientWallet ? null : (
                  <Text style={[styles.selectedContactDetail, { color: colors.textSecondary }]}>Connect your XION wallet to receive payments.</Text>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.changeButton, { backgroundColor: 'rgba(41, 128, 185, 0.1)' }]}
                onPress={() => setSelectedContact(null)}
              >
                <Text style={[styles.changeButtonText, { color: colors.secondary }]}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.contactsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.contactsTitle, { color: colors.textPrimary }]}>Select a recipient</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contactsList}
              >
                {contacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => setSelectedContact(contact)}
                  >
                    <Avatar uri={contact.avatar || ''} size={60} />
                    <Text style={[styles.contactName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {['XION', 'USDC'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: selectedCurrency === currency ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => setSelectedCurrency(currency as 'XION' | 'USDC')}
              >
                <Text style={{ color: selectedCurrency === currency ? colors.textPrimary : colors.textSecondary, fontWeight: '600' }}>{currency}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>{selectedCurrency === 'XION' ? 'Ξ' : '$'}</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.textPrimary }]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.quickAmountContainer}>
            {[5, 10, 20, 50, 100].map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.quickAmountButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setAmount(value.toString())}
              >
                <Text style={[styles.quickAmountText, { color: colors.textPrimary }]}>{selectedCurrency === 'XION' ? 'Ξ' : '$'}{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.noteSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Note (Optional)</Text>
          
          <TextInput
            style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={100}
          />
        </View>
        
        <View style={styles.summarySection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.summaryGradient}
          >
            <View style={[styles.summaryContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Payment Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Amount</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Fee</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>$0.00</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                  ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
      
      <View style={[styles.buttonContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <Button
          title="Send Money"
          onPress={handleSendMoney}
          gradient
          size="large"
          style={styles.sendButton}
          isLoading={isLoading}
          disabled={!selectedContact || !amount || parseFloat(amount) <= 0}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  recipientSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  selectedContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  selectedContactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  selectedContactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedContactDetail: {
    fontSize: 14,
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  changeButtonText: {
    fontSize: 14,
  },
  contactsContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  contactsTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  contactsList: {
    paddingBottom: 8,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  contactName: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  notRegisteredBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  notRegisteredText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  summarySection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 1,
  },
  summaryContent: {
    borderRadius: 15,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  sendButton: {
    width: '100%',
  },
});