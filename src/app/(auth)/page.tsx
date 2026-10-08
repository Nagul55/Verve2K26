"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import { login } from "@/actions/auth.actions";
import { Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  useEffect(() => {
    if (justRegistered) {
      toast.success("Account created successfully! Please log in.");
    }
  }, [justRegistered]);

  const clientAction = async (formData: FormData) => {
    const emailStr = formData.get('email') as string;
    const passwordStr = formData.get('password') as string;

    if (!emailStr?.trim() || !passwordStr?.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(formData);
      
      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
      } else if (res?.success && res?.redirectTo) {
        toast.success("Login successful! Redirecting...");
        window.location.replace(res.redirectTo);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page w-full h-[100dvh] min-h-[100dvh] bg-white flex flex-col lg:flex-row overflow-hidden select-none relative">
      
      {/* MOBILE & TABLET BACKGROUND AVATAR IMAGE */}
      <div className="lg:hidden fixed inset-0 z-0">
        <Image
          src="/images/mobile-hero-bg.webp"
          alt="Eventrix Mobile Hero Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-purple-900/35 to-black/70 backdrop-blur-[1px]"></div>
      </div>

      {/* LEFT SECTION - Form (50% Width on Desktop) */}
      <div className="w-full lg:w-[50%] h-[100dvh] overflow-y-auto overflow-x-hidden z-10 relative custom-scrollbar">
        <div className="min-h-full w-full py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col">
          
          {/* Glassmorphic Card Container */}
          <div className="max-w-md lg:max-w-md w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/70 lg:border-none transition-all my-auto">
          
          {/* Header Title with Logo Directly Beside "Welcome to" */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-950 tracking-tight leading-none drop-shadow-sm">
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
            <p className="text-gray-900 lg:text-gray-500 text-xs sm:text-sm font-medium mt-2">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Form Inputs */}
          <form action={clientAction} className="space-y-4 sm:space-y-5">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium placeholder:font-normal transition-all shadow-sm"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 block flex justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium placeholder:font-normal transition-all pr-12 shadow-sm"
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
              className="w-full mt-3 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>

          </form>


          <div className="mt-5 text-center text-xs font-medium text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-violet-600 font-semibold uppercase tracking-widest hover:text-violet-900 transition-colors">
              Create One
            </Link>
          </div>

        </div>
      </div>
    </div>

      {/* RIGHT SECTION - Avatar Image (50% Width on Desktop) */}
      <div className="hidden lg:block w-[50%] h-[100dvh] fixed right-0 top-0 bottom-0 overflow-hidden bg-[#7c3aed] z-0">
        <Image
          src="/images/mobile-hero-bg.webp"
          alt="Eventrix Avatar Illustration"
          fill
          priority
          className="object-cover object-center transition-all duration-300"
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
