import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';
import { organizations } from '@/mocks/organizations';
import { useTransactionStore } from '@/store/transaction-store';

export default function DonateScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendMoney } = useTransactionStore();
  const colors = useThemeColors();
  
  // Find the organization by id
  const organization = organizations.find(org => org.id === organizationId);
  
  useEffect(() => {
    if (customAmount) {
      setAmount('custom');
    }
  }, [customAmount]);
  
  const handleAmountSelect = (value: string) => {
    setAmount(value);
    if (value !== 'custom') {
      setCustomAmount('');
    }
  };
  
  const handleCustomAmountChange = (text: string) => {
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
    
    setCustomAmount(filtered);
  };
  
  const getDonationAmount = () => {
    if (amount === 'custom' && customAmount) {
      return parseFloat(customAmount);
    }
    return amount ? parseFloat(amount) : 0;
  };
  
  const handleDonate = async () => {
    const donationAmount = getDonationAmount();
    
    if (!donationAmount || donationAmount <= 0) {
      Alert.alert('Error', 'Please select or enter a valid donation amount');
      return;
    }
    
    if (!isAnonymous && (!name || !email)) {
      Alert.alert('Error', 'Please enter your name and email');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would connect to a payment processor
      // For demo purposes, we'll use the sendMoney function
      if (organization) {
        await sendMoney(
          organization.id,
          donationAmount,
          'USD',
          `Donation to ${organization.name}${isRecurring ? ' (Monthly)' : ''}`
        );
        
        // Show success message
        Alert.alert(
          'Thank You!',
          `Your ${isRecurring ? 'monthly ' : ''}donation of $${donationAmount.toFixed(2)} to ${organization.name} was successful.`,
          [
            { 
              text: 'OK', 
              onPress: () => router.push('/(tabs)') 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!organization) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textPrimary }]}>Organization not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: 'Make a Donation' }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.organizationContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image
            source={{ uri: organization.logo }}
            style={styles.organizationLogo}
            contentFit="cover"
          />
          <View style={styles.organizationInfo}>
            <Text style={[styles.organizationName, { color: colors.textPrimary }]}>{organization.name}</Text>
            <Text style={[styles.organizationDescription, { color: colors.textSecondary }]}>{organization.description}</Text>
          </View>
        </View>
        
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Donation Amount</Text>
          
          <View style={styles.amountOptions}>
            {['10', '25', '50', '100', '250', 'custom'].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.amountOption,
                  { 
                    backgroundColor: amount === value ? colors.primary : colors.card,
                    borderColor: amount === value ? colors.primary : colors.border
                  }
                ]}
                onPress={() => handleAmountSelect(value)}
              >
                <Text style={[
                  styles.amountOptionText,
                  { color: amount === value ? colors.white : colors.textPrimary }
                ]}>
                  {value === 'custom' ? 'Custom' : `$${value}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {amount === 'custom' && (
            <View style={[styles.customAmountContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>$</Text>
              <TextInput
                style={[styles.customAmountInput, { color: colors.textPrimary }]}
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            </View>
          )}
        </View>
        
        <View style={styles.frequencySection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Donation Frequency</Text>
          
          <View style={styles.frequencyOptions}>
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                { 
                  backgroundColor: !isRecurring ? colors.primary : colors.card,
                  borderColor: !isRecurring ? colors.primary : colors.border
                }
              ]}
              onPress={() => setIsRecurring(false)}
            >
              <Text style={[
                styles.frequencyOptionText,
                { color: !isRecurring ? colors.white : colors.textPrimary }
              ]}>
                One-time
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                { 
                  backgroundColor: isRecurring ? colors.primary : colors.card,
                  borderColor: isRecurring ? colors.primary : colors.border
                }
              ]}
              onPress={() => setIsRecurring(true)}
            >
              <Text style={[
                styles.frequencyOptionText,
                { color: isRecurring ? colors.white : colors.textPrimary }
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.donorSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Donor Information</Text>
            <TouchableOpacity
              style={styles.anonymousToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[
                styles.toggleTrack,
                { backgroundColor: isAnonymous ? colors.primary : colors.lightGray }
              ]}>
                <View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: colors.white,
                    transform: [{ translateX: isAnonymous ? 16 : 0 }]
                  }
                ]} />
              </View>
              <Text style={[styles.anonymousText, { color: colors.textPrimary }]}>Donate Anonymously</Text>
            </TouchableOpacity>
          </View>
          
          {!isAnonymous && (
            <View style={styles.donorForm}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        </View>
        
        <View style={styles.summarySection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.summaryGradient}
          >
            <View style={[styles.summaryContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Donation Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Amount</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  ${getDonationAmount().toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Frequency</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  {isRecurring ? 'Monthly' : 'One-time'}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Processing Fee</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>$0.00</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                  ${getDonationAmount().toFixed(2)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <Button
          title={`Donate ${isRecurring ? 'Monthly' : 'Now'}`}
          onPress={handleDonate}
          gradient
          size="large"
          style={styles.donateButton}
          isLoading={isLoading}
          disabled={!amount || (amount === 'custom' && !customAmount)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    width: 200,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  organizationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  organizationLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  organizationInfo: {
    flex: 1,
  },
  organizationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  organizationDescription: {
    fontSize: 14,
  },
  amountSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  amountOption: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  amountOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 20,
  },
  frequencySection: {
    marginBottom: 24,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  frequencyOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donorSection: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    padding: 2,
    marginRight: 8,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  anonymousText: {
    fontSize: 14,
  },
  donorForm: {
    gap: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  donateButton: {
    width: '100%',
    marginBottom: 16,
  },
});