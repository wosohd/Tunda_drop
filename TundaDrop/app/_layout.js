import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
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
        <Stack.Screen name="index" options={{ title: "TundaDrop" }} />
        <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Create account" }} />

        <Stack.Screen name="(shop)/categories" options={{ title: "Categories" }} />
        <Stack.Screen name="(shop)/category/[id]" options={{ title: "Category" }} />
        <Stack.Screen name="(shop)/product/[id]" options={{ title: "Product" }} />
        <Stack.Screen name="(shop)/cart" options={{ title: "Cart" }} />
        <Stack.Screen name="(shop)/checkout" options={{ title: "Checkout" }} />

        <Stack.Screen name="(orders)/orders" options={{ title: "My Orders" }} />
        <Stack.Screen name="(orders)/order/[id]" options={{ title: "Order" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
