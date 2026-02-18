import React, { useMemo, useRef, useEffect } from "react";
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
import { DELIVERY_ZONES } from "../../src/constants/deliveryZones";
import { useCheckoutStore } from "../../src/store/checkoutStore";
import { useCartStore } from "../../src/store/cartStore";
import { useOrdersStore } from "../../src/store/ordersStore";
import { calcTotalsKes } from "../../src/lib/money";
import { TText } from "../../src/components/ui/TText";
import { useAuthStore } from "../../src/store/authStore";

const DISCOUNT_PERCENT_TEST = 10;

// ✅ Fix 1: ScalePress accepts + applies style so children can layout (flex: 1, etc.)
function ScalePress({ children, onPress, style, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Checkout() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const isAuthHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    if (isAuthHydrating) return;
    if (!user) router.replace("/(auth)/login");
  }, [isAuthHydrating, user]);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const getLinesForTotals = useCartStore((s) => s.getLinesForTotals);

  const addOrder = useOrdersStore((s) => s.addOrder);

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
    !!paymentMethod;

  function placeOrderStub() {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to place an order.", [
        { text: "Go to login", onPress: () => router.replace("/(auth)/login") },
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

    const order = addOrder({
      userId: user.id,
      items: items.map((i) => ({
        name: i.name,
        sizeLabel: i.sizeLabel,
        unitPriceKes: i.unitPriceKes,
        quantity: i.quantity,
        image: i.image,
      })),
      delivery: {
        zoneId: zone.id,
        zoneTitle: zone.title,
        rangeLabel: zone.rangeLabel,
        feeKes: zone.feeKes,
        address: address.trim(),
        phone: phone.trim(),
      },
      payment: {
        method: paymentMethod, // "mpesa" | "card"
      },
      pricing: {
        discountPercent: DISCOUNT_PERCENT_TEST,
        subtotalKes: totals.subtotalKes,
        discountKes: totals.discountKes,
        deliveryFeeKes: totals.deliveryFeeKes,
        totalKes: totals.totalKes,
      },
    });

    Alert.alert(
      "Order placed (stub)",
      `Order ID: ${order.id}\nPayment: ${paymentMethod.toUpperCase()}\nTotal: KES ${totals.totalKes}\nDelivery: ${zone.title} (${zone.rangeLabel})`,
      [
        {
          text: "View order",
          onPress: () => {
            clearCart();
            router.replace(`/(orders)/order/${order.id}`);
          },
        },
        {
          text: "OK",
          onPress: () => {
            clearCart();
            router.replace("/(orders)/orders");
          },
        },
      ]
    );
  }

  const payLabel = paymentMethod ? paymentMethod.toUpperCase() : "PAY";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      // ✅ Fix 2: avoids "blank" layouts + ensures screen fills and scrolls nicely
      contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
    >
      <TText style={{ fontSize: 20, fontWeight: "900", marginBottom: 8 }}>
        Checkout
      </TText>
      <TText muted style={{ marginBottom: 12 }}>
        Choose a delivery zone, add your details, then pay.
      </TText>

      {/* Delivery zone */}
      <SectionTitle icon="navigate" title="Delivery zone" />
      <View style={{ gap: 10, marginTop: 10 }}>
        {DELIVERY_ZONES.map((z) => {
          const active = z.id === zoneId;
          return (
            <ScalePress key={z.id} onPress={() => setZoneId(z.id)}>
              <View
                style={{
                  borderRadius: 22,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: active ? "#111827" : "#EEF1FF",
                  backgroundColor: active ? "#111827" : "#fff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <TText
                      style={{
                        fontWeight: "900",
                        fontSize: 16,
                        color: active ? "#fff" : undefined,
                      }}
                    >
                      {z.title} • {z.rangeLabel}
                    </TText>

                    <TText
                      style={{
                        marginTop: 4,
                        color: active ? "rgba(255,255,255,0.9)" : undefined,
                      }}
                      muted={!active}
                    >
                      {z.note}
                    </TText>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: active
                        ? "rgba(255,255,255,0.18)"
                        : "#F4F6FF",
                      borderWidth: 1,
                      borderColor: active
                        ? "rgba(255,255,255,0.25)"
                        : "#E7EBFF",
                    }}
                  >
                    <TText
                      style={{
                        fontWeight: "900",
                        color: active ? "#fff" : undefined,
                      }}
                    >
                      KES {z.feeKes}
                    </TText>
                  </View>
                </View>
              </View>
            </ScalePress>
          );
        })}
      </View>

      {/* Address + Phone */}
      <View style={{ height: 14 }} />
      <SectionTitle icon="home" title="Delivery details" />
      <View style={{ gap: 10, marginTop: 10 }}>
        <Field
          label="Delivery address"
          placeholder="e.g., Kilimani, Wood Avenue, Apt 12"
          value={address}
          onChangeText={setAddress}
          multiline
        />
        <Field
          label="Phone number"
          placeholder="e.g., 07xx xxx xxx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Payment method */}
      <View style={{ height: 14 }} />
      <SectionTitle icon="wallet" title="Payment method" />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <PayChoice
          active={paymentMethod === "mpesa"}
          title="M-Pesa"
          subtitle="STK Push (later)"
          icon="phone-portrait"
          onPress={() => setPaymentMethod("mpesa")}
        />
        <PayChoice
          active={paymentMethod === "card"}
          title="Card"
          subtitle="Visa/Mastercard (later)"
          icon="card"
          onPress={() => setPaymentMethod("card")}
        />
      </View>

      {/* Summary */}
      <View style={{ height: 14 }} />
      <SectionTitle icon="receipt" title="Summary" />
      <View
        style={{
          marginTop: 10,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 8,
        }}
      >
        <Row label="Subtotal" value={`KES ${totals.subtotalKes}`} />
        <Row
          label={`Discount (${DISCOUNT_PERCENT_TEST}% test)`}
          value={`- KES ${totals.discountKes}`}
        />
        <Row label="Delivery fee" value={`KES ${totals.deliveryFeeKes}`} />
        <View style={{ height: 1, backgroundColor: "#EEF1FF", marginVertical: 6 }} />
        <Row label="Total" value={`KES ${totals.totalKes}`} strong />
      </View>

      {/* Place order */}
      <View style={{ height: 14 }} />

      <ScalePress onPress={placeOrderStub} disabled={!canPlace}>
        <LinearGradient
          colors={
            canPlace
              ? ["#00D1FF", "#7C4DFF", "#FF3D81"]
              : ["#C7CBD6", "#C7CBD6", "#C7CBD6"]
          }
          style={{
            borderRadius: 22,
            paddingVertical: 14,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <TText style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              Place order
            </TText>
            <TText style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}>
              Pay {payLabel} • KES {totals.totalKes}
            </TText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </ScalePress>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Ionicons name={icon} size={18} color="#111827" />
      <TText style={{ fontSize: 16, fontWeight: "900" }}>{title}</TText>
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
      <TText style={{ fontWeight: "900", marginBottom: 6 }}>{label}</TText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 14,
          minHeight: multiline ? 90 : undefined,
        }}
      />
    </View>
  );
}

function PayChoice({ active, title, subtitle, icon, onPress }) {
  return (
    <ScalePress onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          borderRadius: 22,
          padding: 14,
          borderWidth: 1,
          borderColor: active ? "#111827" : "#EEF1FF",
          backgroundColor: active ? "#111827" : "#fff",
          gap: 8,
        }}
      >
        <Ionicons name={icon} size={18} color={active ? "#fff" : "#111827"} />
        <TText
          style={{
            fontWeight: "900",
            fontSize: 16,
            color: active ? "#fff" : undefined,
          }}
        >
          {title}
        </TText>
        <TText
          style={{ color: active ? "rgba(255,255,255,0.9)" : undefined }}
          muted={!active}
        >
          {subtitle}
        </TText>
      </View>
    </ScalePress>
  );
}

function Row({ label, value, strong }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TText muted style={{ fontWeight: strong ? "900" : "700" }}>
        {label}
      </TText>
      <TText style={{ fontWeight: strong ? "900" : "800" }}>{value}</TText>
    </View>
  );
}



