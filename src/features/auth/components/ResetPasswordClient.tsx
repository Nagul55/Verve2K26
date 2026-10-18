"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock, CheckCircle2, ShieldAlert, ArrowRight, Check, X } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordClient() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [authStatus, setAuthStatus] = useState<"CHECKING" | "AUTHORIZED" | "UNAUTHORIZED">("CHECKING");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate active recovery session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setAuthStatus("AUTHORIZED");
        } else {
          // If no code or hash present in URL, set unauthorized immediately
          const hasCodeOrHash = window.location.hash.includes("access_token") || window.location.search.includes("code");
          if (!hasCodeOrHash) {
            setAuthStatus("UNAUTHORIZED");
          }

          // Listen for auth state change in case of background session exchange
          const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
              setAuthStatus("AUTHORIZED");
            } else if (!session) {
              setAuthStatus("UNAUTHORIZED");
            }
          });

          // Timeout fallback
          setTimeout(() => {
            if (isMounted) {
              supabase.auth.getSession().then(({ data }) => {
                if (!data?.session?.user) {
                  setAuthStatus("UNAUTHORIZED");
                }
              });
            }
          }, 800);

          return () => {
            listener.subscription.unsubscribe();
          };
        }
      } catch (err) {
        if (isMounted) setAuthStatus("UNAUTHORIZED");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasNumberOrSpecial, password.length >= 10].filter(Boolean).length;
  const strengthLabels = ["Weak", "Fair", "Strong"];
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-emerald-500"];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setIsLoading(true);

    try {
      // Official Supabase Auth updateUser password reset
      const { data, error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(error.message || "Failed to update password. Your recovery session may have expired.");
        toast.error(error.message || "Password update failed.");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Sign out recovery session so user explicitly logs in with new password
        await supabase.auth.signOut();
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred while resetting your password.");
    } finally {
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

      {/* LEFT SECTION - Form Container (50% Width on Desktop) */}
      <div className="w-full lg:w-[50%] h-[100dvh] overflow-y-auto overflow-x-hidden z-10 relative custom-scrollbar">
        <div className="min-h-full w-full py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col">
          {/* Glassmorphic Card Container */}
          <div className="max-w-md lg:max-w-md w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/70 lg:border-none transition-all my-auto">
            {/* Header Title with Logo */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-950 tracking-tight leading-none drop-shadow-sm">
                  {isSuccess ? "Password Reset" : "Set New Password"}
                </h1>
                <img
                  src="/assets/Eventrix logo.svg"
                  alt="Eventrix Logo"
                  className="h-9 sm:h-12 lg:h-14 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <p className="text-gray-900 lg:text-gray-500 text-xs sm:text-sm font-medium mt-2">
                {isSuccess
                  ? "Your credentials have been securely updated."
                  : "Please enter and confirm your new password below."}
              </p>
            </div>

            {/* CHECKING AUTH STATE */}
            {authStatus === "CHECKING" && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-8 h-8 border-3 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Verifying recovery authorization...
                </p>
              </div>
            )}

            {/* UNAUTHORIZED / SESSION EXPIRED STATE */}
            {authStatus === "UNAUTHORIZED" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Recovery Session Required
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    You do not have an active recovery session. For security purposes, you must verify your email with a one-time code before resetting your password.
                  </p>
                </div>

                <Link
                  href="/forgot-password"
                  className="w-full mt-3 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  <span>Request Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center pt-2">
                  <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 font-medium">
                    Return to Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {authStatus === "AUTHORIZED" && isSuccess && (
              <div className="space-y-5 animate-in fade-in duration-300 text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-950">Password Updated Successfully</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    You can now sign in to your Eventrix account using your new password.
                  </p>
                </div>

                <Link
                  href="/"
                  className="w-full mt-4 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* RESET PASSWORD FORM */}
            {authStatus === "AUTHORIZED" && !isSuccess && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-xs sm:text-sm font-semibold text-gray-900 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••"
                      className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium transition-all pr-12 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex justify-between items-center text-[11px] text-gray-500">
                      <span>Password strength:</span>
                      <span className="font-semibold text-gray-800">
                        {strengthLabels[strengthScore - 1] || "Weak"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          strengthColors[strengthScore - 1] || "bg-red-500"
                        }`}
                        style={{ width: `${(strengthScore / 3) * 100}%` }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] text-gray-500 pt-1">
                      <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600" : ""}`}>
                        {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        At least 8 characters
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasNumberOrSpecial ? "text-emerald-600" : ""}`}>
                        {hasNumberOrSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Includes a number or special character
                      </span>
                    </div>
                  </div>
                )}

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-xs sm:text-sm font-semibold text-gray-900 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••"
                      className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium transition-all pr-12 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[11px] text-red-500 pt-0.5">Passwords do not match.</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !hasMinLength || !passwordsMatch}
                  className="w-full mt-3 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            {!isSuccess && authStatus === "AUTHORIZED" && (
              <div className="mt-5 text-center text-xs font-medium text-gray-500">
                <Link
                  href="/"
                  className="text-violet-600 font-semibold uppercase tracking-wider hover:text-violet-900 transition-colors"
                >
                  Cancel and Sign In
                </Link>
              </div>
            )}
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
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-purple-900/10 pointer-events-none"></div>
      </div>
    </div>
  );
}
