import React from "react";
import { Text } from "react-native";
import { useThemeTokens } from "../../theme/useTheme";

export function TText({ children, style, muted, bold, center, ...props }) {
  const t = useThemeTokens();

  return (
    <Text
      {...props}
      style={[
        { color: muted ? t.mutedText : t.text },
        bold ? { fontWeight: "900" } : null,
        center ? { textAlign: "center" } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
