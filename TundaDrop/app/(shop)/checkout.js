import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Alert,
} from "react-native";
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
import { createStripePaymentIntent } from "../../src/lib/stripeService";
import { useThemeTokens } from "../../src/theme/useTheme";

import ScreenShell from "../../src/components/ui/ScreenShell";
import GlassCard from "../../src/components/ui/GlassCard";
import TChip from "../../src/components/ui/TChip";
import ScalePress from "../../src/components/ui/ScalePress";
import GradientButton from "../../src/components/ui/GradientButton";

const DISCOUNT_PERCENT_TEST = 10;

function getCustomMixText(item) {
  const flavors = item?.customization?.selectedFlavors ?? [];

  return flavors
    .map((flavor) => flavor?.name)
    .filter(Boolean)
    .join(" + ");
}

function getCustomMixNote(item) {
  return item?.customization?.note?.trim?.() || "";
}

export default function Checkout() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const t = useThemeTokens();

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

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const mutedTextColor = isDarkMode ? "#CBD5E1" : "#64748B";
  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const successText = isDarkMode ? "#BBF7D0" : "#166534";

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

  async function saveOrderAfterPayment() {
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

  async function handleCardPayment() {
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
        "Please confirm delivery zone, address, phone number, and payment method."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (paymentMethod === "card") {
        await handleCardPayment();

        const order = await saveOrderAfterPayment();

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
        const order = await saveOrderAfterPayment();

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

  const payTitle = isSubmitting
    ? paymentMethod === "card"
      ? "Processing card..."
      : "Saving order..."
    : `Pay ${payLabel} • KES ${totals.totalKes}`;

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0 }}>
      <View style={{ marginTop: 4, marginBottom: 18 }}>
        <TText style={{ fontSize: 28, fontWeight: "950", color: textColor }}>
          Checkout
        </TText>

        <TText
          style={{
            marginTop: 6,
            color: mutedTextColor,
            lineHeight: 22,
          }}
        >
          Choose your delivery zone, confirm your details, then complete payment.
        </TText>
      </View>

      <SectionTitle icon="basket-outline" title="Your order" />
      <View style={{ gap: 10, marginBottom: 18 }}>
        {items.map((item) => {
          const customMixText = getCustomMixText(item);
          const customMixNote = getCustomMixNote(item);
          const hasCustomMix = Boolean(customMixText);

          return (
            <GlassCard key={item.key} style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <TText
                    style={{
                      color: textColor,
                      fontWeight: "950",
                      fontSize: 15,
                    }}
                  >
                    {item.name}
                  </TText>

                  <TText
                    style={{
                      color: mutedTextColor,
                      marginTop: 3,
                      fontWeight: "700",
                    }}
                  >
                    {item.sizeLabel} • Qty {item.quantity} • KES{" "}
                    {item.unitPriceKes} each
                  </TText>
                </View>

                <TText style={{ color: textColor, fontWeight: "950" }}>
                  KES {item.unitPriceKes * item.quantity}
                </TText>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <TChip label={item.sizeLabel} icon="cube-outline" />
                {hasCustomMix ? (
                  <TChip label="Custom mix" icon="flask" variant="success" />
                ) : null}
              </View>

              {hasCustomMix ? (
                <View
                  style={{
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
                      color: successText,
                      fontWeight: "900",
                      lineHeight: 20,
                    }}
                  >
                    Mix: {customMixText}
                  </TText>

                  {customMixNote ? (
                    <TText
                      style={{
                        color: successText,
                        marginTop: 4,
                        lineHeight: 19,
                      }}
                    >
                      Note: {customMixNote}
                    </TText>
                  ) : null}
                </View>
              ) : null}
            </GlassCard>
          );
        })}

        {!items.length ? (
          <GlassCard>
            <TText muted>Your cart is empty.</TText>
          </GlassCard>
        ) : null}
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
              <GlassCard
                style={{
                  borderColor: active ? "#22C55E" : softBorder,
                  backgroundColor: active
                    ? isDarkMode
                      ? "rgba(20,83,45,0.36)"
                      : "#F0FDF4"
                    : undefined,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <TText style={{ color: textColor, fontWeight: "950" }}>
                      {z.title} • {z.rangeLabel}
                    </TText>

                    <TText
                      style={{
                        color: mutedTextColor,
                        marginTop: 4,
                        lineHeight: 20,
                      }}
                    >
                      {z.note}
                    </TText>

                    <TText
                      style={{
                        color: successText,
                        marginTop: 8,
                        fontWeight: "950",
                      }}
                    >
                      KES {z.feeKes}
                    </TText>
                  </View>

                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={21}
                    color={active ? "#22C55E" : "#94A3B8"}
                  />
                </View>
              </GlassCard>
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
      <GlassCard style={{ marginBottom: 20, gap: 10 }}>
        <Row label="Subtotal" value={`KES ${totals.subtotalKes}`} />
        <Row label="Discount" value={`- KES ${totals.discountKes}`} />
        <Row label="Delivery" value={`KES ${totals.deliveryFeeKes}`} />

        <View
          style={{
            height: 1,
            backgroundColor: softBorder,
            marginVertical: 4,
          }}
        />

        <Row strong label="Total" value={`KES ${totals.totalKes}`} />
      </GlassCard>

      <GradientButton
        title={payTitle}
        onPress={handleCreateOrder}
        disabled={!canPlace}
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name={paymentMethod === "mpesa" ? "phone-portrait-outline" : "card"}
              size={18}
              color="#fff"
            />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        }
      />

      <View style={{ height: 28 }} />
    </ScreenShell>
  );
}

