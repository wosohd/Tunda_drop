import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Animated,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CATEGORIES, PRODUCTS } from "../src/constants/mockData";

import { useThemeTokens } from "../src/theme/useTheme";
import { QuickBar } from "../src/components/ui/QuickBar";

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

export default function Home() {
  const router = useRouter();
  const t = useThemeTokens();

  const [query, setQuery] = useState("");

  const featured = useMemo(() => PRODUCTS.slice(0, 6), []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    return PRODUCTS.filter((p) => {
      const hay = [p.name, p.description, ...(p.characteristics ?? [])]
        .map(normalize)
        .join(" ");
      return hay.includes(q);
    }).slice(0, 8);
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Hero (keep vibrant gradient) */}
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
                TundaDrop
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 2 }}>
                Fresh juices • fast delivery • good vibes
              </Text>
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
                }}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cart</Text>
              </View>
            </ScalePress>
          </View>

          {/* Search */}
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

          {/* Search results */}
          {showResults && (
            <View
              style={{
                marginTop: 10,
                borderRadius: 18,
                backgroundColor: "rgba(17,24,39,0.30)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
                overflow: "hidden",
              }}
            >
              {results.length === 0 ? (
                <View style={{ padding: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "900" }}>No matches</Text>
                  <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                    Try “mango”, “cocktail”, “pulpy”, “detox”.
                  </Text>
                </View>
              ) : (
                results.map((p, idx) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/(shop)/product/${p.id}`)}
                    style={{
                      padding: 12,
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: "rgba(255,255,255,0.12)",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 2 }}>
                        From KES {p.variants?.[0]?.price ?? "-"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                  </Pressable>
                ))
              )}
            </View>
          )}

          <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
            <ScalePress onPress={() => router.push("/(shop)/categories")}>
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
                  5 tasty vibes
                </Text>
              </View>
            </ScalePress>

            <ScalePress onPress={() => router.push("/(auth)/login")}>
              <View
                style={{
                  width: 120,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  padding: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "800", marginTop: 6 }}>
                  Login
                </Text>
              </View>
            </ScalePress>
          </View>
        </LinearGradient>

        {/* Category chips (theme-safe) */}
        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8, color: t.text }}>
          Categories
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10, paddingBottom: 12 }}>
            {CATEGORIES.map((c) => (
              <ScalePress key={c.id} onPress={() => router.push("/(shop)/categories")}>
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
                  <Text style={{ fontWeight: "800", color: t.text }}>{c.title}</Text>
                </View>
              </ScalePress>
            ))}
          </View>
        </ScrollView>

        {/* Featured header (theme-safe) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: t.text }}>
            Featured
          </Text>
          <Pressable onPress={() => router.push("/(shop)/categories")}>
            <Text style={{ fontWeight: "800", color: t.text }}>See all</Text>
          </Pressable>
        </View>

        {/* Featured cards (theme-safe) */}
        <View style={{ gap: 12 }}>
          {featured.map((p) => (
            <ScalePress key={p.id} onPress={() => router.push(`/(shop)/product/${p.id}`)}>
              <View
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  backgroundColor: t.card,
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                <Image source={{ uri: p.image }} style={{ height: 140, width: "100%" }} />
                <View style={{ padding: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: t.text }}>
                    {p.name}
                  </Text>
                  <Text style={{ marginTop: 4, color: t.mutedText }} numberOfLines={2}>
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
                      From KES {p.variants[0].price}
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
                      <Text style={{ color: "#fff", fontWeight: "900" }}>View</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScalePress>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Bottom-left horizontal bar with Theme + Logout */}
      <QuickBar />
    </View>
  );
}
