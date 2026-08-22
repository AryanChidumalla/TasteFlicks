import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase/client";
import { AuthContext } from "./authContextDef";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(session);
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || "",
              created_at: session.user.created_at,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error initializing auth session:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser({
          id: newSession.user.id,
          email: newSession.user.email,
          display_name: newSession.user.user_metadata?.display_name || "",
          created_at: newSession.user.created_at,
          avatar_url: newSession.user.user_metadata?.avatar_url || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