function SectionTitle({ icon, title }) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
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
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
    <GlassCard style={{ gap: 7 }}>
      <TText
        style={{
          color: t.text,
          fontWeight: "900",
          fontSize: 14,
        }}
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
          backgroundColor: isDarkMode ? "#0F172A" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDarkMode ? "#334155" : "#D7E5DB",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 14 : 12,
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? "top" : "center",
          color: isDarkMode ? "#FFFFFF" : "#0F172A",
          fontWeight: "700",
        }}
        placeholderTextColor="#94A3B8"
      />
    </GlassCard>
  );
}

function PayChoice({ active, title, subtitle, icon, onPress }) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const activeBg = isDarkMode ? "rgba(20,83,45,0.36)" : "#F0FDF4";
  const inactiveBg = isDarkMode ? "rgba(15,23,42,0.88)" : "#FFFFFF";
  const activeBorder = "#22C55E";
  const inactiveBorder = isDarkMode ? "#334155" : "#D7E5DB";
  const iconBg = active
    ? isDarkMode
      ? "rgba(34,197,94,0.18)"
      : "#DCFCE7"
    : isDarkMode
      ? "#111827"
      : "#F1F5F9";

  return (
    <ScalePress onPress={onPress}>
      <View
        style={{
          backgroundColor: active ? activeBg : inactiveBg,
          borderWidth: 1.2,
          borderColor: active ? activeBorder : inactiveBorder,
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
            backgroundColor: iconBg,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={active ? "#22C55E" : isDarkMode ? "#CBD5E1" : "#475569"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <TText style={{ color: t.text, fontWeight: "950" }}>
            {title}
          </TText>

          <TText
            style={{
              color: t.mutedText,
              marginTop: 2,
              lineHeight: 19,
            }}
          >
            {subtitle}
          </TText>
        </View>

        <Ionicons
          name={active ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={active ? "#22C55E" : "#94A3B8"}
        />
      </View>
    </ScalePress>
  );
}

function Row({ label, value, strong }) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <TText
        style={{
          color: strong ? t.text : t.mutedText,
          fontWeight: strong ? "950" : "700",
        }}
      >
        {label}
      </TText>

      <TText
        style={{
          color: strong ? t.text : isDarkMode ? "#BBF7D0" : "#166534",
          fontWeight: strong ? "950" : "900",
        }}
      >
        {value}
      </TText>
    </View>
  );
}