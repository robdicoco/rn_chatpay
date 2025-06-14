import { Tabs } from 'expo-router';
import React from 'react';
// import { Platform } from 'react-native';

import { Home, MessageSquare, Send, User } from 'lucide-react-native';
import { useThemeColors } from '@/constants/colors';
// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  // const colorScheme = useColorScheme();

  const colors = useThemeColors();

  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
  {/*<Tabs
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
          // Use a transparent background on iOS to show the blur effect
          position: 'absolute',
        },
        default: {},
      }),
    }}>*/}

      {/* <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      /> */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => <Send size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
