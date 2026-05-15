import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../src/lib/supabase";

function getParamsFromUrl(url) {
  const params = {};
  const cleanUrl = url.replace("#", "?");
  const queryString = cleanUrl.split("?")[1];

  if (!queryString) return params;

  queryString.split("&").forEach((part) => {
    const [key, value] = part.split("=");

    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
    }
  });

  return params;
}

async function createRecoverySessionFromUrl(url) {
  const params = getParamsFromUrl(url);

  if (params.error || params.error_code) {
    throw new Error(params.error_description || params.error || params.error_code);
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });

    if (error) throw error;

    return data?.session ?? null;
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);

    if (error) throw error;

    return data?.session ?? null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data?.session ?? null;
}

export default function ResetPassword() {
  const router = useRouter();

  const [initializing, setInitializing] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function handleUrl(url) {
      if (!url) {
        if (mounted) {
          setInitializing(false);
        }
        return;
      }

      try {
        const session = await createRecoverySessionFromUrl(url);

        if (!mounted) return;

        setHasRecoverySession(Boolean(session));
      } catch (e) {
        Alert.alert("Reset link error", e?.message ?? "This reset link could not be opened.");
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    async function prepare() {
      const initialUrl = await Linking.getInitialURL();
      await handleUrl(initialUrl);
    }

    prepare();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function onUpdatePassword() {
    if (newPassword.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Confirm your new password correctly.");
      return;
    }

    try {
      setBusy(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert("Password updated", "You can now login with your new password.");
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert("Update failed", e?.message ?? "Could not update your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={["#0B1220", "#7C4DFF", "#00D1FF"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 18, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.replace("/(auth)/login")} style={{ alignSelf: "flex-start" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "950" }}>Back to login</Text>
            </View>
          </Pressable>

          <View style={{ height: 18 }} />

          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "950" }}>
            Reset password 🔐
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.90)", marginTop: 6 }}>
            Create a new password for your TundaDrop account.
          </Text>

          <View style={{ height: 18 }} />

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
            {initializing ? (
              <View style={{ paddingVertical: 24, alignItems: "center", gap: 12 }}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  Checking reset link...
                </Text>
              </View>
            ) : !hasRecoverySession ? (
              <View style={{ gap: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900", lineHeight: 21 }}>
                  This reset link could not be verified. Go back to login and request a new password reset link.
                </Text>

                <Pressable onPress={() => router.replace("/(auth)/login")}>
                  <LinearGradient
                    colors={["#111827", "#111827"]}
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
                      Back to login
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <>
                <Field
                  label="New password"
                  icon="lock-closed"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="min 6 characters"
                  secureTextEntry={!newPasswordVisible}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  rightIcon={newPasswordVisible ? "eye-off" : "eye"}
                  onRightIconPress={() => setNewPasswordVisible((v) => !v)}
                />

                <Field
                  label="Confirm password"
                  icon="shield-checkmark"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="repeat password"
                  secureTextEntry={!confirmPasswordVisible}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  rightIcon={confirmPasswordVisible ? "eye-off" : "eye"}
                  onRightIconPress={() => setConfirmPasswordVisible((v) => !v)}
                />

                <Pressable onPress={onUpdatePassword} disabled={busy}>
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
                      {busy ? "Updating..." : "Update password"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="key" size={18} color="#fff" />
                      <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </View>
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
          autoCorrect={false}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={{ flex: 1, color: "#fff", fontWeight: "800" }}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Ionicons name={rightIcon} size={20} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}