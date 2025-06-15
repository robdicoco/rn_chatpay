import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  gradient = false,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors();

  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`${size}Button`],
    {
      ...(variant === 'primary' && { backgroundColor: colors.primary }),
      ...(variant === 'secondary' && { backgroundColor: colors.secondary }),
      ...(variant === 'outline' && { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary 
      }),
      ...(variant === 'text' && { 
        backgroundColor: 'transparent',
        paddingVertical: 4,
        paddingHorizontal: 8 
      }),
      ...(disabled && { 
        backgroundColor: colors.textSecondary,
        borderColor: colors.textSecondary 
      }),
    },
    style as ViewStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${size}Text`],
    {
      ...(variant === 'primary' && { color: colors.white }),
      ...(variant === 'secondary' && { color: colors.white }),
      ...(variant === 'outline' && { color: colors.primary }),
      ...(variant === 'text' && { color: colors.primary }),
      ...(disabled && { color: colors.mediumGray }),
    },
    textStyle as TextStyle,
  ];

  const renderButton = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      style={gradient ? styles.gradientContainer : buttonStyles}
      activeOpacity={0.8}
      {...rest}
    >
      {gradient ? (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyles, styles.gradientButton]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        renderContent()
      )}
    </TouchableOpacity>
  );

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.white : colors.primary} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </>
  );

  return renderButton();
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    borderRadius: 12,
  },
  gradientButton: {
    borderRadius: 12,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});