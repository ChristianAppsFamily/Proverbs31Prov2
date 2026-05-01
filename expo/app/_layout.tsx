import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { AuthProvider } from "@/providers/AuthProvider";
import { DevotionalRotationProvider } from "@/providers/DevotionalRotationProvider";
import { EngagementProvider } from "@/providers/EngagementProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";
import { JournalProvider } from "@/providers/JournalProvider";
import { MonetizationProvider } from "@/providers/MonetizationProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.ink,
        headerTitleStyle: { fontFamily: "Georgia" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="devotional/[id]"
        options={{ title: "Devotional", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="journal/[id]"
        options={{ title: "Journal", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "More Info", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.cream }}>
          <AuthProvider>
            <MonetizationProvider>
              <FavoritesProvider>
                <JournalProvider>
                  <EngagementProvider>
                    <DevotionalRotationProvider>
                      <StatusBar style="dark" />
                      <RootLayoutNav />
                    </DevotionalRotationProvider>
                  </EngagementProvider>
                </JournalProvider>
              </FavoritesProvider>
            </MonetizationProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
