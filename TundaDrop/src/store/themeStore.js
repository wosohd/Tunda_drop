import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "tundadrop_theme_mode_v1"; // "system" | "light" | "dark"

export const useThemeStore = create((set) => ({
  mode: "system",
  isHydrating: true,

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(KEY);
      set({ mode: saved || "system", isHydrating: false });
    } catch {
      set({ mode: "system", isHydrating: false });
    }
  },

  setMode: async (mode) => {
    set({ mode });
    await AsyncStorage.setItem(KEY, mode);
  },
}));
