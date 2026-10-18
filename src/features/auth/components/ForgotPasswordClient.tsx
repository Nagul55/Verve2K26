"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { requestPasswordRecoveryResend } from "@/actions/auth.actions";

type RecoveryStep = "REQUEST" | "VERIFY" | "NEW_PASSWORD" | "SUCCESS";

const MAX_VERIFY_ATTEMPTS = 5;

export function ForgotPasswordClient() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [step, setStep] = useState<RecoveryStep>("REQUEST");
  const [email, setEmail] = useState("");
  const [expectedOtpLength, setExpectedOtpLength] = useState<number>(8);
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // New password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // References to input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle email submission to request recovery code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Direct Resend recovery code dispatch via Next.js Server Action
      const res = await requestPasswordRecoveryResend(cleanEmail);

      if (res.error) {
        setErrorMessage(res.error);
        toast.error(res.error);
        setIsLoading(false);
        return;
      }

      const codeLen = res.otpLength || 8;
      setExpectedOtpLength(codeLen);
      setOtp(Array(codeLen).fill(""));
      setStep("VERIFY");
      setCooldown(60);
      setFailedAttempts(0);
      toast.success("Verification code sent via Resend. Check your inbox.");

      // Auto-focus the first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];
    const lastChar = cleaned.slice(-1);
    newOtp[index] = lastChar;
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (lastChar && index < expectedOtpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for navigation & backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < expectedOtpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, expectedOtpLength);
    if (!pasteData) return;

    const newOtp = Array(expectedOtpLength).fill("");
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    setErrorMessage(null);

    const focusIndex = Math.min(pasteData.length, expectedOtpLength - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle verifying OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (failedAttempts >= MAX_VERIFY_ATTEMPTS) {
      setErrorMessage("Maximum verification attempts exceeded. Please request a new code.");
      return;
    }

    const code = otp.join("");
    if (code.length !== expectedOtpLength) {
      setErrorMessage(`Please enter all ${expectedOtpLength} digits of the verification code.`);
      return;
    }

    setIsVerifying(true);

    try {
      // Official Supabase Auth verifyOtp recovery flow
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: "recovery",
      });

      if (error) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
          setErrorMessage("Maximum verification attempts exceeded. Please request a new code.");
        } else {
          setErrorMessage(
            `Invalid or expired verification code (${MAX_VERIFY_ATTEMPTS - nextAttempts} attempts remaining).`
          );
        }
        toast.error("Verification failed. Please check the code.");
        setIsVerifying(false);
        return;
      }

      // Check session
      let activeSession = data?.session;
      if (!activeSession) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeSession = sessionData?.session || null;
      }

      if (activeSession) {
        toast.success("Code verified! Set your new password.");
        setStep("NEW_PASSWORD");
      } else {
        setErrorMessage("Failed to establish recovery session. Please request a new code.");
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resending code
  const handleResendCode = async () => {
    if (cooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordRecoveryResend(email.trim().toLowerCase());

      if (res.error) {
        setErrorMessage(res.error);
        toast.error(res.error);
        setIsLoading(false);
        return;
      }

      const codeLen = res.otpLength || expectedOtpLength || 8;
      setExpectedOtpLength(codeLen);
      setOtp(Array(codeLen).fill(""));
      toast.success("A fresh verification code has been sent.");
      setCooldown(60);
      setFailedAttempts(0);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const strengthScore = [hasMinLength, hasNumberOrSpecial, newPassword.length >= 10].filter(Boolean).length;
  const strengthLabels = ["Weak", "Fair", "Strong"];
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-emerald-500"];

  // Handle updating password
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

    setIsUpdatingPassword(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (error) {
        setErrorMessage(error.message || "Failed to update password. Your recovery session may have expired.");
        toast.error(error.message || "Password update failed.");
        setIsUpdatingPassword(false);
        return;
      }

      if (data?.user) {
        // Sign out recovery session so user logs in fresh with new credentials
        await supabase.auth.signOut();
        setStep("SUCCESS");
        toast.success("Password updated successfully!");
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred while resetting your password.");
    } finally {
      setIsUpdatingPassword(false);
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
                  {step === "REQUEST" && "Reset Password"}
                  {step === "VERIFY" && "Enter OTP Code"}
                  {step === "NEW_PASSWORD" && "Set New Password"}
                  {step === "SUCCESS" && "Password Reset"}
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
                {step === "REQUEST" && "Enter your registered email address to receive a verification code."}
                {step === "VERIFY" && `Enter the ${expectedOtpLength}-digit verification code sent to ${email}.`}
                {step === "NEW_PASSWORD" && "Choose a strong new password for your account."}
                {step === "SUCCESS" && "Your credentials have been securely updated."}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: REQUEST CODE FORM */}
            {step === "REQUEST" && (
              <form onSubmit={handleRequestCode} className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="recovery-email" className="text-xs sm:text-sm font-semibold text-gray-900 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="recovery-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="john.doe@example.com"
                      className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium transition-all shadow-sm"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP FORM */}
            {step === "VERIFY" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-semibold text-gray-900 block">
                      {expectedOtpLength}-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("REQUEST");
                        setOtp(Array(expectedOtpLength).fill(""));
                        setErrorMessage(null);
                      }}
                      className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        id={`otp-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        aria-label={`Digit ${idx + 1} of ${expectedOtpLength}`}
                        disabled={failedAttempts >= MAX_VERIFY_ATTEMPTS}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-9 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-bold text-gray-950 bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 shadow-sm transition-all disabled:opacity-50"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Section */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || isLoading}
                    onClick={handleResendCode}
                    className="text-violet-600 hover:text-violet-900 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isVerifying || otp.join("").length !== expectedOtpLength || failedAttempts >= MAX_VERIFY_ATTEMPTS}
                  className="w-full mt-2 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>

                <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-violet-950 text-[11px] sm:text-xs">
                  <p>
                    <span className="font-semibold">Note:</span> If your email contains a direct recovery link, clicking the link in your email will open the reset page directly.
                  </p>
                </div>
              </form>
            )}

            {/* STEP 3: SET NEW PASSWORD FORM */}
            {step === "NEW_PASSWORD" && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-new-password" className="text-xs sm:text-sm font-semibold text-gray-900 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="modal-new-password"
                      type={showNewPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••"
                      className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-medium transition-all pr-12 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="modal-confirm-password" className="text-xs sm:text-sm font-semibold text-gray-900 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="modal-confirm-password"
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

                <button
                  type="submit"
                  disabled={isUpdatingPassword || !hasMinLength || !passwordsMatch}
                  className="w-full mt-3 bg-eventrix-black text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  {isUpdatingPassword ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS STATE */}
            {step === "SUCCESS" && (
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

            {/* Back to Login Link */}
            {step !== "SUCCESS" && (
              <div className="mt-6 text-center text-xs font-medium text-gray-500">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-violet-600 font-semibold uppercase tracking-wider hover:text-violet-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
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
