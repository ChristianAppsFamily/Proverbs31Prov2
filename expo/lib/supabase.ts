import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

const webStorage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null
      );
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    } catch {}
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } catch {}
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type CommentRow = {
  id: string;
  target_type: "verse" | "devotional";
  target_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user_profiles?: ProfileRow | null;
};
