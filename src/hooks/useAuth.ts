import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Auto-save Google tokens on sign-in
      if (_event === "SIGNED_IN" && session?.provider_token) {
        const email = session.user?.email;
        const userId = session.user?.id;
        if (email && userId) {
          // Save email account
          await supabase.from("email_accounts").upsert(
            {
              user_id: userId,
              email_address: email,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token ?? null,
              enabled: true,
            },
            { onConflict: "user_id,email_address" }
          );
          // Save calendar account
          await supabase.from("calendar_accounts").upsert(
            {
              user_id: userId,
              email_address: email,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token ?? null,
              enabled: true,
            },
            { onConflict: "user_id,email_address" }
          );
        }
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, session, loading, signIn, signUp, signInWithGoogle, signOut };
}
