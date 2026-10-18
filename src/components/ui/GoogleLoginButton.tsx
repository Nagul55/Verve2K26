"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function GoogleLoginButton({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      // If client ID is present in NEXT_PUBLIC_GOOGLE_CLIENT_ID, use direct OAuth authorization
      if (googleClientId && !googleClientId.includes('your_client_id_here')) {
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
        const scope = encodeURIComponent('openid profile email');
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
        
        window.location.href = googleAuthUrl;
        return;
      }

      // Otherwise trigger Supabase Google OAuth
      const supabase = createClient();
      const { error: supaError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid profile email',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (supaError) {
        setErrorMsg(supaError.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg("Failed to initialize Google login.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-extrabold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm sm:text-base"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
        ) : (
          <>
            {/* Official Google 4-color SVG logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>
              {mode === 'sign-in' ? 'Sign in with Google' : 'Sign up with Google'}
            </span>
          </>
        )}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-600 font-bold mt-2 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
