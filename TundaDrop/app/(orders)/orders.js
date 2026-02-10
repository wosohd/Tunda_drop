import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOrdersStore } from "../../src/store/ordersStore";

// ✅ NEW imports for logout + clearing user data
import { useAuthStore } from "../../src/store/authStore";
import { useCartStore } from "../../src/store/cartStore";
import { useCheckoutStore } from "../../src/store/checkoutStore";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function statusLabel(status) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export default function Orders() {
  const router = useRouter();

  const orders = useOrdersStore((s) => s.orders);
  const clearOrders = useOrdersStore((s) => s.clearOrders);

  // ✅ NEW: clear other stores + logout
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);

  // NOTE: checkoutStore must have reset(). If yours is named differently, tell me and I’ll match it.
  const resetCheckout = useCheckoutStore((s) => s.reset);

  async function onLogout() {
    // Clear personal data first
    clearOrders();
    clearCart();
    resetCheckout();

    // Then sign out (Supabase)
    await logout();

    // Optional: send user somewhere nice after logout
    router.replace("/");
  }

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <Ionicons name="receipt-outline" size={40} color="#111827" />
        <Text style={{ fontSize: 18, fontWeight: "900" }}>No orders yet</Text>
        <Text style={{ color: "#444", textAlign: "center" }}>
          Place your first order and it will show up here.
        </Text>

        <Pressable
          onPress={() => router.push("/(shop)/categories")}
          style={{
            marginTop: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 18,
            backgroundColor: "#111827",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>Browse juices</Text>
        </Pressable>

        {/* ✅ NEW: logout also visible here */}
        <Pressable onPress={onLogout} style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "900" }}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "900" }}>My Orders</Text>

        {/* ✅ NEW: Clear + Logout */}
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Pressable onPress={clearOrders}>
            <Text style={{ fontWeight: "900" }}>Clear</Text>
          </Pressable>

          <Pressable onPress={onLogout}>
            <Text style={{ fontWeight: "900" }}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 12, paddingBottom: 24 }}>
        {orders.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => router.push(`/(orders)/order/${o.id}`)}
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "#EEF1FF",
              backgroundColor: "#fff",
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "#F4F6FF",
                  borderWidth: 1,
                  borderColor: "#E7EBFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="receipt" size={18} color="#111827" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900" }} numberOfLines={1}>
                  {o.id}
                </Text>
                <Text style={{ color: "#444", marginTop: 2 }}>{formatDate(o.createdAt)}</Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#111827",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>{statusLabel(o.status)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#444", fontWeight: "800" }}>{o.items.length} item(s)</Text>
              <Text style={{ fontWeight: "900" }}>KES {o.pricing.totalKes}</Text>
            </View>

            <Text style={{ color: "#444" }} numberOfLines={1}>
              {o.delivery.zoneTitle} • {o.delivery.rangeLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
