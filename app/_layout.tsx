import "react-native-reanimated";
import "react-native-get-random-values";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { Platform, StatusBar, useColorScheme } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/theme-store";
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from "@/constants/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AppState } from "react-native";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";


import { Buffer } from "buffer";
import crypto from "react-native-quick-crypto";
//global.crypto = crypto;
global.Buffer = Buffer;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


export const unstable_settings = {
  initialRouteName: "(auth)",
};

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

 /*  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        signOut(auth).catch((err) => {
          // Optionally handle sign out error
          console.warn("Sign out on app close error:", err);
        });
      }
    });
    return () => subscription.remove();
  }, []); */
  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 
    </Stack>
  );
}

