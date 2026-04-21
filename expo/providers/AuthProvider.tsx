import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { supabase, type ProfileRow } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = AuthSession.makeRedirectUri({
  scheme: "com.christianappempire.proverbs31",
  path: "auth-callback",
});

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.log("[auth] fetchProfile error", error.message);
    return null;
  }
  return data as ProfileRow | null;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log("[auth] state change", _event, !!s);
      setSession(s);
      qc.invalidateQueries({ queryKey: ["profile"] });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [qc]);

  const user: User | null = session?.user ?? null;

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      console.log("[auth] google sign in", redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== "web",
        },
      });
      if (error) throw error;
      if (Platform.OS === "web") return;
      if (!data?.url) throw new Error("Missing OAuth URL");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success" || !result.url) {
        throw new Error("cancelled");
      }
      const url = new URL(result.url);
      const hash = url.hash?.startsWith("#") ? url.hash.slice(1) : url.hash ?? "";
      const params = new URLSearchParams(hash.length ? hash : url.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (!access_token || !refresh_token) {
        const code = params.get("code");
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
          return;
        }
        throw new Error("No tokens returned");
      }
      const { error: setErr } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (setErr) throw setErr;
    },
    onError: (err: Error) => {
      if (err.message === "cancelled") return;
      console.log("[auth] google error", err.message);
      Alert.alert("Sign-in failed", err.message);
    },
  });

  const appleMutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS !== "ios") throw new Error("Apple sign-in is iOS only");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("No identity token");
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) throw error;
    },
    onError: (err: Error) => {
      const msg = err.message ?? "";
      if (msg.includes("canceled") || msg.includes("ERR_REQUEST_CANCELED")) return;
      console.log("[auth] apple error", msg);
      Alert.alert("Sign-in failed", msg);
    },
  });

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    profile: profileQuery.data ?? null,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle: () => googleMutation.mutateAsync(),
    signInWithApple: () => appleMutation.mutateAsync(),
    isSigningIn: googleMutation.isPending || appleMutation.isPending,
    signOut,
  };
});
