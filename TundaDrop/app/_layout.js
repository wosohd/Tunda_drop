import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, Pressable, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import { useThemeTokens } from "../src/theme/useTheme";

const AUTH_ONLY_PREFIXES = ["/(shop)/checkout", "/(orders)"];

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const isAuthHydrating = useAuthStore((s) => s.isHydrating);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const isThemeHydrating = useThemeStore((s) => s.isHydrating);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  const t = useThemeTokens();

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
  }, []);

  useEffect(() => {
    if (isAuthHydrating) return;
    const authed = !!user;
    const needsAuth = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (!authed && needsAuth) router.replace("/(auth)/login");
  }, [pathname, user, isAuthHydrating]);

  const isHydrating = isAuthHydrating || isThemeHydrating;

  function cycleMode() {
    const next = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
  }

  const themeIcon = mode === "dark" ? "moon" : mode === "light" ? "sunny" : "contrast";

  const HeaderRightHome = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Theme toggle (Home only) */}
        <Pressable
          onPress={cycleMode}
          hitSlop={10}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: t.chipBg,
            borderWidth: 1,
            borderColor: t.chipBorder,
          }}
        >
          <Ionicons name={themeIcon} size={18} color={t.text} />
        </Pressable>

        {/* Auth button */}
        {!user ? (
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            hitSlop={10}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: t.darkButton,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Sign in</Text>
          </Pressable>
        ) : (
          <Pressable
            hitSlop={10}
            onPress={() => {
              Alert.alert("Sign out", "Do you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign out",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    router.replace("/");
                  },
                },
              ]);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Text style={{ color: t.text, fontWeight: "900" }}>Sign out</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (isHydrating) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: t.bg }}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          contentStyle: { padding: 16, backgroundColor: t.bg },
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "TundaDrop",
            headerRight: () => <HeaderRightHome />,
          }}
        />

        <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Create account" }} />

        <Stack.Screen name="(shop)/categories" options={{ title: "Categories" }} />
        <Stack.Screen name="(shop)/product/[id]" options={{ title: "Product" }} />
        <Stack.Screen name="(shop)/cart" options={{ title: "Cart" }} />
        <Stack.Screen name="(shop)/checkout" options={{ title: "Checkout" }} />

        <Stack.Screen name="(orders)/orders" options={{ title: "My Orders" }} />
        <Stack.Screen name="(orders)/order/[id]" options={{ title: "Order" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
