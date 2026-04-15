import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { TText } from "../../src/components/ui/TText";
import { useAuthStore } from "../../src/store/authStore";
import { listOrders } from "../../src/lib/orders/listOrders";

function formatKes(value) {
  return `KES ${Number(value || 0)}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getStatusTone(status) {
  switch (status) {
    case "paid":
    case "confirmed":
    case "delivered":
      return {
        bg: "#ECFDF3",
        border: "#A7F3D0",
        text: "#166534",
      };
    case "payment_failed":
    case "cancelled":
      return {
        bg: "#FEF2F2",
        border: "#FECACA",
        text: "#991B1B",
      };
    case "awaiting_payment":
    case "pending":
      return {
        bg: "#FFFBEB",
        border: "#FDE68A",
        text: "#92400E",
      };
    default:
      return {
        bg: "#F8FAFC",
        border: "#CBD5E1",
        text: "#334155",
      };
  }
}

function getReadableStatus(status) {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function OrdersScreen() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) return;

    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await listOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isHydrating) return;

    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    loadOrders();
  }, [isHydrating, user, router, loadOrders]);

  if (loading) {
    return (
      <LinearGradient colors={["#F7FBF8", "#EEF8F2", "#FDFDFD"]} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <ActivityIndicator size="large" color="#16A34A" />
          <TText style={{ marginTop: 12, color: "#475569" }}>
            Loading your orders...
          </TText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F7FBF8", "#EEF8F2", "#FDFDFD"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrders({ silent: true })}
            tintColor="#16A34A"
          />
        }
      >
        <View
          style={{
            marginTop: 26,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <TText weight="bold" style={{ fontSize: 28, color: "#0F172A" }}>
              My Orders
            </TText>
            <TText style={{ marginTop: 6, color: "#475569" }}>
              Track your juice deliveries and payment progress.
            </TText>
          </View>

          <Pressable
            onPress={() => loadOrders({ silent: true })}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D7E5DB",
            }}
          >
            <Ionicons
              name={refreshing ? "hourglass-outline" : "refresh-outline"}
              size={20}
              color="#166534"
            />
          </Pressable>
        </View>

        {orders.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              padding: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Ionicons name="receipt-outline" size={42} color="#94A3B8" />
            <TText
              weight="bold"
              style={{ marginTop: 12, fontSize: 18, color: "#0F172A" }}
            >
              No orders yet
            </TText>
            <TText
              style={{
                marginTop: 6,
                color: "#64748B",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Once you place an order, it will appear here for tracking.
            </TText>

            <Pressable
              onPress={() => router.push("/(shop)")}
              style={{
                marginTop: 16,
                backgroundColor: "#16A34A",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 14,
              }}
            >
              <TText weight="bold" style={{ color: "#FFFFFF" }}>
                Start shopping
              </TText>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map((order) => {
              const tone = getStatusTone(order.status);

              return (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(orders)/order/${order.id}`)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <TText weight="bold" style={{ fontSize: 16, color: "#0F172A" }}>
                        {order.order_number || order.id}
                      </TText>
                      <TText style={{ marginTop: 4, color: "#64748B" }}>
                        {formatDate(order.created_at)}
                      </TText>
                    </View>

                    <View
                      style={{
                        backgroundColor: tone.bg,
                        borderColor: tone.border,
                        borderWidth: 1,
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <TText
                        weight="semibold"
                        style={{ color: tone.text, fontSize: 12 }}
                      >
                        {getReadableStatus(order.status)}
                      </TText>
                    </View>
                  </View>

                  <View style={{ marginTop: 14, gap: 8 }}>
                    <InfoRow label="Payment" value={getReadableStatus(order.payment_method)} />
                    <InfoRow label="Payment status" value={getReadableStatus(order.payment_status)} />
                    <InfoRow label="Zone" value={order.delivery_zone_title || "—"} />
                    <InfoRow label="Total" value={formatKes(order.total_kes)} strong />
                  </View>

                  <View
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#E5E7EB",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TText style={{ color: "#166534" }}>View details</TText>
                    <Ionicons name="chevron-forward" size={18} color="#166534" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <TText style={{ color: "#475569" }}>{label}</TText>
      <TText
        weight={strong ? "bold" : "semibold"}
        style={{ color: strong ? "#0F172A" : "#166534", textAlign: "right", flex: 1 }}
      >
        {String(value ?? "—")}
      </TText>
    </View>
  );
}

