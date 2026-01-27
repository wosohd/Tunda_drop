import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CATEGORIES, PRODUCTS } from "../src/constants/mockData";

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

export default function Home() {
  const router = useRouter();

  const featured = useMemo(() => PRODUCTS.slice(0, 6), []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Hero */}
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

        {/* Search (UI only for now) */}
        <View
          style={{
            marginTop: 14,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.22)",
            paddingHorizontal: 14,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.95)" />
          <Text style={{ color: "rgba(255,255,255,0.95)" }}>
            Search mango, detox, cocktails…
          </Text>
        </View>

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

      {/* Category chips */}
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
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
                  backgroundColor: "#F4F6FF",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: "#E7EBFF",
                }}
              >
                <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                <Text style={{ fontWeight: "800" }}>{c.title}</Text>
              </View>
            </ScalePress>
          ))}
        </View>
      </ScrollView>

      {/* Featured */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 6,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Featured</Text>
        <Pressable onPress={() => router.push("/(shop)/categories")}>
          <Text style={{ fontWeight: "800" }}>See all</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12, paddingBottom: 24 }}>
        {featured.map((p) => (
          <ScalePress
            key={p.id}
            onPress={() => router.push(`/(shop)/product/${p.id}`)}
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
                source={{ uri: p.image }}
                style={{ height: 140, width: "100%" }}
              />
              <View style={{ padding: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: "900" }}>{p.name}</Text>
                <Text style={{ marginTop: 4, color: "#444" }} numberOfLines={2}>
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
                  <Text style={{ fontWeight: "900" }}>
                    From KES {p.variants[0].price}
                  </Text>

                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 14,
                      backgroundColor: "#111827",
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
      </View>
    </ScrollView>
  );
}
