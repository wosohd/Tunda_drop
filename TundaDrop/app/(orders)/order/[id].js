import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { TText } from "../../../src/components/ui/TText";
import { useAuthStore } from "../../../src/store/authStore";
import { getOrderById } from "../../../src/lib/orders/getOrderById";
import { initiateMpesaStk } from "../../../src/lib/payments/initiateMpesaStk";
import { useThemeTokens } from "../../../src/theme/useTheme";
import ScreenShell from "../../../src/components/ui/ScreenShell";
import GlassCard from "../../../src/components/ui/GlassCard";
import TChip from "../../../src/components/ui/TChip";

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

function getPaymentBanner(order, isPolling, isDarkMode) {
  if (!order || order.payment_method !== "mpesa") return null;

  if (order.payment_status === "succeeded") {
    return {
      bg: isDarkMode ? "rgba(20,83,45,0.32)" : "#ECFDF3",
      border: isDarkMode ? "#22C55E" : "#A7F3D0",
      text: isDarkMode ? "#BBF7D0" : "#166534",
      icon: "checkmark-circle-outline",
      title: "Payment received",
      message: "Your M-Pesa payment has been confirmed successfully.",
    };
  }

  if (order.payment_status === "processing" || order.status === "awaiting_payment") {
    return {
      bg: isDarkMode ? "rgba(30,64,175,0.28)" : "#EFF6FF",
      border: isDarkMode ? "#60A5FA" : "#BFDBFE",
      text: isDarkMode ? "#BFDBFE" : "#1D4ED8",
      icon: "phone-portrait-outline",
      title: isPolling ? "Checking payment status..." : "Waiting for M-Pesa confirmation",
      message: isPolling
        ? "We are checking for payment updates automatically."
        : "Check your phone and complete the STK prompt, then refresh this page.",
    };
  }

  if (order.payment_status === "failed" || order.status === "payment_failed") {
    return {
      bg: isDarkMode ? "rgba(127,29,29,0.30)" : "#FEF2F2",
      border: isDarkMode ? "#EF4444" : "#FECACA",
      text: isDarkMode ? "#FECACA" : "#991B1B",
      icon: "close-circle-outline",
      title: "Payment failed",
      message: "The M-Pesa payment did not complete. You can try again below.",
    };
  }

  return {
    bg: isDarkMode ? "rgba(120,53,15,0.32)" : "#FFFBEB",
    border: isDarkMode ? "#F59E0B" : "#FDE68A",
    text: isDarkMode ? "#FDE68A" : "#92400E",
    icon: "information-circle-outline",
    title: "Order created",
    message: "Your order is saved. Start M-Pesa payment when you are ready.",
  };
}

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getItemCustomization(item) {
  return (
    parseMaybeJson(item?.customization) ||
    parseMaybeJson(item?.customization_json) ||
    parseMaybeJson(item?.metadata?.customization) ||
    item?.customization ||
    item?.metadata?.customization ||
    null
  );
}

function getOrderItemMixText(item) {
  const customization = getItemCustomization(item);

  const flavors =
    customization?.selectedFlavors ||
    customization?.selected_flavors ||
    item?.selectedFlavors ||
    item?.selected_flavors ||
    [];

  if (Array.isArray(flavors)) {
    return flavors
      .map((flavor) => flavor?.name || flavor)
      .filter(Boolean)
      .join(" + ");
  }

  if (typeof flavors === "string") return flavors;

  return "";
}

