import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { TText } from "../../../src/components/ui/TText";
import { useAuthStore } from "../../../src/store/authStore";
import { getOrderById } from "../../../src/lib/orders/getOrderById";
import { initiateMpesaStk } from "../../../src/lib/payments/initiateMpesaStk";

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

function getPaymentBanner(order, isPolling) {
  if (!order || order.payment_method !== "mpesa") return null;

  if (order.payment_status === "succeeded") {
    return {
      bg: "#ECFDF3",
      border: "#A7F3D0",
      text: "#166534",
      icon: "checkmark-circle-outline",
      title: "Payment received",
      message: "Your M-Pesa payment has been confirmed successfully.",
    };
  }

  if (order.payment_status === "processing" || order.status === "awaiting_payment") {
    return {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      text: "#1D4ED8",
      icon: "phone-portrait-outline",
      title: isPolling ? "Checking payment status..." : "Waiting for M-Pesa confirmation",
      message: isPolling
        ? "We are checking for payment updates automatically."
        : "Check your phone and complete the STK prompt, then refresh this page.",
    };
  }

  if (order.payment_status === "failed" || order.status === "payment_failed") {
    return {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "#991B1B",
      icon: "close-circle-outline",
      title: "Payment failed",
      message: "The M-Pesa payment did not complete. You can try again below.",
    };
  }

  return {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    icon: "information-circle-outline",
    title: "Order created",
    message: "Your order is saved. Start M-Pesa payment when you are ready.",
  };
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStartingMpesa, setIsStartingMpesa] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);

  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);

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
            Loading order...
          </TText>
        </View>
      </LinearGradient>
    );
  }

  if (!order) {
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
          <Ionicons name="receipt-outline" size={42} color="#94A3B8" />
          <TText weight="bold" style={{ marginTop: 12, fontSize: 18, color: "#0F172A" }}>
            Order not found
          </TText>
          <TText style={{ marginTop: 6, color: "#64748B", textAlign: "center" }}>
            We could not find this order in your account.
          </TText>

          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: 18,
              backgroundColor: "#16A34A",
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <TText weight="bold" style={{ color: "#FFFFFF" }}>
              Go back
            </TText>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  const statusTone = getStatusTone(order.status);
  const latestPayment =
    Array.isArray(order.payments) && order.payments.length > 0
      ? order.payments[0]
      : null;
  const paymentBanner = getPaymentBanner(order, isPollingPayment);

  const canStartMpesa =
    order.payment_method === "mpesa" &&
    order.payment_status !== "succeeded" &&
    order.payment_status !== "processing" &&
    order.status !== "awaiting_payment" &&
    !isStartingMpesa;

  return (
    <LinearGradient colors={["#F7FBF8", "#EEF8F2", "#FDFDFD"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            marginTop: 22,
            marginBottom: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <TText weight="bold" style={{ fontSize: 28, color: "#0F172A" }}>
              Order details
            </TText>
            <TText style={{ marginTop: 6, color: "#475569" }}>
              {order.order_number || order.id}
            </TText>
          </View>

          <Pressable
            onPress={() => loadOrder({ silent: true })}
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

        <View
          style={{
            backgroundColor: statusTone.bg,
            borderColor: statusTone.border,
            borderWidth: 1,
            borderRadius: 18,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <TText weight="bold" style={{ color: statusTone.text, fontSize: 16 }}>
            {getReadableStatus(order.status)}
          </TText>
          <TText style={{ color: statusTone.text, marginTop: 4 }}>
            Payment status: {getReadableStatus(order.payment_status)}
          </TText>
        </View>

        {paymentBanner ? (
          <View
            style={{
              backgroundColor: paymentBanner.bg,
              borderColor: paymentBanner.border,
              borderWidth: 1,
              borderRadius: 18,
              padding: 14,
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
              <TText weight="bold" style={{ color: paymentBanner.text, fontSize: 15 }}>
                {paymentBanner.title}
              </TText>
              <TText style={{ color: paymentBanner.text, marginTop: 4, lineHeight: 21 }}>
                {paymentBanner.message}
              </TText>
            </View>
          </View>
        ) : null}

        <Section title="Order summary" icon="receipt-outline">
          <Card>
            <Row label="Order number" value={order.order_number || "—"} />
            <Row label="Created" value={formatDate(order.created_at)} />
            <Row label="Payment method" value={getReadableStatus(order.payment_method)} />
            <Row label="Currency" value={order.currency || "KES"} />
          </Card>
        </Section>

        <Section title="Delivery details" icon="location-outline">
          <Card>
            <Row label="Zone" value={order.delivery_zone_title || "—"} />
            <Row label="Range" value={order.delivery_range_label || "—"} />
            <Row label="Address" value={order.delivery_address || "—"} />
            <Row label="Phone" value={order.customer_phone || "—"} />
          </Card>
        </Section>

        <Section title="Items" icon="basket-outline">
          <Card>
            {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
              order.order_items.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: index === order.order_items.length - 1 ? 0 : 1,
                    borderBottomColor: "#E5E7EB",
                  }}
                >
                  <TText weight="semibold" style={{ color: "#0F172A" }}>
                    {item.product_name}
                  </TText>
                  <TText style={{ marginTop: 4, color: "#64748B" }}>
                    {item.size_label} • Qty {item.quantity}
                  </TText>
                  <TText weight="bold" style={{ marginTop: 6, color: "#166534" }}>
                    {formatKes(item.line_total_kes || item.unit_price_kes * item.quantity)}
                  </TText>
                </View>
              ))
            ) : (
              <TText style={{ color: "#64748B" }}>No items found for this order.</TText>
            )}
          </Card>
        </Section>

        {order.payment_method === "mpesa" ? (
          <Section title="M-Pesa" icon="phone-portrait-outline">
            <Card>
              <TText style={{ color: "#475569", lineHeight: 21, marginBottom: 12 }}>
                Your order is already created. Payment starts separately from here so you
                can retry safely without recreating the order.
              </TText>

              <Pressable
                onPress={handleStartMpesa}
                disabled={!canStartMpesa}
                style={{
                  backgroundColor: canStartMpesa ? "#16A34A" : "#A7F3D0",
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  opacity: isStartingMpesa ? 0.75 : 1,
                }}
              >
                <TText weight="bold" style={{ color: "#FFFFFF" }}>
                  {isStartingMpesa
                    ? "Sending STK Push..."
                    : order.payment_status === "succeeded"
                    ? "Payment completed"
                    : order.payment_status === "processing" || order.status === "awaiting_payment"
                    ? "Waiting for confirmation..."
                    : "Pay with M-Pesa"}
                </TText>
              </Pressable>

              <Pressable
                onPress={() => loadOrder({ silent: true })}
                style={{
                  marginTop: 10,
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <TText weight="semibold" style={{ color: "#166534" }}>
                  {isPollingPayment ? "Checking automatically..." : "Refresh payment status"}
                </TText>
              </Pressable>
            </Card>
          </Section>
        ) : null}

        <Section title="Payment" icon="card-outline">
          <Card>
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
          </Card>
        </Section>

        <Section title="Totals" icon="calculator-outline">
          <Card>
            <Row label="Subtotal" value={formatKes(order.subtotal_kes)} />
            <Row label="Discount" value={`- ${formatKes(order.discount_kes)}`} />
            <Row label="Delivery fee" value={formatKes(order.delivery_fee_kes)} />
            <Divider />
            <Row label="Total" value={formatKes(order.total_kes)} strong />
          </Card>
        </Section>
      </ScrollView>
    </LinearGradient>
  );
}

function Section({ title, icon, children }) {
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
        <Ionicons name={icon} size={18} color="#166534" />
        <TText weight="bold" style={{ fontSize: 16, color: "#0F172A" }}>
          {title}
        </TText>
      </View>
      {children}
    </View>
  );
}

function Card({ children }) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      {children}
    </View>
  );
}

function Row({ label, value, strong = false }) {
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
        weight={strong ? "bold" : "regular"}
        style={{ color: strong ? "#0F172A" : "#475569", flex: 1 }}
      >
        {label}
      </TText>
      <TText
        weight={strong ? "bold" : "semibold"}
        style={{ color: strong ? "#0F172A" : "#166534", flex: 1, textAlign: "right" }}
      >
        {String(value ?? "—")}
      </TText>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 6,
      }}
    />
  );
}