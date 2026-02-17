import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";
import { lightTokens, darkTokens } from "./tokens";

export function useThemeTokens() {
  const system = useColorScheme(); // "light" | "dark"
  const mode = useThemeStore((s) => s.mode);

  const resolved = mode === "system" ? (system || "light") : mode;
  return resolved === "dark" ? darkTokens : lightTokens;
}
