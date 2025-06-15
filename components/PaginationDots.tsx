import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/constants/colors';

interface PaginationDotsProps {
  total: number;
  current: number;
}

export default function PaginationDots({ total, current }: PaginationDotsProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === current ? colors.primary : colors.lightGray,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});