function getOrderItemMixNote(item) {
  const customization = getItemCustomization(item);

  return (
    customization?.note ||
    customization?.customNote ||
    customization?.custom_note ||
    item?.customization_note ||
    item?.custom_note ||
    ""
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const t = useThemeTokens();

  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStartingMpesa, setIsStartingMpesa] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);

  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const mutedTextColor = isDarkMode ? "#CBD5E1" : "#64748B";
  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const actionText = isDarkMode ? "#B7F34B" : "#166534";

  const stopPaymentPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    setIsPollingPayment(false);
  }, []);

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!id || !user?.id) return null;

      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        const data = await getOrderById(id, user.id);
        setOrder(data);

        if (
          data?.payment_status === "succeeded" ||
          data?.payment_status === "failed" ||
          data?.status === "paid" ||
          data?.status === "payment_failed"
        ) {
          stopPaymentPolling();
        }

        return data;
      } catch (error) {
        Alert.alert(
          "Unable to load order",
          error?.message || "Something went wrong while fetching this order."
        );
        return null;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, user?.id, stopPaymentPolling]
  );

  useEffect(() => {
    if (isHydrating) return;

    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    loadOrder();
  }, [isHydrating, user, loadOrder, router]);

  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, [stopPaymentPolling]);

  const startPaymentPolling = useCallback(() => {
    stopPaymentPolling();
    setIsPollingPayment(true);

    pollIntervalRef.current = setInterval(() => {
      loadOrder({ silent: true });
    }, 5000);

    pollTimeoutRef.current = setTimeout(() => {
      stopPaymentPolling();
    }, 60000);
  }, [loadOrder, stopPaymentPolling]);

  async function handleStartMpesa() {
    if (!order?.id) return;

    try {
      setIsStartingMpesa(true);

      const result = await initiateMpesaStk({
        orderId: order.id,
        phone: order.customer_phone,
      });

      Alert.alert(
        "STK Push sent",
        result?.customerMessage ||
          "Check your phone and enter your M-Pesa PIN to complete payment."
      );

      await loadOrder({ silent: true });
      startPaymentPolling();
    } catch (error) {
      Alert.alert(
        "M-Pesa start failed",
        error?.message || "Could not start M-Pesa payment."
      );
    } finally {
      setIsStartingMpesa(false);
    }
  }

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
            Loading order...
          </TText>
        </View>
      </ScreenShell>
    );
  }

  if (!order) {
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
          <GlassCard style={{ alignItems: "center", paddingVertical: 26 }}>
            <Ionicons name="receipt-outline" size={42} color={mutedTextColor} />

            <TText
              style={{
                marginTop: 12,
                fontSize: 18,
                color: textColor,
                fontWeight: "950",
              }}
            >
              Order not found
            </TText>

            <TText
              style={{
                marginTop: 6,
                color: mutedTextColor,
                textAlign: "center",
                lineHeight: 21,
              }}
            >
              We could not find this order in your account.
            </TText>

            <Pressable
              onPress={() => router.back()}
              style={{
                marginTop: 18,
                backgroundColor: actionText,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 14,
              }}
            >
              <TText style={{ color: isDarkMode ? "#061018" : "#FFFFFF", fontWeight: "950" }}>
                Go back
              </TText>
            </Pressable>
          </GlassCard>
        </View>
      </ScreenShell>
    );
  }

  const statusTone = getStatusTone(order.status, isDarkMode);

  const latestPayment =
    Array.isArray(order.payments) && order.payments.length > 0
      ? order.payments[0]
      : null;

  const paymentBanner = getPaymentBanner(order, isPollingPayment, isDarkMode);

  const canStartMpesa =
    order.payment_method === "mpesa" &&
    order.payment_status !== "succeeded" &&
    order.payment_status !== "processing" &&
    order.status !== "awaiting_payment" &&
    !isStartingMpesa;

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0 }}>
      <View
        style={{
          marginTop: 4,
          marginBottom: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <TText style={{ fontSize: 28, color: textColor, fontWeight: "950" }}>
            Order details
          </TText>

          <TText style={{ marginTop: 6, color: mutedTextColor }}>
            {order.order_number || order.id}
          </TText>
        </View>

        <Pressable
          onPress={() => loadOrder({ silent: true })}
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
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

      <GlassCard
        style={{
          backgroundColor: statusTone.bg,
          borderColor: statusTone.border,
          marginBottom: 18,
        }}
      >
        <TText style={{ color: statusTone.text, fontSize: 16, fontWeight: "950" }}>
          {getReadableStatus(order.status)}
        </TText>

        <TText style={{ color: statusTone.text, marginTop: 4 }}>
          Payment status: {getReadableStatus(order.payment_status)}
        </TText>
      </GlassCard>

      {paymentBanner ? (
        <GlassCard
          style={{
            backgroundColor: paymentBanner.bg,
            borderColor: paymentBanner.border,
            marginBottom: 18,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Ionicons
            name={paymentBanner.icon}
            size={22}
            color={paymentBanner.text}
            style={{ marginTop: 2 }}
          />

          <View style={{ flex: 1 }}>
            <TText
              style={{
                color: paymentBanner.text,
                fontSize: 15,
                fontWeight: "950",
              }}
            >
              {paymentBanner.title}
            </TText>

            <TText
              style={{
                color: paymentBanner.text,
                marginTop: 4,
                lineHeight: 21,
              }}
            >
              {paymentBanner.message}
            </TText>
          </View>
        </GlassCard>
      ) : null}

      <Section title="Order summary" icon="receipt-outline">
        <GlassCard>
          <Row label="Order number" value={order.order_number || "—"} />
          <Row label="Created" value={formatDate(order.created_at)} />
          <Row label="Payment method" value={getReadableStatus(order.payment_method)} />
          <Row label="Currency" value={order.currency || "KES"} />
        </GlassCard>
      </Section>

      <Section title="Delivery details" icon="location-outline">
        <GlassCard>
          <Row label="Zone" value={order.delivery_zone_title || "—"} />
          <Row label="Range" value={order.delivery_range_label || "—"} />
          <Row label="Address" value={order.delivery_address || "—"} />
          <Row label="Phone" value={order.customer_phone || "—"} />
        </GlassCard>
      </Section>

      <Section title="Items" icon="basket-outline">
        <GlassCard>
          {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
            order.order_items.map((item, index) => {
              const mixText = getOrderItemMixText(item);
              const mixNote = getOrderItemMixNote(item);
              const hasMix = Boolean(mixText);

              return (
                <View
                  key={item.id || `${item.product_name}-${index}`}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth:
                      index === order.order_items.length - 1 ? 0 : 1,
                    borderBottomColor: softBorder,
                  }}
                >
                  <TText style={{ color: textColor, fontWeight: "950" }}>
                    {item.product_name}
                  </TText>

                  <TText style={{ marginTop: 4, color: mutedTextColor }}>
                    {item.size_label} • Qty {item.quantity}
                  </TText>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <TChip label={item.size_label || "Size"} icon="cube-outline" />

                    {hasMix ? (
                      <TChip label="Custom mix" icon="flask" variant="success" />
                    ) : null}
                  </View>

                  {hasMix ? (
                    <View
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 16,
                        backgroundColor: isDarkMode
                          ? "rgba(20,83,45,0.26)"
                          : "#F0FDF4",
                        borderWidth: 1,
                        borderColor: isDarkMode ? "#166534" : "#BBF7D0",
                      }}
                    >
                      <TText
                        style={{
                          color: isDarkMode ? "#BBF7D0" : "#166534",
                          fontWeight: "900",
                          lineHeight: 20,
                        }}
                      >
                        Mix: {mixText}
                      </TText>

                      {mixNote ? (
                        <TText
                          style={{
                            color: isDarkMode ? "#D1FAE5" : "#166534",
                            marginTop: 4,
                            lineHeight: 19,
                          }}
                        >
                          Note: {mixNote}
                        </TText>
                      ) : null}
                    </View>
                  ) : null}

                  <TText
                    style={{
                      marginTop: 8,
                      color: isDarkMode ? "#BBF7D0" : "#166534",
                      fontWeight: "950",
                    }}
                  >
                    {formatKes(
                      item.line_total_kes || item.unit_price_kes * item.quantity
                    )}
                  </TText>
                </View>
              );
            })
          ) : (
            <TText style={{ color: mutedTextColor }}>
              No items found for this order.
            </TText>
          )}
        </GlassCard>
      </Section>

      {order.payment_method === "mpesa" ? (
        <Section title="M-Pesa" icon="phone-portrait-outline">
          <GlassCard>
            <TText style={{ color: mutedTextColor, lineHeight: 21, marginBottom: 12 }}>
              Your order is already created. Payment starts separately from here so you
              can retry safely without recreating the order.
            </TText>

            <Pressable disabled={!canStartMpesa || isStartingMpesa} onPress={handleStartMpesa}>
              <LinearGradient
                colors={
                  canStartMpesa
                    ? ["#00D1FF", "#7C4DFF", "#FF3D81"]
                    : ["#94A3B8", "#64748B"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  opacity: isStartingMpesa ? 0.75 : 1,
                }}
              >
                <TText style={{ color: "#FFFFFF", fontWeight: "950" }}>
                  {isStartingMpesa
                    ? "Sending STK Push..."
                    : order.payment_status === "succeeded"
                    ? "Payment completed"
                    : order.payment_status === "processing" || order.status === "awaiting_payment"
                    ? "Waiting for confirmation..."
                    : "Pay with M-Pesa"}
                </TText>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => loadOrder({ silent: true })}
              style={{
                marginTop: 10,
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <TText style={{ color: actionText, fontWeight: "900" }}>
                {isPollingPayment ? "Checking automatically..." : "Refresh payment status"}
              </TText>
            </Pressable>
          </GlassCard>
        </Section>
      ) : null}

      <Section title="Payment" icon="card-outline">
        <GlassCard>
          <Row label="Method" value={getReadableStatus(order.payment_method)} />
          <Row label="Payment status" value={getReadableStatus(order.payment_status)} />
          <Row label="Latest provider" value={latestPayment?.provider || "—"} />
          <Row label="Latest method" value={latestPayment?.method || "—"} />
          <Row label="Receipt number" value={latestPayment?.external_customer_reference || "—"} />
          <Row label="Merchant request ID" value={latestPayment?.merchant_request_id || "—"} />
          <Row label="Checkout request ID" value={latestPayment?.checkout_request_id || "—"} />
          <Row label="Result code" value={latestPayment?.result_code || "—"} />
          <Row label="Result description" value={latestPayment?.result_desc || "—"} />
          <Row label="Reference" value={latestPayment?.provider_reference || "—"} />
          <Row label="Completed at" value={formatDate(latestPayment?.completed_at)} />
        </GlassCard>
      </Section>

      <Section title="Totals" icon="calculator-outline">
        <GlassCard>
          <Row label="Subtotal" value={formatKes(order.subtotal_kes)} />
          <Row label="Discount" value={`- ${formatKes(order.discount_kes)}`} />
          <Row label="Delivery fee" value={formatKes(order.delivery_fee_kes)} />
          <Divider />
          <Row label="Total" value={formatKes(order.total_kes)} strong />
        </GlassCard>
      </Section>
    </ScreenShell>
  );
}

function Section({ title, icon, children }) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isDarkMode ? "#B7F34B" : "#166534"}
        />

        <TText style={{ fontSize: 16, color: t.text, fontWeight: "950" }}>
          {title}
        </TText>
      </View>

      {children}
    </View>
  );
}

function Row({ label, value, strong = false }) {
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
        paddingVertical: 6,
      }}
    >
      <TText
        style={{
          color: strong ? t.text : t.mutedText,
          flex: 1,
          fontWeight: strong ? "950" : "700",
        }}
      >
        {label}
      </TText>

      <TText
        style={{
          color: strong ? t.text : isDarkMode ? "#BBF7D0" : "#166534",
          flex: 1,
          textAlign: "right",
          fontWeight: strong ? "950" : "900",
        }}
      >
        {String(value ?? "—")}
      </TText>
    </View>
  );
}

function Divider() {
  const t = useThemeTokens();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: t.border,
        marginVertical: 6,
      }}
    />
  );
}