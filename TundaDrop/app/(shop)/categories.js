import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getCategories, getProducts } from "../../src/lib/sanityQueries";
import { TText } from "../../src/components/ui/TText";
import ScreenShell from "../../src/components/ui/ScreenShell";
import GlassCard from "../../src/components/ui/GlassCard";
import TChip from "../../src/components/ui/TChip";
import ScalePress from "../../src/components/ui/ScalePress";
import { useThemeTokens } from "../../src/theme/useTheme";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60";

function getStartingPrice(product) {
  const prices = (product?.variants ?? [])
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) return 0;

  return Math.min(...prices);
}

export default function Categories() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const t = useThemeTokens();

  const [active, setActive] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const productTitleColor = isDarkMode ? "#FFFFFF" : "#111827";
  const productPriceColor = isDarkMode ? "#FFFFFF" : "#111827";

  const openButtonBg = isDarkMode ? "#FFFFFF" : "#111827";
  const openButtonText = isDarkMode ? "#111827" : "#FFFFFF";

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);

        const [categoryResults, productResults] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!isMounted) return;

        setCategories(categoryResults ?? []);
        setProducts(productResults ?? []);

        const initialCategory = params?.category || categoryResults?.[0]?.id || null;

        setActive(initialCategory);
      } catch (error) {
        console.warn("Failed to load Sanity category data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [params?.category]);

  const filtered = useMemo(() => {
    if (!active) return [];
    return products.filter((p) => p.category === active);
  }, [active, products]);

  if (isLoading) {
    return (
      <ScreenShell scroll={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <TText muted style={{ marginTop: 10 }}>
            Loading categories...
          </TText>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell contentContainerStyle={{ paddingHorizontal: 0 }}>
      <TText style={{ fontSize: 22, fontWeight: "950", marginBottom: 8 }}>
        Pick a vibe
      </TText>

      <TText muted style={{ marginBottom: 14, lineHeight: 21 }}>
        Fresh blends, quick delivery. Tap a category to explore.
      </TText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10, paddingBottom: 14 }}>
          {categories.map((c) => {
            const isActive = c.id === active;

            return (
              <TChip
                key={c.id}
                label={c.title}
                emoji={c.emoji}
                active={isActive}
                onPress={() => setActive(c.id)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={{ gap: 12, paddingBottom: 24 }}>
        {filtered.map((p) => (
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
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <TText
                    style={{
                      fontSize: 16,
                      fontWeight: "950",
                      flex: 1,
                      color: productTitleColor,
                    }}
                  >
                    {p.name}
                  </TText>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 14,
                      backgroundColor: openButtonBg,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={openButtonText}
                    />

                    <TText
                      style={{
                        color: openButtonText,
                        fontWeight: "900",
                      }}
                    >
                      Open
                    </TText>
                  </View>
                </View>

                <TText muted style={{ marginTop: 6, lineHeight: 20 }} numberOfLines={2}>
                  {p.description}
                </TText>

                <TText
                  style={{
                    marginTop: 10,
                    fontWeight: "950",
                    color: productPriceColor,
                  }}
                >
                  From KES {getStartingPrice(p)}
                </TText>
              </View>
            </GlassCard>
          </ScalePress>
        ))}

        {!filtered.length && (
          <GlassCard>
            <TText muted>No products found in this category yet.</TText>
          </GlassCard>
        )}
      </View>
    </ScreenShell>
  );
}