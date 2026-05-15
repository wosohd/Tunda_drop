import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
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
import ScreenShell from "../../../src/components/ui/ScreenShell";
import GlassCard from "../../../src/components/ui/GlassCard";
import TChip from "../../../src/components/ui/TChip";
import ScalePress from "../../../src/components/ui/ScalePress";
import GradientButton from "../../../src/components/ui/GradientButton";
import { useThemeTokens } from "../../../src/theme/useTheme";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60";

const MIN_MIX_FLAVORS = 4;

export default function Product() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const t = useThemeTokens();

  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [mixableProducts, setMixableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedFlavorIds, setSelectedFlavorIds] = useState([]);
  const [customNote, setCustomNote] = useState("");

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const softCardBg = isDarkMode ? "#111827" : "#FFFFFF";

  const successBg = isDarkMode ? "#052E16" : "#F0FDF4";
  const successBorder = isDarkMode ? "#166534" : "#BBF7D0";
  const successText = isDarkMode ? "#BBF7D0" : "#166534";

  const inputBg = isDarkMode ? "#0F172A" : "#FFFFFF";
  const inputText = isDarkMode ? "#FFFFFF" : "#111827";
  const placeholderText = "#94A3B8";

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

  const selectedMixText = useMemo(() => {
    return selectedFlavors.map((flavor) => flavor.name).join(" + ");
  }, [selectedFlavors]);

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

    if (product.isCustomizable && selectedFlavors.length < MIN_MIX_FLAVORS) {
      Alert.alert(
        "Choose flavors",
        `Please select at least ${MIN_MIX_FLAVORS} flavors for your custom mix.`
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
      <ScreenShell scroll={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <TText muted style={{ marginTop: 10 }}>
            Loading product...
          </TText>
        </View>
      </ScreenShell>
    );
  }

  if (!product) {
    return (
      <ScreenShell scroll={false}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <GlassCard>
            <TText style={{ fontSize: 18, fontWeight: "900" }}>
              Product not found.
            </TText>
          </GlassCard>
        </View>
      </ScreenShell>
    );
  }

  const selectedVariant = availableVariants[selectedIndex] ?? availableVariants[0];
  const priceKes = selectedVariant ? selectedVariant.price * qty : 0;

  const needsMoreFlavors =
    product.isCustomizable && selectedFlavors.length < MIN_MIX_FLAVORS;

  const addToCartSubtitle =
    product.isCustomizable && selectedFlavors.length > 0
      ? `Total: KES ${priceKes} • Mix: ${selectedMixText}`
      : `Total: KES ${priceKes}`;

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0 }}>
      <GlassCard padding={0} radius={28} style={{ overflow: "hidden" }}>
        <Image
          source={{ uri: product.image || FALLBACK_IMAGE }}
          style={{ height: 270, width: "100%" }}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.82)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 15,
          }}
        >
          <TText style={{ color: "#fff", fontSize: 24, fontWeight: "950" }}>
            {product.name}
          </TText>

          <TText style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
            {product.categoryTitle}
          </TText>
        </LinearGradient>
      </GlassCard>

      <TText muted style={{ marginTop: 12, lineHeight: 21 }}>
        {product.description}
      </TText>

      {product.isCustomizable && !!product.customizationNote && (
        <GlassCard
          style={{
            marginTop: 12,
            backgroundColor: successBg,
            borderColor: successBorder,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="flask" size={18} color={successText} />
            <TText style={{ fontWeight: "950", color: successText }}>
              Custom mix available
            </TText>
          </View>

          <TText style={{ marginTop: 6, color: successText, lineHeight: 20 }}>
            {product.customizationNote}
          </TText>
        </GlassCard>
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
          <TChip key={tag} label={tag} />
        ))}
      </View>

      <TText style={{ marginTop: 18, fontSize: 17, fontWeight: "950" }}>
        Choose size
      </TText>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {availableVariants.map((variant, idx) => {
          const active = idx === selectedIndex;

          const sizeCardBg = active
            ? isDarkMode
              ? "#FFFFFF"
              : "#111827"
            : isDarkMode
              ? "#111827"
              : "#FFFFFF";

          const sizeCardBorder = active
            ? isDarkMode
              ? "#FFFFFF"
              : "#111827"
            : isDarkMode
              ? "#334155"
              : "#EEF1FF";

          const sizeTextColor = active
            ? isDarkMode
              ? "#111827"
              : "#FFFFFF"
            : isDarkMode
              ? "#FFFFFF"
              : "#111827";

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
                  backgroundColor: sizeCardBg,
                  borderWidth: 1,
                  borderColor: sizeCardBorder,
                  shadowColor: "#000",
                  shadowOpacity: active ? 0.14 : 0.04,
                  shadowRadius: active ? 12 : 6,
                  shadowOffset: { width: 0, height: active ? 8 : 3 },
                  elevation: active ? 4 : 1,
                }}
              >
                <TText
                  style={{
                    fontWeight: "950",
                    color: sizeTextColor,
                  }}
                >
                  {variant.sizeLabel}
                </TText>

                <TText
                  style={{
                    marginTop: 6,
                    fontWeight: "900",
                    color: sizeTextColor,
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
        <GlassCard style={{ marginTop: 18 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <TText style={{ fontSize: 17, fontWeight: "950" }}>
                Choose flavors to mix
              </TText>

              <TText muted style={{ marginTop: 4, lineHeight: 20 }}>
                Select at least four flavors for your cocktail.
              </TText>
            </View>

            <TChip
              label={`${selectedFlavors.length}/${MIN_MIX_FLAVORS} min`}
              variant={needsMoreFlavors ? "warning" : "success"}
            />
          </View>

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
                <TChip
                  key={flavor.id}
                  label={flavor.name}
                  icon={active ? "checkmark-circle" : "add-circle-outline"}
                  active={active}
                  variant={active ? "success" : "default"}
                  onPress={() => toggleFlavor(flavor.id)}
                />
              );
            })}
          </View>

          {selectedFlavors.length > 0 && (
            <View
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 18,
                backgroundColor: isDarkMode
                  ? "rgba(2,6,23,0.55)"
                  : "rgba(248,250,252,0.95)",
                borderWidth: 1,
                borderColor: softBorder,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="flask" size={17} color={successText} />
                <TText style={{ fontWeight: "950" }}>
                  Selected custom mix
                </TText>
              </View>

              <TText style={{ marginTop: 6, fontWeight: "900", color: textColor }}>
                {selectedMixText}
              </TText>

              {needsMoreFlavors && (
                <TText muted style={{ marginTop: 4 }}>
                  Add more flavors to complete your custom mix.
                </TText>
              )}

              {!!customNote.trim() && (
                <TText muted style={{ marginTop: 6 }}>
                  Note: {customNote.trim()}
                </TText>
              )}
            </View>
          )}

          <View style={{ marginTop: 14 }}>
            <TText style={{ fontWeight: "950", marginBottom: 7 }}>
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
                borderColor: softBorder,
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                paddingVertical: 12,
                textAlignVertical: "top",
                color: inputText,
                fontWeight: "700",
              }}
              placeholderTextColor={placeholderText}
            />
          </View>
        </GlassCard>
      )}

      <GlassCard style={{ marginTop: 18 }}>
        <TText style={{ fontSize: 17, fontWeight: "950" }}>
          Quantity
        </TText>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <ScalePress onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: softCardBg,
                borderWidth: 1,
                borderColor: softBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="remove" size={18} color={textColor} />
            </View>
          </ScalePress>

          <View
            style={{
              minWidth: 60,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#111827",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
            }}
          >
            <TText style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
              {qty}
            </TText>
          </View>

          <ScalePress onPress={() => setQty((q) => q + 1)}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: softCardBg,
                borderWidth: 1,
                borderColor: softBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={18} color={textColor} />
            </View>
          </ScalePress>

          <View style={{ flex: 1 }} />

          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
              borderWidth: 1,
              borderColor: softBorder,
            }}
          >
            <TText style={{ fontWeight: "950", color: textColor }}>
              KES {priceKes}
            </TText>
          </View>
        </View>
      </GlassCard>

      <View style={{ height: 16 }} />

      <GradientButton
        title="Add to cart"
        subtitle={addToCartSubtitle}
        onPress={handleAddToCart}
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        }
      />

      <View style={{ height: 10 }} />

      <ScalePress onPress={() => router.push("/(shop)/categories")}>
        <GlassCard
          style={{
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: softBorder,
          }}
        >
          <View style={{ flex: 1 }}>
            <TText style={{ color: textColor, fontWeight: "950", fontSize: 16 }}>
              Continue browsing drinks
            </TText>

            <TText
              style={{
                color: isDarkMode ? "#CBD5E1" : "#64748B",
                marginTop: 3,
                fontWeight: "700",
              }}
            >
              Explore more fresh flavors.
            </TText>
          </View>

          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: isDarkMode ? "#FFFFFF" : "#111827",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={isDarkMode ? "#111827" : "#FFFFFF"}
            />
          </View>
        </GlassCard>
      </ScalePress>

      <View style={{ height: 28 }} />
    </ScreenShell>
  );
}