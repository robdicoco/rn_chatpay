import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StatusBar, useColorScheme } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { mode } = useThemeStore();
  const colors = useThemeColors();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar 
        barStyle={mode === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colors = useThemeColors();
  
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
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          title: "Chat",
          headerBackTitle: "Back",
        }} 
      />
      <Stack.Screen 
        name="send-money" 
        options={{ 
          title: "Send Money",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="request-money" 
        options={{ 
          title: "Request Money",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="donate" 
        options={{ 
          title: "Donate",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}