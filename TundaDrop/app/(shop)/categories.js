import React, { useMemo, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES, PRODUCTS } from "../../src/constants/mockData";
import { TText } from "../../src/components/ui/TText";

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

export default function Categories() {
  const router = useRouter();
  const [active, setActive] = useState(CATEGORIES[0].id);

  const filtered = useMemo(
    () => PRODUCTS.filter((p) => p.category === active),
    [active]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TText style={{ fontSize: 20, fontWeight: "900", marginBottom: 8 }}>
        Pick a vibe
      </TText>

      <TText muted style={{ marginBottom: 12 }}>
        Fresh blends, quick delivery. Tap a category to explore.
      </TText>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10, paddingBottom: 12 }}>
          {CATEGORIES.map((c) => {
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

      {/* Products */}
      <View style={{ gap: 12, paddingBottom: 24 }}>
        {filtered.map((p) => (
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
                  From KES {p.variants[0].price}
                </TText>
              </View>
            </View>
          </ScalePress>
        ))}
      </View>
    </ScrollView>
  );
}
