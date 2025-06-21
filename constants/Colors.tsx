/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import { useThemeStore } from '@/store/theme-store';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
// Light theme colors
const lightColors = {
  // Primary color - Green Trust
  primary: '#2ECC71',
  
  // Secondary color - Blue Security
  secondary: '#2980B9',
  
  // Highlight color - Subtle Gold
  highlight: '#F1C40F',
  
  // Background color - Neutral White
  background: '#FFFFFF',
  
  // Text colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  
  // Alert color
  alert: '#E74C3C',
  
  // Additional utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // UI colors
  card: '#FFFFFF',
  border: 'rgba(127, 140, 141, 0.2)',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#7F8C8D',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F1C40F',
};

// Dark theme colors
const darkColors = {
  // Primary color - Green Trust
  primary: '#2ECC71',
  
  // Secondary color - Blue Security
  secondary: '#3498DB',
  
  // Highlight color - Subtle Gold
  highlight: '#F1C40F',
  
  // Background color - Dark
  background: '#121212',
  
  // Text colors
  textPrimary: '#ECEFF1',
  textSecondary: '#B0BEC5',
  
  // Alert color
  alert: '#E74C3C',
  
  // Additional utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // UI colors
  card: '#1E1E1E',
  border: 'rgba(255, 255, 255, 0.1)',
  lightGray: '#2C2C2C',
  mediumGray: '#3C3C3C',
  darkGray: '#B0BEC5',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F1C40F',
};

// Function to get current theme colors
export const useThemeColors = () => {
  const { mode } = useThemeStore();
  return mode === 'dark' ? darkColors : lightColors;
};

// Export default colors (for places where hooks can't be used)
export default darkColors; // Set dark as default