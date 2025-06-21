import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useThemeStore } from '@/store/theme-store';
import { useThemeColors } from '@/constants/Colors';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

export default function ThemeToggle({ size = 24, style }: ThemeToggleProps) {
  const { mode, toggleTheme } = useThemeStore();
  const colors = useThemeColors();
  
  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.lightGray }, style]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      {mode === 'dark' ? (
        <Sun size={size} color={colors.highlight} />
      ) : (
        <Moon size={size} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});