import { create } from "zustand";
import { supabase } from "../lib/supabase";

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? "",
  };
}

export const useAuthStore = create((set, get) => ({
  isHydrating: true,
  user: null,

  hydrate: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      set({ user: mapUser(data?.session?.user), isHydrating: false });

      // Keep store in sync when session changes (login/logout/token refresh)
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: mapUser(session?.user) });
      });
    } catch (e) {
      set({ user: null, isHydrating: false });
    }
  },

  // Email + password sign up
  register: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw error;

    // If email confirmation is ON, session may be null until confirmed.
    // We still store user for UI purposes.
    set({ user: mapUser(data?.user ?? data?.session?.user ?? null) });
    return data;
  },

  // Email + password login
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;

    set({ user: mapUser(data?.user ?? data?.session?.user ?? null) });
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  isAuthed: () => !!get().user,
}));
