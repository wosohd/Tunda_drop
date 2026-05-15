import React from "react";
import { View } from "react-native";
import { useThemeTokens } from "../../theme/useTheme";

export function GlassCard({
  children,
  style,
  padding = 14,
  radius = 22,
}) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  return (
    <View
      style={[
        {
          borderRadius: radius,
          padding,
          backgroundColor: isDarkMode
            ? "rgba(15,23,42,0.88)"
            : "rgba(255,255,255,0.86)",
          borderWidth: 1,
          borderColor: isDarkMode
            ? "rgba(148,163,184,0.24)"
            : "rgba(226,232,240,0.95)",
          shadowColor: "#000",
          shadowOpacity: isDarkMode ? 0.24 : 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default GlassCard;