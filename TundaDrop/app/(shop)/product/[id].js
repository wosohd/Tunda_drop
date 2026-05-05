import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  getProductBySlug,
  getMixableProducts,
} from "../../../src/lib/sanityQueries";
import { useCartStore } from "../../../src/store/cartStore";
import { TText } from "../../../src/components/ui/TText";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60";

function ScalePress({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
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

  const [product, setProduct] = useState(null);
  const [mixableProducts, setMixableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedFlavorIds, setSelectedFlavorIds] = useState([]);
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);

        const result = await getProductBySlug(String(id));

        let flavorResults = [];

        if (result?.isCustomizable) {
          flavorResults = await getMixableProducts();
        }

        if (!isMounted) return;

        setProduct(result ?? null);
        setMixableProducts(flavorResults ?? []);
        setSelectedIndex(0);
        setQty(1);
        setSelectedFlavorIds([]);
        setCustomNote("");
      } catch (error) {
        console.warn("Failed to load Sanity product:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableVariants = useMemo(() => {
    return (product?.variants ?? []).filter(
      (variant) => variant.isAvailable !== false
    );
  }, [product]);

  const selectedFlavors = useMemo(() => {
    return mixableProducts.filter((item) => selectedFlavorIds.includes(item.id));
  }, [mixableProducts, selectedFlavorIds]);

  function toggleFlavor(flavorId) {
    setSelectedFlavorIds((current) => {
      if (current.includes(flavorId)) {
        return current.filter((id) => id !== flavorId);
      }

      return [...current, flavorId];
    });
  }

  function handleAddToCart() {
    const selectedVariant = availableVariants[selectedIndex] ?? availableVariants[0];

    if (!selectedVariant) {
      Alert.alert("Unavailable", "This product has no available size options.");
      return;
    }

    if (product.isCustomizable && selectedFlavors.length < 2) {
      Alert.alert(
        "Choose flavors",
        "Please select at least two flavors for your custom mix."
      );
      return;
    }

    const customization = product.isCustomizable
      ? {
          type: "custom_mix",
          selectedFlavors: selectedFlavors.map((flavor) => ({
            id: flavor.id,
            name: flavor.name,
            category: flavor.category,
            categoryTitle: flavor.categoryTitle,
          })),
          note: customNote.trim(),
        }
      : null;

    addItem({
      productId: product.id,
      name: product.name,
      image: product.image || FALLBACK_IMAGE,
      sizeLabel: selectedVariant.sizeLabel,
      unitPriceKes: selectedVariant.price,
      quantity: qty,
      customization,
    });

    router.push("/cart");
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <TText muted style={{ marginTop: 10 }}>
          Loading product...
        </TText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <TText style={{ fontSize: 18, fontWeight: "800" }}>
          Product not found.
        </TText>
      </View>
    );
  }

  const selectedVariant = availableVariants[selectedIndex] ?? availableVariants[0];
  const priceKes = selectedVariant ? selectedVariant.price * qty : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ borderRadius: 26, overflow: "hidden" }}>
        <Image
          source={{ uri: product.image || FALLBACK_IMAGE }}
          style={{ height: 260, width: "100%" }}
        />
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
            {product.categoryTitle}
          </TText>
        </LinearGradient>
      </View>

      <TText muted style={{ marginTop: 12 }}>
        {product.description}
      </TText>

      {product.isCustomizable && !!product.customizationNote && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 18,
            backgroundColor: "#F0FDF4",
            borderWidth: 1,
            borderColor: "#BBF7D0",
          }}
        >
          <TText style={{ fontWeight: "900", color: "#166534" }}>
            Custom mix available
          </TText>
          <TText style={{ marginTop: 4, color: "#166534" }}>
            {product.customizationNote}
          </TText>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
        }}
      >
        {(product.characteristics ?? []).map((tag) => (
          <View
            key={tag}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: "#F4F6FF",
              borderWidth: 1,
              borderColor: "#E7EBFF",
            }}
          >
            <TText style={{ fontWeight: "800" }}>{tag}</TText>
          </View>
        ))}
      </View>

      <TText style={{ marginTop: 16, fontSize: 16, fontWeight: "900" }}>
        Choose size
      </TText>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {availableVariants.map((variant, idx) => {
          const active = idx === selectedIndex;

          return (
            <ScalePress
              key={variant._key || variant.sizeLabel}
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
                <TText
                  style={{
                    fontWeight: "900",
                    color: active ? "#fff" : undefined,
                  }}
                >
                  {variant.sizeLabel}
                </TText>

                <TText
                  style={{
                    marginTop: 6,
                    fontWeight: "900",
                    color: active ? "#fff" : undefined,
                  }}
                >
                  KES {variant.price}
                </TText>
              </View>
            </ScalePress>
          );
        })}
      </View>

      {product.isCustomizable && (
        <View style={{ marginTop: 18 }}>
          <TText style={{ fontSize: 16, fontWeight: "900" }}>
            Choose flavors to mix
          </TText>

          <TText muted style={{ marginTop: 4 }}>
            Select at least two flavors for your cocktail.
          </TText>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
            }}
          >
            {mixableProducts.map((flavor) => {
              const active = selectedFlavorIds.includes(flavor.id);

              return (
                <ScalePress
                  key={flavor.id}
                  onPress={() => toggleFlavor(flavor.id)}
                >
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? "#16A34A" : "#E7EBFF",
                      backgroundColor: active ? "#DCFCE7" : "#F4F6FF",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name={active ? "checkmark-circle" : "add-circle-outline"}
                      size={16}
                      color={active ? "#166534" : "#475569"}
                    />
                    <TText
                      style={{
                        fontWeight: "900",
                        color: active ? "#166534" : "#111827",
                      }}
                    >
                      {flavor.name}
                    </TText>
                  </View>
                </ScalePress>
              );
            })}
          </View>

          <View style={{ marginTop: 12 }}>
            <TText style={{ fontWeight: "900", marginBottom: 6 }}>
              Optional mix note
            </TText>
            <TextInput
              value={customNote}
              onChangeText={setCustomNote}
              placeholder="Example: More ginger, less sugar, extra mint..."
              multiline
              style={{
                minHeight: 88,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#D7E5DB",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 14,
                paddingVertical: 12,
                textAlignVertical: "top",
                color: "#111827",
              }}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      )}

      <TText style={{ marginTop: 16, fontSize: 16, fontWeight: "900" }}>
        Quantity
      </TText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
        }}
      >
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

      <View style={{ height: 16 }} />

      <ScalePress onPress={handleAddToCart}>
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
          <View style={{ flex: 1 }}>
            <TText style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              Add to cart
            </TText>

            <TText style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}>
              Total: KES {priceKes}
            </TText>

            {product.isCustomizable && selectedFlavors.length > 0 && (
              <TText
                style={{
                  color: "rgba(255,255,255,0.95)",
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                Mix: {selectedFlavors.map((flavor) => flavor.name).join(" + ")}
              </TText>
            )}
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