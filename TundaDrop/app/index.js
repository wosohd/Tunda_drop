import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Animated,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  getCategories,
  getFeaturedProducts,
  getProducts,
  getBusinessSettings,
} from "../src/lib/sanityQueries";
import { useThemeTokens } from "../src/theme/useTheme";

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
        style={{ borderRadius: 18 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function normalize(s) {
  return (s ?? "").toString().toLowerCase().trim();
}

function getStartingPrice(product) {
  const prices = (product?.variants ?? [])
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) return 0;

  return Math.min(...prices);
}

export default function Home() {
  const router = useRouter();
  const t = useThemeTokens();

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setIsLoading(true);

        const [
          categoryResults,
          featuredResults,
          productResults,
          businessSettings,
        ] = await Promise.all([
          getCategories(),
          getFeaturedProducts(),
          getProducts(),
          getBusinessSettings(),
        ]);

        if (!isMounted) return;

        setCategories(categoryResults ?? []);
        setFeatured(
          featuredResults?.length ? featuredResults : (productResults ?? []).slice(0, 6)
        );
        setAllProducts(productResults ?? []);
        setSettings(businessSettings ?? null);
      } catch (error) {
        console.warn("Failed to load Sanity home data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    return allProducts
      .filter((p) => {
        const hay = [p.name, p.description, ...(p.characteristics ?? [])]
          .map(normalize)
          .join(" ");
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [query, allProducts]);

  const showResults = query.trim().length > 0;
  const visibleProducts = showResults ? results : featured;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <LinearGradient
          colors={["#00D1FF", "#7C4DFF", "#FF3D81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 26,
            padding: 18,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="leaf" size={22} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
                {settings?.appName || "TundaDrop"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 2 }}>
                {settings?.tagline || "Fresh juices • fast delivery • good vibes"}
              </Text>
            </View>

            <ScalePress onPress={() => router.push("/cart")}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cart</Text>
              </View>
            </ScalePress>
          </View>

          <View
            style={{
              marginTop: 14,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.22)",
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.95)" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search mango, detox, cocktails…"
              placeholderTextColor="rgba(255,255,255,0.8)"
              style={{ flex: 1, color: "#fff", fontWeight: "700" }}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {!!query && (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="rgba(255,255,255,0.95)"
                />
              </Pressable>
            )}
          </View>

          <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
            <ScalePress onPress={() => router.push("/categories")}>
              <View
                style={{
                  flex: 1,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  padding: 14,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Browse Categories
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                  {categories.length || 5} tasty vibes
                </Text>
              </View>
            </ScalePress>
          </View>
        </LinearGradient>

        {isLoading ? (
          <View style={{ paddingVertical: 30, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 10, color: t.mutedText }}>
              Loading fresh juices...
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 8,
                color: t.text,
              }}
            >
              Categories
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10, paddingBottom: 12 }}>
                {categories.map((c) => (
                  <ScalePress
                    key={c.id}
                    onPress={() =>
                      router.push({
                        pathname: "/categories",
                        params: { category: c.id },
                      })
                    }
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 16,
                        backgroundColor: t.chipBg,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        borderWidth: 1,
                        borderColor: t.chipBorder,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                      <Text style={{ fontWeight: "800", color: t.text }}>
                        {c.title}
                      </Text>
                    </View>
                  </ScalePress>
                ))}
              </View>
            </ScrollView>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 8,
                color: t.text,
              }}
            >
              {showResults ? "Search Results" : "Featured Juices"}
            </Text>

            <View style={{ gap: 12 }}>
              {visibleProducts.map((p) => (
                <ScalePress
                  key={p.id}
                  onPress={() => router.push(`/product/${p.id}`)}
                >
                  <View
                    style={{
                      borderRadius: 22,
                      overflow: "hidden",
                      backgroundColor: t.card,
                      borderWidth: 1,
                      borderColor: t.border,
                    }}
                  >
                    <Image
                      source={{ uri: p.image || FALLBACK_IMAGE }}
                      style={{ height: 140, width: "100%" }}
                    />
                    <View style={{ padding: 14 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "900",
                          color: t.text,
                        }}
                      >
                        {p.name}
                      </Text>
                      <Text
                        style={{ marginTop: 4, color: t.mutedText }}
                        numberOfLines={2}
                      >
                        {p.description}
                      </Text>

                      <View
                        style={{
                          marginTop: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontWeight: "900", color: t.text }}>
                          From KES {getStartingPrice(p)}
                        </Text>

                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 14,
                            backgroundColor: t.darkButton,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Ionicons name="sparkles" size={16} color="#fff" />
                          <Text style={{ color: "#fff", fontWeight: "900" }}>
                            View
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScalePress>
              ))}

              {!visibleProducts.length && (
                <Text style={{ color: t.mutedText }}>
                  No products found yet.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
