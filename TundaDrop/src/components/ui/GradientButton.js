import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import ScalePress from "./ScalePress";
import { TText } from "./TText";
import { useThemeTokens } from "../../theme/useTheme";

export default function GradientButton({
  title,
  subtitle,
  right,
  left,
  onPress,
  style,
  disabled = false,
  loading = false,
  colors,
  accessibilityLabel,
}) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const gradientColors =
    colors ??
    t.gradients?.primary ?? ["#00D1FF", "#7C4DFF", "#FF3D81"];

  const finalColors = disabled
    ? ["#94A3B8", "#64748B"]
    : gradientColors;

  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      accessibilityLabel={accessibilityLabel || title}
    >
      <LinearGradient
        colors={finalColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          paddingVertical: 15,
          paddingHorizontal: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOpacity: isDarkMode ? 0.28 : 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -45,
            right: -35,
            width: 110,
            height: 110,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.16)",
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -55,
            left: -45,
            width: 120,
            height: 120,
            borderRadius: 999,
            backgroundColor: "rgba(183,243,75,0.12)",
          }}
        />

        {left ? <View style={{ marginRight: 10 }}>{left}</View> : null}

        <View style={{ flex: 1, paddingRight: 12 }}>
          <TText style={{ color: "#fff", fontWeight: "950", fontSize: 16 }}>
            {loading ? "Please wait..." : title}
          </TText>

          {!!subtitle && (
            <TText
              style={{
                color: "rgba(255,255,255,0.94)",
                marginTop: 3,
                fontWeight: "700",
                lineHeight: 19,
              }}
            >
              {subtitle}
            </TText>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : right ? (
          <View style={{ marginLeft: 10 }}>{right}</View>
        ) : null}
      </LinearGradient>
    </ScalePress>
  );
}
