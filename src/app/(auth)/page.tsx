"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { login } from "@/actions/auth.actions";
import { Eye, EyeOff, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const clientAction = async (formData: FormData) => {
    setErrorMsg('');
    const emailStr = formData.get('email') as string;
    const passwordStr = formData.get('password') as string;

    if (!emailStr?.trim() || !passwordStr?.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(formData);
      
      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      } else if (res?.success && res?.redirectTo) {
        window.location.href = res.redirectTo;
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-screen bg-white flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden font-sans select-none relative">
      
      {/* MOBILE & TABLET BACKGROUND AVATAR IMAGE */}
      <div className="lg:hidden absolute inset-0 z-0">
        <img
          src="/images/mobile-hero-bg.png"
          alt="Eventrix Mobile Hero Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-purple-900/35 to-black/70 backdrop-blur-[1px]"></div>
      </div>

      {/* LEFT SECTION - Form (55% Width on Desktop) */}
      <div className="w-full lg:w-[55%] min-h-screen lg:h-full p-4 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center z-10 relative">
        
        {/* Glassmorphic Card Container */}
        <div className="max-w-xl lg:max-w-lg w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-8 sm:p-10 md:p-12 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/70 lg:border-none transition-all">
          
          {/* Header Title with Logo Directly Beside "Welcome to" */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-none drop-shadow-sm">
                Welcome to
              </h1>
              <img
                src="/assets/Eventrix logo.svg"
                alt="Eventrix Logo"
                className="h-10 sm:h-14 lg:h-16 xl:h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image is missing
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-anton text-4xl text-eventrix-lavender tracking-widest hidden" id="fallback-logo">EVENTRIX</span>
            </div>
            <p className="text-gray-900 lg:text-gray-500 text-xs sm:text-sm font-bold mt-2.5">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error or Success Alerts */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {justRegistered && !errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50/95 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created successfully! Please log in.</span>
            </div>
          )}

          {/* Form Inputs */}
          <form action={clientAction} className="space-y-5">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-extrabold text-gray-900 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="imran110585@gmail.com"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-500 px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-sm font-bold transition-all shadow-sm"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-extrabold text-gray-900 block flex justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-500 px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-sm font-bold transition-all pr-12 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-eventrix-black text-white font-extrabold py-4 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm sm:text-base uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>

          </form>


          <div className="mt-6 text-center text-xs font-extrabold text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-violet-600 uppercase tracking-widest hover:text-violet-900 transition-colors">
              Create One
            </Link>
          </div>

          {/* Footer Metadata */}
          <div className="pt-8 text-xs text-gray-800 lg:text-gray-400 text-center sm:text-left font-extrabold">
            Eventrix Platform © 2026. All rights reserved.
          </div>
        </div>

      </div>

      {/* RIGHT SECTION - Avatar Image (45% Width on Desktop) */}
      <div className="hidden lg:block w-[45%] h-full relative overflow-hidden bg-[#7c3aed]">
        <img
          src="/images/mobile-hero-bg.png"
          alt="Eventrix Avatar Illustration"
          className="w-full h-full object-cover object-center transition-all duration-300"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-purple-900/10 pointer-events-none"></div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
