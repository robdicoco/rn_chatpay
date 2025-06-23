import React, { useState } from 'react';
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
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/Colors';
import { contacts } from '@/mocks/users';
import { useTransactionStore } from '@/store/transaction-store';
import { useChatStore } from '@/store/chat-store';

export default function RequestMoneyScreen() {
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { requestMoney } = useTransactionStore();
  const { sendMessage } = useChatStore();
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
  
  const handleRequestMoney = async () => {
    if (!selectedContact) {
      Alert.alert('Error', 'Please select a contact');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(true);
    
    try {
      // Request money
      const transaction = await requestMoney(
        selectedContact.id,
        parseFloat(amount),
        'USD',
        note
      );
      
      // Send message with transaction details
      sendMessage(
        `I've requested $${amount}${note ? ` for ${note}` : ''}`,
        selectedContact.id,
        {
          amount: parseFloat(amount),
          currency: 'USD',
          type: 'request',
        }
      );
      
      // Show success message
      Alert.alert(
        'Success',
        `You've requested $${amount} from ${selectedContact.name}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request money. Please try again.');
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
      <Stack.Screen options={{ title: 'Request Money' }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fromSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>From</Text>
          
          {selectedContact ? (
            <View style={[styles.selectedContactContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Avatar uri={selectedContact.avatar} size={60} />
              <View style={styles.selectedContactInfo}>
                <Text style={[styles.selectedContactName, { color: colors.textPrimary }]}>{selectedContact.name}</Text>
                <Text style={[styles.selectedContactDetail, { color: colors.textSecondary }]}>
                  {selectedContact.isRegistered ? 'Registered User' : 'Will receive SMS notification'}
                </Text>
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
              <Text style={[styles.contactsTitle, { color: colors.textPrimary }]}>Select a contact</Text>
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
                    <Avatar uri={contact.avatar} size={60} />
                    <Text style={[styles.contactName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {contact.name}
                    </Text>
                    {!contact.isRegistered && (
                      <View style={[styles.notRegisteredBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.notRegisteredText}>New</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
          
          <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>$</Text>
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
                <Text style={[styles.quickAmountText, { color: colors.textPrimary }]}>${value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.noteSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What's it for? (Optional)</Text>
          
          <TextInput
            style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
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
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Request Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Amount Requested</Text>
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
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>They'll Pay</Text>
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
          title="Request Money"
          onPress={handleRequestMoney}
          gradient
          size="large"
          style={styles.requestButton}
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
  fromSection: {
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
  requestButton: {
    width: '100%',
  },
});