import { supabase } from "../supabase/client";

type OAuthProvider = 'google' | 'apple' | 'github';

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, _opts?: SignInOptions) => {
      try {
        await supabase.auth.setSession({
          access_token: 'google-oauth-demo-token',
        });
        return { redirected: false, error: null };
      } catch (e) {
        return { redirected: false, error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};
