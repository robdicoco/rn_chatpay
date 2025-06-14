import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";
import "react-native-get-random-values";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { ErrorBoundary } from "./error-boundary";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";

import { AbstraxionProvider } from "@burnt-labs/abstraxion-react-native";

// import { useColorScheme } from "@/hooks/useColorScheme";

import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/constants/colors";

import { Buffer } from "buffer";
global.Buffer = Buffer;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const treasuryConfig = {
  treasury: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS, // Example XION treasury instance
  gasPrice: "0.001uxion", // If you feel the need to change the gasPrice when connecting to signer, set this value. Please stick to the string format seen in example
  rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT,
  restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT,
  callbackUrl: "abstraxion-expo-demo://", // this comes from app.json scheme
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { mode } = useThemeStore();
  // const colorScheme = useColorScheme();
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
    <AbstraxionProvider config={treasuryConfig}>
        <ErrorBoundary>
          <StatusBar 
            barStyle={mode === 'dark' ? "light-content" : "dark-content"} 
            backgroundColor={colors.background} 
          />
          <RootLayoutNav />
        </ErrorBoundary>
    </AbstraxionProvider>
    // <AbstraxionProvider config={treasuryConfig}>
    //   <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    //     <Stack>
    //       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    //       <Stack.Screen name="+not-found" />
    //     </Stack>
    //     <StatusBar style="auto" />
    //   </ThemeProvider>
    // </AbstraxionProvider>
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