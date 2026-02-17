import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ScalePress from "./ScalePress";
import { useTheme } from "../../theme/useTheme"; // <-- adjust if needed

export default function GradientButton({
  title,
  subtitle,
  right,
  onPress,
  style,
  disabled,
}) {
  const { t } = useTheme();

  const grad = t.gradients?.primary ?? ["#00D1FF", "#7C4DFF", "#FF3D81"];

  return (
    <ScalePress onPress={onPress} disabled={disabled} style={style}>
      <LinearGradient
        colors={grad}
        style={{
          borderRadius: t.radii.xl,
          paddingVertical: t.space.md,
          paddingHorizontal: t.space.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <View style={{ flex: 1, paddingRight: t.space.sm }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>{title}</Text>
          {!!subtitle && (
            <Text style={{ color: "rgba(255,255,255,0.95)", marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>

        {right}
      </LinearGradient>
    </ScalePress>
  );
}
