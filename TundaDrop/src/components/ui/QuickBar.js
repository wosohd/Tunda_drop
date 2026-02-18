import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useThemeStore } from "../../store/themeStore";
import { useThemeTokens } from "../../theme/useTheme";

import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useCheckoutStore } from "../../store/checkoutStore";
import { useOrdersStore } from "../../store/ordersStore";

export function QuickBar() {
  const router = useRouter();
  const t = useThemeTokens();

  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);
  const resetCheckout = useCheckoutStore((s) => s.reset);
  const clearOrders = useOrdersStore((s) => s.clearOrders);

  function cycleMode() {
    const next = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
  }

  async function onLogout() {
    clearOrders();
    clearCart();
    resetCheckout();
    await logout();
    router.replace("/");
  }

  const themeIcon =
    mode === "dark" ? "moon" : mode === "light" ? "sunny" : "contrast";

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        bottom: 16,
        flexDirection: "row",
        gap: 10,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: t.card,
        padding: 10,
      }}
    >
      <Pressable
        onPress={cycleMode}
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.chipBg,
          borderWidth: 1,
          borderColor: t.chipBorder,
        }}
      >
        <Ionicons name={themeIcon} size={22} color={t.text} />
        <Text style={{ fontSize: 10, fontWeight: "900", color: t.text, marginTop: 2 }}>
          Theme
        </Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.darkButton,
        }}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff", marginTop: 2 }}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}
