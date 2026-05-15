import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
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
import { TText } from "../src/components/ui/TText";
import ScreenShell from "../src/components/ui/ScreenShell";
import GlassCard from "../src/components/ui/GlassCard";
import TChip from "../src/components/ui/TChip";
import ScalePress from "../src/components/ui/ScalePress";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60";

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

function pickRandomProducts(products, count = 5) {
  const list = [...(products ?? [])];

  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list.slice(0, Math.min(count, list.length));
}

export default function Home() {
  const router = useRouter();
  const t = useThemeTokens();

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [featuredRotation, setFeaturedRotation] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const textColor = isDarkMode ? "#FFFFFF" : "#111827";
  const mutedTextColor = isDarkMode ? "#CBD5E1" : "#64748B";
  const softBorder = isDarkMode ? "#334155" : "#E7EBFF";
  const actionText = isDarkMode ? "#B7F34B" : "#166534";

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
          featuredResults?.length
            ? featuredResults
            : (productResults ?? []).slice(0, 6)
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

  useEffect(() => {
    if (!allProducts.length) return;

    setFeaturedRotation(pickRandomProducts(allProducts, 5));

    const timer = setInterval(() => {
      setFeaturedRotation(pickRandomProducts(allProducts, 5));
    }, 4000);

    return () => clearInterval(timer);
  }, [allProducts]);

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

  const visibleProducts = showResults
    ? results
    : featuredRotation.length
      ? featuredRotation
      : featured.slice(0, 5);

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 110 }}>
      <LinearGradient
        colors={["#00D1FF", "#7C4DFF", "#FF3D81"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 30,
          padding: 18,
          overflow: "hidden",
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.16)",
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -90,
            left: -70,
            width: 190,
            height: 190,
            borderRadius: 999,
            backgroundColor: "rgba(183,243,75,0.16)",
          }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.25)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",
            }}
          >
            <Ionicons name="leaf" size={22} color="#fff" />
          </View>

          <View style={{ flex: 1 }}>
            <TText style={{ color: "#fff", fontSize: 23, fontWeight: "950" }}>
              {settings?.appName || "TundaDrop"}
            </TText>

            <TText
              style={{
                color: "rgba(255,255,255,0.92)",
                marginTop: 2,
                lineHeight: 20,
                fontWeight: "700",
              }}
            >
              {settings?.tagline || "Fresh juices • fast delivery • good vibes"}
            </TText>
          </View>

          <ScalePress onPress={() => router.push("/(shop)/cart")}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.25)",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            >
              <Ionicons name="cart" size={18} color="#fff" />
              <TText style={{ color: "#fff", fontWeight: "900" }}>Cart</TText>
            </View>
          </ScalePress>
        </View>

        <View
          style={{
            marginTop: 16,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.22)",
            paddingHorizontal: 14,
            paddingVertical: 11,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.22)",
          }}
        >
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.95)" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search mango, detox, cocktails…"
            placeholderTextColor="rgba(255,255,255,0.8)"
            style={{ flex: 1, color: "#fff", fontWeight: "800" }}
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
          <ScalePress
            onPress={() => router.push("/(shop)/categories")}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.22)",
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="grid-outline" size={17} color="#fff" />
                <TText style={{ color: "#fff", fontWeight: "950" }}>
                  Browse Categories
                </TText>
              </View>

              <TText
                style={{
                  color: "rgba(255,255,255,0.9)",
                  marginTop: 5,
                  fontWeight: "700",
                }}
              >
                {categories.length || 5} tasty vibes
              </TText>
            </View>
          </ScalePress>
        </View>
      </LinearGradient>

      {isLoading ? (
        <GlassCard
          style={{
            paddingVertical: 28,
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={actionText} />

          <TText style={{ marginTop: 10, color: mutedTextColor }}>
            Loading fresh juices...
          </TText>
        </GlassCard>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View>
              <TText style={{ fontSize: 20, fontWeight: "950", color: textColor }}>
                Categories
              </TText>

              <TText
                style={{
                  color: mutedTextColor,
                  marginTop: 3,
                  fontWeight: "700",
                }}
              >
                Choose your fresh direction.
              </TText>
            </View>

            <Pressable onPress={() => router.push("/(shop)/categories")} hitSlop={8}>
              <TText style={{ color: actionText, fontWeight: "950" }}>
                View all
              </TText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10, paddingBottom: 14 }}>
              {categories.map((c) => (
                <TChip
                  key={c.id}
                  label={c.title}
                  emoji={c.emoji}
                  onPress={() =>
                    router.push({
                      pathname: "/(shop)/categories",
                      params: { category: c.id },
                    })
                  }
                />
              ))}
            </View>
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              marginTop: 2,
            }}
          >
            <View>
              <TText style={{ fontSize: 20, fontWeight: "950", color: textColor }}>
                {showResults ? "Search Results" : "Featured Juices"}
              </TText>

              <TText
                style={{
                  color: mutedTextColor,
                  marginTop: 3,
                  fontWeight: "700",
                }}
              >
                {showResults
                  ? `${visibleProducts.length} match${
                      visibleProducts.length === 1 ? "" : "es"
                    } found`
                  : "Fresh picks rotate every 4 seconds."}
              </TText>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {visibleProducts.map((p) => (
              <ScalePress
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <GlassCard padding={0} radius={24} style={{ overflow: "hidden" }}>
                  <Image
                    source={{ uri: p.image || FALLBACK_IMAGE }}
                    style={{ height: 145, width: "100%" }}
                  />

                  <View style={{ padding: 14 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <TText
                          style={{
                            fontSize: 16,
                            fontWeight: "950",
                            color: textColor,
                          }}
                        >
                          {p.name}
                        </TText>

                        <TText
                          style={{
                            marginTop: 4,
                            color: mutedTextColor,
                            lineHeight: 20,
                          }}
                          numberOfLines={2}
                        >
                          {p.description}
                        </TText>
                      </View>

                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: 999,
                          backgroundColor: isDarkMode ? "#111827" : "#F8FAFC",
                          borderWidth: 1,
                          borderColor: softBorder,
                        }}
                      >
                        <TText style={{ color: textColor, fontWeight: "950" }}>
                          KES {getStartingPrice(p)}
                        </TText>
                      </View>
                    </View>

                    <View
                      style={{
                        marginTop: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <TChip label="Fresh pick" icon="sparkles" variant="success" />

                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 14,
                          backgroundColor: isDarkMode ? "#FFFFFF" : "#111827",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={isDarkMode ? "#111827" : "#FFFFFF"}
                        />

                        <TText
                          style={{
                            color: isDarkMode ? "#111827" : "#FFFFFF",
                            fontWeight: "950",
                          }}
                        >
                          View
                        </TText>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </ScalePress>
            ))}

            {!visibleProducts.length && (
              <GlassCard>
                <View style={{ alignItems: "center", paddingVertical: 18 }}>
                  <Ionicons
                    name="search-outline"
                    size={36}
                    color={mutedTextColor}
                  />

                  <TText
                    style={{
                      color: textColor,
                      fontWeight: "950",
                      fontSize: 17,
                      marginTop: 10,
                    }}
                  >
                    No products found
                  </TText>

                  <TText
                    style={{
                      color: mutedTextColor,
                      textAlign: "center",
                      marginTop: 5,
                      lineHeight: 20,
                    }}
                  >
                    Try searching another fruit, flavor, or category.
                  </TText>
                </View>
              </GlassCard>
            )}
          </View>
        </>
      )}
    </ScreenShell>
  );
}