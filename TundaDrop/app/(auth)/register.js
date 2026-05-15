import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../../src/store/authStore";

const REMEMBER_ENABLED_KEY = "tundadrop_remember_enabled";
const REMEMBER_EMAIL_KEY = "tundadrop_remember_email";
const REMEMBER_PASSWORD_KEY = "tundadrop_remember_password";

const BG_IMAGES = [
  "https://images.pexels.com/photos/4955257/pexels-photo-4955257.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5146439/pexels-photo-5146439.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/8215121/pexels-photo-8215121.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

async function saveRememberedCredentials(email, password) {
  await SecureStore.setItemAsync(REMEMBER_ENABLED_KEY, "true");
  await SecureStore.setItemAsync(REMEMBER_EMAIL_KEY, email);
  await SecureStore.setItemAsync(REMEMBER_PASSWORD_KEY, password);
}

async function clearRememberedCredentials() {
  await SecureStore.deleteItemAsync(REMEMBER_ENABLED_KEY);
  await SecureStore.deleteItemAsync(REMEMBER_EMAIL_KEY);
  await SecureStore.deleteItemAsync(REMEMBER_PASSWORD_KEY);
}

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(false);

  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadRememberedEmail() {
      try {
        const remembered = await SecureStore.getItemAsync(REMEMBER_ENABLED_KEY);
        const savedEmail = await SecureStore.getItemAsync(REMEMBER_EMAIL_KEY);

        if (!mounted) return;

        if (remembered === "true") setRememberMe(true);
        if (savedEmail) setEmail(savedEmail);
      } catch (e) {
        // Continue normally if secure storage is unavailable.
      }
    }

    loadRememberedEmail();

    return () => {
      mounted = false;
    };
  }, []);

  const floatY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const bg = useMemo(() => ["#061018", "#102A2E", "#7C4DFF", "#00D1FF"], []);

  async function onCreate() {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.length < 3 || password.length < 6) {
      Alert.alert("Check details", "Use a valid email and password (min 6 chars).");
      return;
    }

    try {
      setBusy(true);
      const data = await register({ email: normalizedEmail, password });

      if (rememberMe) {
        await saveRememberedCredentials(normalizedEmail, password);
      } else {
        await clearRememberedCredentials();
      }

      Alert.alert(
        "Account created",
        data?.session
          ? "You’re in! Redirecting…"
          : "Check your email to confirm your account, then login."
      );

      router.replace(data?.session ? "/" : "/(auth)/login");
    } catch (e) {
      Alert.alert("Sign up failed", e?.message ?? "Try again.");
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
      <BackgroundDecor />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 18,
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={{ alignSelf: "flex-start" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.14)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.20)",
              }}
            >
              <Ionicons name="chevron-back" size={19} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "950" }}>Back</Text>
            </View>
          </Pressable>

          <View style={{ height: 18 }} />

          <Animated.View
            style={{
              transform: [{ translateY: floatY }],
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: "100%",
                borderRadius: 30,
                overflow: "hidden",
                backgroundColor: "rgba(5,10,18,0.48)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.20)",
                shadowColor: "#000",
                shadowOpacity: 0.28,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 14 },
                elevation: 8,
              }}
            >
              <Image
                source={require("../../assets/images/logo_dark.jpeg")}
                style={{ width: "100%", height: 150 }}
                resizeMode="cover"
              />

              <LinearGradient
                colors={["rgba(6,16,24,0.05)", "rgba(6,16,24,0.88)"]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  justifyContent: "flex-end",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.24)",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons name="sparkles" size={15} color="#B7F34B" />
                  <Text style={{ color: "#fff", fontWeight: "950", fontSize: 12 }}>
                    Join the fresh side
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          <Text
            style={{
              color: "#fff",
              fontSize: 31,
              lineHeight: 36,
              fontWeight: "950",
              letterSpacing: -0.7,
            }}
          >
            Create your account ✨
          </Text>

          <Text
            style={{
              color: "rgba(255,255,255,0.88)",
              marginTop: 8,
              fontSize: 15,
              lineHeight: 22,
              maxWidth: 340,
            }}
          >
            Sign up for faster checkout, order tracking, saved details, and future loyalty rewards.
          </Text>

          <View style={{ height: 18 }} />

          <Animated.View
            style={{
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
              position: "absolute",
              right: -42,
              top: 260,
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: "#B7F34B",
            }}
          />

          <View
            style={{
              borderRadius: 30,
              padding: 15,
              backgroundColor: "rgba(255,255,255,0.16)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.28)",
              gap: 12,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 14 },
              elevation: 8,
            }}
          >
            <View
              style={{
                padding: 12,
                borderRadius: 22,
                backgroundColor: "rgba(6,16,24,0.36)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.16)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
                  Fresh account setup
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    marginTop: 3,
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                >
                  One account for your juice orders.
                </Text>
              </View>

              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  backgroundColor: "rgba(183,243,75,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(183,243,75,0.35)",
                }}
              >
                <Ionicons name="person-add" size={21} color="#B7F34B" />
              </View>
            </View>

            <Field
              label="Email"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="name@email.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />

            <Field
              label="Password"
              icon="lock-closed"
              value={password}
              onChangeText={setPassword}
              placeholder="min 6 characters"
              secureTextEntry={!passwordVisible}
              textContentType="newPassword"
              autoComplete="new-password"
              rightIcon={passwordVisible ? "eye-off" : "eye"}
              onRightIconPress={() => setPasswordVisible((v) => !v)}
            />

            <RememberToggle value={rememberMe} onValueChange={setRememberMe} />

            <Pressable onPress={onCreate} disabled={busy}>
              <LinearGradient
                colors={busy ? ["#C7CBD6", "#C7CBD6"] : ["#FF3D81", "#7C4DFF"]}
                style={{
                  borderRadius: 24,
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
                  {busy ? "Creating..." : "Create account"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <Ionicons name="sparkles" size={16} color="#fff" />
                  <Ionicons name="chevron-forward" size={17} color="#fff" />
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.replace("/(auth)/login")} disabled={busy}>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Already have an account? Login →
              </Text>
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function BackgroundDecor() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: BG_IMAGES[0] }}
        blurRadius={18}
        style={{
          position: "absolute",
          top: -80,
          right: -120,
          width: 280,
          height: 280,
          borderRadius: 140,
          opacity: 0.34,
        }}
      />

      <Image
        source={{ uri: BG_IMAGES[1] }}
        blurRadius={22}
        style={{
          position: "absolute",
          bottom: 140,
          left: -130,
          width: 300,
          height: 300,
          borderRadius: 150,
          opacity: 0.28,
        }}
      />

      <Image
        source={{ uri: BG_IMAGES[2] }}
        blurRadius={20}
        style={{
          position: "absolute",
          bottom: -90,
          right: -110,
          width: 280,
          height: 280,
          borderRadius: 140,
          opacity: 0.26,
        }}
      />

      <LinearGradient
        colors={["rgba(6,16,24,0.20)", "rgba(6,16,24,0.60)", "rgba(6,16,24,0.78)"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  rightIcon,
  onRightIconPress,
  textContentType,
  autoComplete,
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: "#fff", fontWeight: "950", fontSize: 13 }}>
        {label}
      </Text>

      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.24)",
          backgroundColor: "rgba(6,16,24,0.34)",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 13,
          paddingVertical: 13,
        }}
      >
        <Ionicons name={icon} size={18} color="rgba(255,255,255,0.92)" />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.55)"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={{ flex: 1, color: "#fff", fontWeight: "850", fontSize: 15 }}
        />

        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Ionicons name={rightIcon} size={21} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function RememberToggle({ value, onValueChange }) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      hitSlop={8}
    >
      <View
        style={{
          width: 23,
          height: 23,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: value ? "#B7F34B" : "rgba(255,255,255,0.50)",
          backgroundColor: value ? "#B7F34B" : "rgba(255,255,255,0.10)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value ? <Ionicons name="checkmark" size={15} color="#061018" /> : null}
      </View>

      <Text style={{ color: "#fff", fontWeight: "900" }}>Remember me</Text>
    </Pressable>
  );
}