import { Stack } from 'expo-router';
import { useThemeColors } from '@/constants/colors';

export default function ConfigLayout() {
  const colors = useThemeColors();
  return (
    <Stack screenOptions={{
        
        headerShown: false,
        
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}