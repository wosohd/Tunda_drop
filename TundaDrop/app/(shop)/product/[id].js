import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PRODUCTS, CATEGORIES } from "../../../src/constants/mockData";
import { useCartStore } from "../../../src/store/cartStore";
import { TText } from "../../../src/components/ui/TText"; // ✅ added (adjust if needed)

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

export default function Product() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const categoryLabel = useMemo(() => {
    if (!product) return "";
    return CATEGORIES.find((c) => c.id === product.category)?.title ?? "";
  }, [product]);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <TText style={{ fontSize: 18, fontWeight: "800" }}>
          Product not found.
        </TText>
      </View>
    );
  }

  const selectedVariant = product.variants[selectedIndex];
  const priceKes = selectedVariant.price * qty;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ borderRadius: 26, overflow: "hidden" }}>
        <Image source={{ uri: product.image }} style={{ height: 260, width: "100%" }} />
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.75)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 14,
          }}
        >
          <TText style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>
            {product.name}
          </TText>
          <TText style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
            {categoryLabel}
          </TText>
        </LinearGradient>
      </View>

      <TText muted style={{ marginTop: 12 }}>
        {product.description}
      </TText>

      {/* Tags */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {product.characteristics.map((t) => (
          <View
            key={t}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: "#F4F6FF",
              borderWidth: 1,
              borderColor: "#E7EBFF",
            }}
          >
            <TText style={{ fontWeight: "800" }}>{t}</TText>
          </View>
        ))}
      </View>

      {/* Variant selector */}
      <TText style={{ marginTop: 16, fontSize: 16, fontWeight: "900" }}>
        Choose size
      </TText>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {product.variants.map((v, idx) => {
          const active = idx === selectedIndex;
          return (
            <ScalePress
              key={v.sizeLabel}
              onPress={() => setSelectedIndex(idx)}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  padding: 12,
                  borderRadius: 18,
                  backgroundColor: active ? "#111827" : "#fff",
                  borderWidth: 1,
                  borderColor: active ? "#111827" : "#EEF1FF",
                }}
              >
                <TText style={{ fontWeight: "900", color: active ? "#fff" : undefined }}>
                  {v.sizeLabel}
                </TText>

                <TText
                  style={{
                    marginTop: 6,
                    fontWeight: "900",
                    color: active ? "#fff" : undefined,
                  }}
                >
                  KES {v.price}
                </TText>
              </View>
            </ScalePress>
          );
        })}
      </View>

      {/* Qty */}
      <TText style={{ marginTop: 16, fontSize: 16, fontWeight: "900" }}>
        Quantity
      </TText>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
        <ScalePress onPress={() => setQty((q) => Math.max(1, q - 1))}>
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
            <Ionicons name="remove" size={18} color="#111827" />
          </View>
        </ScalePress>

        <View
          style={{
            minWidth: 56,
            height: 44,
            borderRadius: 16,
            backgroundColor: "#111827",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 14,
          }}
        >
          <TText style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
            {qty}
          </TText>
        </View>

        <ScalePress onPress={() => setQty((q) => q + 1)}>
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
            <Ionicons name="add" size={18} color="#111827" />
          </View>
        </ScalePress>
      </View>

      {/* CTA */}
      <View style={{ height: 16 }} />

      <ScalePress
        onPress={() => {
          addItem({
            productId: product.id,
            name: product.name,
            image: product.image,
            sizeLabel: selectedVariant.sizeLabel,
            unitPriceKes: selectedVariant.price,
            quantity: qty,
          });
          router.push("/(shop)/cart");
        }}
      >
        <LinearGradient
          colors={["#00D1FF", "#7C4DFF", "#FF3D81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
              Add to cart
            </TText>
            <TText style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}>
              Total: KES {priceKes}
            </TText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </ScalePress>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}
