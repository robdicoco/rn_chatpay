import { Stack } from "expo-router";
import colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Log In" }} />
      <Stack.Screen name="log_xion_sample" options={{ title: "Log In Test" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
    </Stack>
  );
}