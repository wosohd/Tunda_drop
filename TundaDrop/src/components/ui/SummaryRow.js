import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../theme/useTheme"; // <-- adjust if needed

export default function SummaryRow({ label, value, strong }) {
  const { t } = useTheme();

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text
        style={{
          color: strong ? t.colors.text : t.colors.muted,
          fontWeight: strong ? "900" : "700",
        }}
      >
        {label}
      </Text>

      <Text style={{ color: t.colors.text, fontWeight: strong ? "900" : "800" }}>
        {value}
      </Text>
    </View>
  );
}
