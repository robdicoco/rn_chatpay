import "react-native-reanimated";
import "react-native-get-random-values";

import { useEffect } from "react";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";


import { AbstraxionProvider } from "@burnt-labs/abstraxion-react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

import { Buffer } from "buffer";
import crypto from "react-native-quick-crypto";
//global.crypto = crypto;
global.Buffer = Buffer;


const treasuryConfig = {
  treasury: process.env.EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS, // Example XION treasury instance
  gasPrice: "0.001uxion", // If you feel the need to change the gasPrice when connecting to signer, set this value. Please stick to the string format seen in example
  rpcUrl: process.env.EXPO_PUBLIC_RPC_ENDPOINT,
  restUrl: process.env.EXPO_PUBLIC_REST_ENDPOINT,
  callbackUrl: "chatpaygoxion://",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  }); 
 
  return (
    <AbstraxionProvider config={treasuryConfig}>
      
        <Stack>
          <Stack.Screen name="(xion)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
     
    </AbstraxionProvider>
  );
}