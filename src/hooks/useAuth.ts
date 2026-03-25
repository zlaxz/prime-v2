import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

async function saveGoogleTokens(session: Session) {
  const userId = session.user?.id;
  // Try session first, fall back to sessionStorage (captured in main.tsx)
  const providerToken = session.provider_token || sessionStorage.getItem("prime_provider_token");
  const refreshToken = session.provider_refresh_token || sessionStorage.getItem("prime_provider_refresh_token");

  if (!userId || !providerToken) return;

  // Clear sessionStorage after use
  sessionStorage.removeItem("prime_provider_token");
  sessionStorage.removeItem("prime_provider_refresh_token");

  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  const { error } = await supabase.from("google_tokens").upsert(
    {
      user_id: userId,
      access_token: providerToken,
      refresh_token: refreshToken ?? null,
      token_expires_at: expiresAt,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save Google tokens:", error);
  } else {
    console.log("Google tokens saved for", session.user?.email);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenSaved = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("[Prime Auth] getSession:", { user: session?.user?.email, error: error?.message, hasProviderToken: !!session?.provider_token });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Save tokens from initial session (after OAuth redirect)
      if (session?.provider_token && !tokenSaved.current) {
        tokenSaved.current = true;
        saveGoogleTokens(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[Prime Auth] onAuthStateChange:", { event: _event, user: session?.user?.email, hasProviderToken: !!session?.provider_token });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Also try on auth state changes
      if (session?.provider_token && !tokenSaved.current) {
        tokenSaved.current = true;
        saveGoogleTokens(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        scopes: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar.readonly",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    tokenSaved.current = false;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, session, loading, signIn, signUp, signInWithGoogle, signOut };
}
