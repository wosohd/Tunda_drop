import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getCategories, getProducts } from "../../src/lib/sanityQueries";
import { TText } from "../../src/components/ui/TText";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=60";

function ScalePress({ children, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
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

  const [active, setActive] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        const initialCategory =
          params?.category ||
          categoryResults?.[0]?.id ||
          null;

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <TText muted style={{ marginTop: 10 }}>
          Loading categories...
        </TText>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TText style={{ fontSize: 20, fontWeight: "900", marginBottom: 8 }}>
        Pick a vibe
      </TText>

      <TText muted style={{ marginBottom: 12 }}>
        Fresh blends, quick delivery. Tap a category to explore.
      </TText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10, paddingBottom: 12 }}>
          {categories.map((c) => {
            const isActive = c.id === active;
            return (
              <ScalePress key={c.id} onPress={() => setActive(c.id)}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: isActive ? "#111827" : "#F4F6FF",
                    borderWidth: 1,
                    borderColor: isActive ? "#111827" : "#E7EBFF",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TText style={{ fontSize: 16 }}>{c.emoji}</TText>

                  <TText
                    style={{
                      fontWeight: "900",
                      color: isActive ? "#fff" : undefined,
                    }}
                  >
                    {c.title}
                  </TText>
                </View>
              </ScalePress>
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
            <View
              style={{
                borderRadius: 22,
                overflow: "hidden",
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#EEF1FF",
              }}
            >
              <Image
                source={{ uri: p.image || FALLBACK_IMAGE }}
                style={{ height: 140, width: "100%" }}
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
                  <TText style={{ fontSize: 16, fontWeight: "900", flex: 1 }}>
                    {p.name}
                  </TText>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 14,
                      backgroundColor: "#111827",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                    <TText style={{ color: "#fff", fontWeight: "900" }}>
                      Open
                    </TText>
                  </View>
                </View>

                <TText muted style={{ marginTop: 6 }} numberOfLines={2}>
                  {p.description}
                </TText>

                <TText style={{ marginTop: 10, fontWeight: "900" }}>
                  From KES {getStartingPrice(p)}
                </TText>
              </View>
            </View>
          </ScalePress>
        ))}

        {!filtered.length && (
          <TText muted>No products found in this category yet.</TText>
        )}
      </View>
    </ScrollView>
  );
}
