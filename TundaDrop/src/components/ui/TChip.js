import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "./TText";
import { useThemeTokens } from "../../theme/useTheme";

export function TChip({
  label,
  icon,
  emoji,
  active = false,
  onPress,
  variant = "default",
  style,
  textStyle,
}) {
  const t = useThemeTokens();

  const isDarkMode = ["#fff", "#ffffff", "white"].includes(
    String(t.text || "").toLowerCase()
  );

  const activeBg = isDarkMode ? "#FFFFFF" : "#111827";
  const activeText = isDarkMode ? "#111827" : "#FFFFFF";
  const activeBorder = isDarkMode ? "#FFFFFF" : "#111827";

  const defaultBg = isDarkMode ? "#111827" : "#F4F6FF";
  const defaultText = isDarkMode ? "#FFFFFF" : "#111827";
  const defaultBorder = isDarkMode ? "#334155" : "#E7EBFF";

  const successBg = isDarkMode ? "#14532D" : "#DCFCE7";
  const successText = isDarkMode ? "#DCFCE7" : "#166534";
  const successBorder = isDarkMode ? "#22C55E" : "#16A34A";

  const warningBg = isDarkMode ? "#422006" : "#FEF3C7";
  const warningText = isDarkMode ? "#FDE68A" : "#92400E";
  const warningBorder = isDarkMode ? "#F59E0B" : "#F59E0B";

  let bg = active ? activeBg : defaultBg;
  let color = active ? activeText : defaultText;
  let border = active ? activeBorder : defaultBorder;

  if (variant === "success") {
    bg = successBg;
    color = successText;
    border = successBorder;
  }

  if (variant === "warning") {
    bg = warningBg;
    color = warningText;
    border = warningBorder;
  }

  const content = (
    <View
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
        },
        style,
      ]}
    >
      {emoji ? <TText style={{ fontSize: 16 }}>{emoji}</TText> : null}

      {icon ? <Ionicons name={icon} size={16} color={color} /> : null}

      <TText
        style={[
          {
            color,
            fontWeight: "900",
            fontSize: 13,
          },
          textStyle,
        ]}
      >
        {label}
      </TText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default TChip;