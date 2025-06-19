import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, ChevronRight, Shield, CreditCard, Bell, Globe, HelpCircle, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import WalletHashDisplay from '@/components/WalletHashDisplay';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const colors = useThemeColors();

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
          style: "destructive"
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: <Shield size={24} color={colors.primary} />,
      title: "Security",
      subtitle: "Protect your account",
      onPress: () => {},
    },
    {
      icon: <CreditCard size={24} color={colors.primary} />,
      title: "Payment Methods",
      subtitle: "Add or remove payment methods",
      onPress: () => {},
    },
    {
      icon: <Bell size={24} color={colors.primary} />,
      title: "Notifications",
      subtitle: "Manage your notifications",
      onPress: () => {},
    },
    {
      icon: <Globe size={24} color={colors.primary} />,
      title: "Language",
      subtitle: "Change app language",
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={24} color={colors.primary} />,
      title: "Help & Support",
      subtitle: "Get help with the app",
      onPress: () => {},
    },
    {
      icon: <Settings size={24} color={colors.primary} />,
      title: "App Settings",
      subtitle: "Customize your experience",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileImageGradient}
          >
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80' }}
              style={styles.profileImage}
              contentFit="cover"
            />
          </LinearGradient>
        </View>
        
        <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
        
        <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.editProfileText, { color: colors.textPrimary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {user?.walletHash && (
        <WalletHashDisplay hash={user.walletHash} />
      )}
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                {item.icon}
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={colors.alert} />
        <Text style={[styles.logoutText, { color: colors.alert }]}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#7F8C8D',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});