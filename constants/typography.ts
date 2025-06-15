import { StyleSheet } from 'react-native';
import { useThemeColors } from './colors';

// Create a function that returns themed typography styles
export const useTypographyStyles = () => {
  const colors = useThemeColors();
  
  return StyleSheet.create({
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    title2: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      color: colors.textPrimary,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.textPrimary,
    },
    subhead: {
      fontSize: 15,
      fontWeight: '400',
      color: colors.textPrimary,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400',
      color: colors.textSecondary,
    },
  });
};

// Export default typography for backward compatibility (without colors)
export default StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
  },
  title2: {
    fontSize: 22,
    fontWeight: '600',
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
  },
});