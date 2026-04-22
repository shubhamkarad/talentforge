import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../client';

type AuthSnapshot = { user: User | null; session: Session | null; loading: boolean };

export function useAuth() {
  const [state, setState] = useState<AuthSnapshot>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ user: data.session?.user ?? null, session: data.session, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      opts?: { role?: 'employer' | 'candidate'; fullName?: string },
    ) => {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
      return supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            role: opts?.role ?? 'candidate',
            full_name: opts?.fullName,
          },
        },
      });
    },
    [],
  );

  const signIn = useCallback(
    (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    [],
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }, []);

  return { ...state, signUp, signIn, signOut, requestPasswordReset };
}

export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

export function useSession() {
  const { session, loading } = useAuth();
  return { session, loading };
}
