import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const bg = useMemo(() => ["#00D1FF", "#7C4DFF", "#FF3D81"], []);

  async function onLogin() {
    if (email.trim().length < 3 || password.length < 6) {
      Alert.alert("Check details", "Enter a valid email and password (min 6 chars).");
      return;
    }
    try {
      setBusy(true);
      await login({ email, password });
      router.replace("/(shop)/categories");
    } catch (e) {
      Alert.alert("Login failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient
      colors={bg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingTop: 18 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <View
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.22)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.28)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "900" }}>TundaDrop</Text>
            </View>
          </Animated.View>

          <View style={{ height: 14 }} />

          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "950" }}>
            Welcome back 👋
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.92)", marginTop: 6 }}>
            Login to order fast, track deliveries, and save favorites.
          </Text>

          <View style={{ height: 14 }} />

          <View style={{ borderRadius: 22, overflow: "hidden", marginBottom: 14 }}>
            <Image
              source={{ uri: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif" }}
              style={{ width: "100%", height: 160 }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.35)"]}
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                Fresh • Fast • Futuristic
              </Text>
            </LinearGradient>
          </View>

          <View
            style={{
              borderRadius: 26,
              padding: 14,
              backgroundColor: "rgba(255,255,255,0.20)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.28)",
              gap: 10,
            }}
          >
            <Field
              label="Email"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              keyboardType="email-address"
            />
            <Field
              label="Password"
              icon="lock-closed"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Pressable onPress={() => {}}>
              <Text style={{ color: "#fff", fontWeight: "900", opacity: 0.92 }}>
                Forgot password? (later)
              </Text>
            </Pressable>

            <Pressable onPress={onLogin} disabled={busy}>
              <LinearGradient
                colors={busy ? ["#C7CBD6", "#C7CBD6"] : ["#111827", "#111827"]}
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
                  {busy ? "Signing in..." : "Login"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="lock-closed" size={18} color="#fff" />
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </Pressable>

            {/* ✅ NEW: Continue as guest */}
            <Pressable onPress={() => router.replace("/(shop)/categories")} disabled={busy}>
              <View
                style={{
                  borderRadius: 22,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.22)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 2,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
                  Continue as guest
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </Pressable>

            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                New here? Create an account →
              </Text>
            </Pressable>
          </View>

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
          borderColor: "rgba(255,255,255,0.30)",
          backgroundColor: "rgba(255,255,255,0.14)",
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
