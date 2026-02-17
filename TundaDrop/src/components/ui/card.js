import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/useTheme"; // <-- adjust if needed

export default function Card({ children, style }) {
  const { t } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: t.radii.xl,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: t.colors.border,
          backgroundColor: t.colors.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
