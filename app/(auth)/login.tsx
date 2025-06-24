import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/Colors';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, isLoading } = useAuthStore();
  const colors = useThemeColors();
  let isLoadingNow = false;

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    isLoadingNow = true;
    
    if (validateForm()) {
      try {
        await login(email, password);
       
      } catch (error) {
        console.error('Login error:', error);
        isLoadingNow = false;
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // In a real app, this would connect to the social provider
    console.log(`Logging in with ${provider}`);
    
    // For demo purposes, we'll just simulate a successful login
    setTimeout(() => {
      login(`${provider.toLowerCase()}@example.com`, 'social123');
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.background}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Log in to your account to continue</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.secondary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button
            title="Log In"
            onPress={handleLogin}
            gradient
            size="large"
            style={styles.button}
            isLoading={isLoadingNow}
          />
        </View>
        
        <View style={styles.socialContainer}>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Or continue with</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSocialLogin('Google')}
            >
              <Text style={[styles.socialIconText, { color: colors.textPrimary }]}>G</Text>
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Text style={[styles.socialIconText, { color: colors.textPrimary }]}></Text>
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>Apple</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Text style={[styles.socialIconText, { color: colors.textPrimary }]}>f</Text>
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={[styles.signupText, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    width: '100%',
  },
  socialContainer: {
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 6,
    borderWidth: 1,
  },
  socialIconText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});