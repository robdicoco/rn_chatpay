import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/constants/colors';

interface AvatarProps {
  uri: string;
  size?: number;
  style?: ViewStyle;
  showBorder?: boolean;
  borderColor?: string;
}

export default function Avatar({
  uri,
  size = 40,
  style,
  showBorder = false,
  borderColor,
}: AvatarProps) {
  const colors = useThemeColors();
  const defaultBorderColor = borderColor || colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 2 : 0,
          borderColor: defaultBorderColor,
        },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: showBorder ? size - 4 : size,
            height: showBorder ? size - 4 : size,
            borderRadius: (showBorder ? size - 4 : size) / 2,
            backgroundColor: colors.textSecondary,
          },
        ]}
        contentFit="cover"
        transition={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    // backgroundColor moved to inline style to use theme colors
  },
});