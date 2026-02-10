import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  async function onCreate() {
    if (email.trim().length < 3 || password.length < 6) {
      Alert.alert("Check details", "Use a valid email and password (min 6 chars).");
      return;
    }

    try {
      setBusy(true);
      const data = await register({ email, password });

      // If email confirmation is ON, user may need to confirm before session exists.
      Alert.alert(
        "Account created",
        data?.session
          ? "You’re in! Redirecting…"
          : "Check your email to confirm your account, then login."
      );

      router.replace(data?.session ? "/(shop)/categories" : "/(auth)/login");
    } catch (e) {
      Alert.alert("Sign up failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={["#0B1220", "#7C4DFF", "#00D1FF"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 18 }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={{ alignSelf: "flex-start" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "950" }}>Back</Text>
            </View>
          </Pressable>

          <View style={{ height: 14 }} />

          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "950" }}>Create your account ✨</Text>
          <Text style={{ color: "rgba(255,255,255,0.90)", marginTop: 6 }}>
            Get faster checkout, order tracking, and future loyalty rewards.
          </Text>

          <View style={{ height: 14 }} />

          <Animated.View style={{ transform: [{ scale: glowScale }] }}>
            <View
              style={{
                borderRadius: 26,
                padding: 14,
                backgroundColor: "rgba(255,255,255,0.16)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.24)",
                gap: 10,
              }}
            >
              <Field label="Email" icon="mail" value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" />
              <Field label="Password" icon="lock-closed" value={password} onChangeText={setPassword} placeholder="min 6 characters" secureTextEntry />

              <View
                style={{
                  borderRadius: 18,
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>🔥 Early adopter perks (later)</Text>
                <Text style={{ color: "rgba(255,255,255,0.88)", marginTop: 4 }}>
                  Discounts, priority delivery, and seasonal drops.
                </Text>
              </View>

              <Pressable onPress={onCreate} disabled={busy}>
                <LinearGradient
                  colors={busy ? ["#C7CBD6", "#C7CBD6"] : ["#FF3D81", "#7C4DFF"]}
                  style={{
                    borderRadius: 22,
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
                    {busy ? "Creating..." : "Create account"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text style={{ color: "#fff", fontWeight: "900", textAlign: "center", marginTop: 4 }}>
                  Already have an account? Login →
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#fff", fontWeight: "950" }}>{label}</Text>
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.26)",
          backgroundColor: "rgba(255,255,255,0.12)",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        <Ionicons name={icon} size={18} color="#fff" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.75)"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          style={{ flex: 1, color: "#fff", fontWeight: "800" }}
        />
      </View>
    </View>
  );
}
