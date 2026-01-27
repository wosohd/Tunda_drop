import React, { useMemo, useRef } from "react";
import { View, Text, Image, Pressable, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCartStore } from "../../src/store/cartStore";
import { calcTotalsKes } from "../../src/lib/money";

function ScalePress({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
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

export default function Cart() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const getLinesForTotals = useCartStore((s) => s.getLinesForTotals);

  // Testing discount (10%) and delivery fee (0 here; added in Checkout)
  const totals = useMemo(() => {
    return calcTotalsKes({
      lines: getLinesForTotals(),
      discountPercent: 10,
      deliveryFeeKes: 0,
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <Ionicons name="cart-outline" size={40} color="#111827" />
        <Text style={{ fontSize: 18, fontWeight: "900" }}>Your cart is empty</Text>
        <Text style={{ color: "#444" }}>Add a juice and come back here.</Text>

        <ScalePress onPress={() => router.push("/(shop)/categories")} style={{ marginTop: 8 }}>
          <LinearGradient
            colors={["#00D1FF", "#7C4DFF", "#FF3D81"]}
            style={{ borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16 }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Browse juices</Text>
          </LinearGradient>
        </ScalePress>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header actions */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "900" }}>Your Cart</Text>
        <Pressable onPress={clear}>
          <Text style={{ fontWeight: "900" }}>Clear</Text>
        </Pressable>
      </View>

      {/* Cart items */}
      <View style={{ gap: 12, marginTop: 12 }}>
        {items.map((i) => (
          <View
            key={i.key}
            style={{
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#EEF1FF",
              backgroundColor: "#fff",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Image source={{ uri: i.image }} style={{ width: 110, height: 110 }} />
              <View style={{ flex: 1, padding: 12, gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", fontSize: 16 }} numberOfLines={1}>
                      {i.name}
                    </Text>
                    <Text style={{ color: "#444", marginTop: 2 }}>
                      {i.sizeLabel} • KES {i.unitPriceKes} each
                    </Text>
                  </View>

                  <Pressable onPress={() => remove(i.key)}>
                    <Ionicons name="trash" size={18} color="#111827" />
                  </Pressable>
                </View>

                {/* Qty controls */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ScalePress onPress={() => dec(i.key)}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: "#F4F6FF",
                        borderWidth: 1,
                        borderColor: "#E7EBFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#111827" />
                    </View>
                  </ScalePress>

                  <View
                    style={{
                      minWidth: 54,
                      height: 42,
                      borderRadius: 16,
                      backgroundColor: "#111827",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900" }}>{i.quantity}</Text>
                  </View>

                  <ScalePress onPress={() => inc(i.key)}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: "#F4F6FF",
                        borderWidth: 1,
                        borderColor: "#E7EBFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="add" size={16} color="#111827" />
                    </View>
                  </ScalePress>

                  <View style={{ flex: 1 }} />

                  <Text style={{ fontWeight: "900" }}>
                    KES {i.unitPriceKes * i.quantity}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View
        style={{
          marginTop: 16,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#EEF1FF",
          backgroundColor: "#fff",
          padding: 14,
          gap: 8,
        }}
      >
        <Row label="Subtotal" value={`KES ${totals.subtotalKes}`} />
        <Row label="Discount (10% test)" value={`- KES ${totals.discountKes}`} />
        <Row label="Delivery" value="Select at checkout" />
        <View style={{ height: 1, backgroundColor: "#EEF1FF", marginVertical: 6 }} />
        <Row label="Total (excl. delivery)" value={`KES ${totals.discountedSubtotalKes}`} strong />
      </View>

      {/* Checkout CTA */}
      <View style={{ height: 14 }} />

      <ScalePress onPress={() => router.push("/(shop)/checkout")}>
        <LinearGradient
          colors={["#00D1FF", "#7C4DFF", "#FF3D81"]}
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
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              Continue to checkout
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}>
              KES {totals.discountedSubtotalKes} + delivery
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="card" size={18} color="#fff" />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </ScalePress>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: "#444", fontWeight: strong ? "900" : "700" }}>{label}</Text>
      <Text style={{ fontWeight: strong ? "900" : "800" }}>{value}</Text>
    </View>
  );
}
