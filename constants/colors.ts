import { useThemeStore } from '@/store/theme-store';

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