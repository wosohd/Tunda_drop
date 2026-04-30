import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";

import { DELIVERY_ZONES } from "../../src/constants/deliveryZones";
import { useCheckoutStore } from "../../src/store/checkoutStore";
import { useCartStore } from "../../src/store/cartStore";
import { calcTotalsKes } from "../../src/lib/money";
import { TText } from "../../src/components/ui/TText";
import { useAuthStore } from "../../src/store/authStore";
import { createOrder } from "../../src/lib/orders/createOrder";
import { createStripePaymentIntent } from "../../src/services/stripeService";

const DISCOUNT_PERCENT_TEST = 10;

function ScalePress({ children, onPress, style, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        style={{ flex: 1, opacity: disabled ? 0.65 : 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Checkout() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    if (isAuthHydrating) return;
    if (!user) router.replace("/(auth)/login");
  }, [isAuthHydrating, user, router]);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const getLinesForTotals = useCartStore((s) => s.getLinesForTotals);

  const zoneId = useCheckoutStore((s) => s.zoneId);
  const address = useCheckoutStore((s) => s.address);
  const phone = useCheckoutStore((s) => s.phone);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);

  const setZoneId = useCheckoutStore((s) => s.setZoneId);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const setPhone = useCheckoutStore((s) => s.setPhone);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  const zone = useMemo(
    () => DELIVERY_ZONES.find((z) => z.id === zoneId) ?? DELIVERY_ZONES[0],
    [zoneId]
  );

  const totals = useMemo(() => {
    return calcTotalsKes({
      lines: getLinesForTotals(),
      discountPercent: DISCOUNT_PERCENT_TEST,
      deliveryFeeKes: zone.feeKes,
    });
  }, [items, zone.feeKes, getLinesForTotals]);

  const canPlace =
    items.length > 0 &&
    address.trim().length >= 6 &&
    phone.trim().length >= 9 &&
    !!paymentMethod &&
    !isSubmitting;

  async function createSavedOrder() {
    const { order } = await createOrder({
      user,
      items,
      zoneId,
      address,
      phone,
      paymentMethod,
    });

    return order;
  }

  async function handleStripeCardPayment() {
    const orderReference = `TD-${Date.now()}`;

    const paymentIntent = await createStripePaymentIntent({
      amountKes: totals.totalKes,
      orderReference,
      customer: {
        name: user?.name || user?.email || "TundaDrop Customer",
        email: user?.email || "",
        phone,
        address,
      },
    });

    const initResult = await initPaymentSheet({
      merchantDisplayName: "TundaDrop",
      paymentIntentClientSecret: paymentIntent.clientSecret,
      allowsDelayedPaymentMethods: false,
      defaultBillingDetails: {
        name: user?.name || user?.email || "TundaDrop Customer",
        email: user?.email || "",
        phone,
        address: {
          line1: address,
          country: "KE",
        },
      },
    });

    if (initResult.error) {
      throw new Error(
        initResult.error.message || "Unable to open card payment."
      );
    }

    const paymentResult = await presentPaymentSheet();

    if (paymentResult.error) {
      const isCanceled =
        paymentResult.error.code === "Canceled" ||
        paymentResult.error.code === "canceled";

      const error = new Error(
        isCanceled
          ? "Card payment was canceled. No order was placed."
          : paymentResult.error.message || "Card payment failed."
      );

      error.isCanceled = isCanceled;
      throw error;
    }

    return paymentIntent;
  }

  async function handleCreateOrder() {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to place an order.", [
        {
          text: "Go to login",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
      return;
    }

    if (!canPlace) {
      Alert.alert(
        "Missing info",
        "Please confirm delivery zone, address, and phone number."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (paymentMethod === "card") {
        await handleStripeCardPayment();

        const order = await createSavedOrder();

        Alert.alert(
          "Payment successful",
          `Card payment was completed and order ${
            order.order_number ?? order.id
          } has been saved successfully.`,
          [
            {
              text: "View order",
              onPress: () => {
                clearCart();
                router.replace(`/(orders)/order/${order.id}`);
              },
            },
          ]
        );

        return;
      }

      if (paymentMethod === "mpesa") {
        const order = await createSavedOrder();

        Alert.alert(
          "Order created",
          `Order ${
            order.order_number ?? order.id
          } has been saved successfully.\n\nNext: M-Pesa payment.`,
          [
            {
              text: "Continue",
              onPress: () => {
                clearCart();
                router.replace(`/(orders)/order/${order.id}`);
              },
            },
          ]
        );

        return;
      }

      Alert.alert("Payment method required", "Please select a payment method.");
    } catch (error) {
      if (error?.isCanceled) {
        Alert.alert("Payment canceled", error.message);
      } else {
        Alert.alert(
          "Payment error",
          error?.message || "Something went wrong while processing payment."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const payLabel = paymentMethod ? paymentMethod.toUpperCase() : "PAY";

  return (
    <LinearGradient
      colors={["#F7FBF8", "#EEF8F2", "#FDFDFD"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 26, marginBottom: 18 }}>
          <TText weight="bold" style={{ fontSize: 28, color: "#0F172A" }}>
            Checkout
          </TText>
          <TText style={{ marginTop: 6, color: "#475569", lineHeight: 22 }}>
            Choose a delivery zone, add your details, then pay.
          </TText>
        </View>

        <SectionTitle icon="location-outline" title="Delivery zone" />
        <View style={{ gap: 12, marginBottom: 18 }}>
          {DELIVERY_ZONES.map((z) => {
            const active = z.id === zoneId;
            return (
              <ScalePress
                key={z.id}
                onPress={() => setZoneId(z.id)}
                style={{ borderRadius: 18 }}
              >
                <View
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    borderWidth: 1.2,
                    borderColor: active ? "#22C55E" : "#D7E5DB",
                    backgroundColor: active ? "#F0FDF4" : "#FFFFFF",
                  }}
                >
                  <TText weight="semibold" style={{ color: "#0F172A" }}>
                    {z.title} • {z.rangeLabel}
                  </TText>
                  <TText style={{ color: "#64748B", marginTop: 4 }}>
                    {z.note}
                  </TText>
                  <TText
                    weight="bold"
                    style={{ color: "#166534", marginTop: 8 }}
                  >
                    KES {z.feeKes}
                  </TText>
                </View>
              </ScalePress>
            );
          })}
        </View>

        <SectionTitle icon="home-outline" title="Delivery details" />
        <View style={{ gap: 12, marginBottom: 18 }}>
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter delivery address"
            multiline
          />
          <Field
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 07XXXXXXXX"
            keyboardType="phone-pad"
          />
        </View>

        <SectionTitle icon="card-outline" title="Payment method" />
        <View style={{ gap: 12, marginBottom: 18 }}>
          <PayChoice
            active={paymentMethod === "mpesa"}
            title="M-Pesa"
            subtitle="Pay with STK Push or Till later"
            icon="phone-portrait-outline"
            onPress={() => setPaymentMethod("mpesa")}
          />
          <PayChoice
            active={paymentMethod === "card"}
            title="Card"
            subtitle="Pay securely with Stripe"
            icon="card-outline"
            onPress={() => setPaymentMethod("card")}
          />
        </View>

        <SectionTitle icon="receipt-outline" title="Summary" />
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            marginBottom: 20,
            gap: 10,
          }}
        >
          <Row label="Subtotal" value={`KES ${totals.subtotalKes}`} />
          <Row label="Discount" value={`- KES ${totals.discountKes}`} />
          <Row label="Delivery" value={`KES ${totals.deliveryFeeKes}`} />
          <View
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginVertical: 4,
            }}
          />
          <Row strong label="Total" value={`KES ${totals.totalKes}`} />
        </View>

        <ScalePress onPress={handleCreateOrder} disabled={!canPlace}>
          <LinearGradient
            colors={["#16A34A", "#22C55E"]}
            style={{
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TText weight="bold" style={{ color: "white", fontSize: 16 }}>
              {isSubmitting
                ? paymentMethod === "card"
                  ? "Processing card..."
                  : "Saving order..."
                : `Pay ${payLabel} • KES ${totals.totalKes}`}
            </TText>
          </LinearGradient>
        </ScalePress>
      </ScrollView>
    </LinearGradient>
  );
}

function SectionTitle({ icon, title }) {
  return (
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
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}) {
  return (
    <View>
      <TText
        weight="semibold"
        style={{ color: "#0F172A", marginBottom: 6, fontSize: 14 }}
      >
        {label}
      </TText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#D7E5DB",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 14 : 12,
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? "top" : "center",
          color: "#0F172A",
        }}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function PayChoice({ active, title, subtitle, icon, onPress }) {
  return (
    <ScalePress onPress={onPress}>
      <View
        style={{
          backgroundColor: active ? "#F0FDF4" : "#FFFFFF",
          borderWidth: 1.2,
          borderColor: active ? "#22C55E" : "#D7E5DB",
          borderRadius: 18,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? "#DCFCE7" : "#F1F5F9",
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={active ? "#166534" : "#475569"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <TText weight="semibold" style={{ color: "#0F172A" }}>
            {title}
          </TText>
          <TText style={{ color: "#64748B", marginTop: 2 }}>{subtitle}</TText>
        </View>

        <Ionicons
          name={active ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={active ? "#16A34A" : "#94A3B8"}
        />
      </View>
    </ScalePress>
  );
}

function Row({ label, value, strong }) {
  return (
    <View
      style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}
    >
      <TText
        weight={strong ? "bold" : "regular"}
        style={{ color: strong ? "#0F172A" : "#475569" }}
      >
        {label}
      </TText>
      <TText
        weight={strong ? "bold" : "semibold"}
        style={{ color: strong ? "#0F172A" : "#166534" }}
      >
        {value}
      </TText>
    </View>
  );
}



