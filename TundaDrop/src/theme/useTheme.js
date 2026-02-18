import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";
import { lightTokens, darkTokens } from "./tokens";

// ✅ returns FLAT tokens (QuickBar expects this)
export function useThemeTokens() {
  const system = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const resolved = mode === "system" ? (system || "light") : mode;
  return resolved === "dark" ? darkTokens : lightTokens;
}

// ✅ returns { t } where t matches screens expecting t.colors + t.space + t.radii
export function useTheme() {
  const base = useThemeTokens();

  const t = {
    ...base,
    colors: {
      bg: base.bg,
      text: base.text,
      muted: base.mutedText,
      card: base.card,
      border: base.border,
      soft: base.chipBg,
      borderSoft: base.chipBorder,
      darkButton: base.darkButton,
    },
    space: { sm: 8, md: 12, lg: 16, xl: 24 },
    radii: { lg: 18 },
  };

  return { t };
}
