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

import { TText } from "../../src/components/ui/TText";
import { useAuthStore } from "../../src/store/authStore";
import { listOrders } from "../../src/lib/orders/listOrders";
import { useThemeTokens } from "../../src/theme/useTheme";
import ScreenShell from "../../src/components/ui/ScreenShell";
import GlassCard from "../../src/components/ui/GlassCard";
import TChip from "../../src/components/ui/TChip";
import GradientButton from "../../src/components/ui/GradientButton";

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

function getReadableStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusTone(status, isDarkMode) {
  switch (status) {
    case "paid":
    case "confirmed":
    case "delivered":
      return {
        bg: isDarkMode ? "rgba(20,83,45,0.32)" : "#ECFDF3",
        border: isDarkMode ? "#22C55E" : "#A7F3D0",
        text: isDarkMode ? "#BBF7D0" : "#166534",
      };

    case "payment_failed":
    case "cancelled":
      return {
        bg: isDarkMode ? "rgba(127,29,29,0.30)" : "#FEF2F2",
        border: isDarkMode ? "#EF4444" : "#FECACA",
        text: isDarkMode ? "#FECACA" : "#991B1B",
      };

    case "awaiting_payment":
    case "pending":
      return {
        bg: isDarkMode ? "rgba(120,53,15,0.32)" : "#FFFBEB",
        border: isDarkMode ? "#F59E0B" : "#FDE68A",
        text: isDarkMode ? "#FDE68A" : "#92400E",
      };

    default:
      return {
        bg: isDarkMode ? "rgba(15,23,42,0.88)" : "#F8FAFC",
        border: isDarkMode ? "#334155" : "#CBD5E1",
        text: isDarkMode ? "#CBD5E1" : "#334155",
      };
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const t = useThemeTokens();

  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const mutedTextColor = isDarkMode ? "#CBD5E1" : "#64748B";
  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const softBg = isDarkMode ? "#111827" : "#FFFFFF";
  const actionText = isDarkMode ? "#B7F34B" : "#166534";

  const loadOrders = useCallback(
    async ({ silent = false } = {}) => {
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
    },
    [user?.id]
  );

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
      <ScreenShell scroll={false} contentContainerStyle={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <ActivityIndicator size="large" color={actionText} />
          <TText style={{ marginTop: 12, color: mutedTextColor }}>
            Loading your orders...
          </TText>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false} contentContainerStyle={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrders({ silent: true })}
            tintColor={actionText}
          />
        }
      >
        <View
          style={{
            marginTop: 4,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <TText style={{ fontSize: 28, color: textColor, fontWeight: "950" }}>
              My Orders
            </TText>

            <TText
              style={{
                marginTop: 6,
                color: mutedTextColor,
                lineHeight: 21,
              }}
            >
              Track your juice deliveries and payment progress.
            </TText>
          </View>

          <Pressable
            onPress={() => loadOrders({ silent: true })}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: softBg,
              borderWidth: 1,
              borderColor: softBorder,
            }}
          >
            <Ionicons
              name={refreshing ? "hourglass-outline" : "refresh-outline"}
              size={20}
              color={actionText}
            />
          </Pressable>
        </View>

        {orders.length === 0 ? (
          <GlassCard
            style={{
              alignItems: "center",
              paddingVertical: 26,
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 74,
                height: 74,
                borderRadius: 28,
                backgroundColor: isDarkMode ? "#111827" : "#F4F6FF",
                borderWidth: 1,
                borderColor: softBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="receipt-outline" size={40} color={mutedTextColor} />
            </View>

            <TText
              style={{
                marginTop: 14,
                fontSize: 19,
                color: textColor,
                fontWeight: "950",
              }}
            >
              No orders yet
            </TText>

            <TText
              style={{
                marginTop: 6,
                color: mutedTextColor,
                textAlign: "center",
                lineHeight: 22,
                maxWidth: 290,
              }}
            >
              Once you place an order, it will appear here for tracking.
            </TText>

            <GradientButton
              title="Start shopping"
              onPress={() => router.push("/(shop)/categories")}
              style={{ marginTop: 16, alignSelf: "stretch" }}
              right={<Ionicons name="chevron-forward" size={18} color="#fff" />}
            />
          </GlassCard>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map((order) => {
              const tone = getStatusTone(order.status, isDarkMode);

              return (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(orders)/order/${order.id}`)}
                >
                  <GlassCard style={{ padding: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <TText
                          style={{
                            fontSize: 16,
                            color: textColor,
                            fontWeight: "950",
                          }}
                        >
                          {order.order_number || order.id}
                        </TText>

                        <TText
                          style={{
                            marginTop: 4,
                            color: mutedTextColor,
                            lineHeight: 19,
                          }}
                        >
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
                          style={{
                            color: tone.text,
                            fontSize: 12,
                            fontWeight: "900",
                          }}
                        >
                          {getReadableStatus(order.status)}
                        </TText>
                      </View>
                    </View>

                    <View style={{ marginTop: 14, gap: 8 }}>
                      <InfoRow
                        label="Payment"
                        value={getReadableStatus(order.payment_method)}
                      />
                      <InfoRow
                        label="Payment status"
                        value={getReadableStatus(order.payment_status)}
                      />
                      <InfoRow
                        label="Zone"
                        value={order.delivery_zone_title || "—"}
                      />
                      <InfoRow
                        label="Total"
                        value={formatKes(order.total_kes)}
                        strong
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: softBorder,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <TText style={{ color: actionText, fontWeight: "900" }}>
                        View details
                      </TText>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={actionText}
                      />
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function InfoRow({ label, value, strong = false }) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <TText style={{ color: t.mutedText }}>{label}</TText>

      <TText
        style={{
          color: strong ? t.text : isDarkMode ? "#BBF7D0" : "#166534",
          textAlign: "right",
          flex: 1,
          fontWeight: strong ? "950" : "900",
        }}
      >
        {String(value ?? "—")}
      </TText>
    </View>
  );
}

