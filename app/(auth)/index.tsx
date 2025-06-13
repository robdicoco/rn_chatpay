import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
  const colors = useThemeColors();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>ChatPay Go</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Send money instantly to anyone, anywhere in the world
        </Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>💬</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Chat with friends while sending money</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>🌍</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Global payments with low fees</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureIconText}>🔒</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>Secure and encrypted transactions</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Create Account"
          onPress={() => router.push('/signup')}
          gradient
          size="large"
          style={styles.button}
        />
        <Button
          title="Log In"
          onPress={() => router.push('/login')}
          variant="outline"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
});