"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signup } from "@/actions/auth.actions";
import { Eye, EyeOff, User, Mail, AlertCircle, Phone, Building2, GraduationCap, Calendar, Lock } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clientAction = async (formData: FormData) => {
    setErrorMsg('');
    const fullNameStr = (formData.get('fullName') as string) || '';
    const mobileStr = (formData.get('mobile') as string) || '';
    const emailStr = (formData.get('email') as string) || '';
    const collegeStr = (formData.get('college') as string) || '';
    const departmentStr = (formData.get('department') as string) || '';
    const yearOfStudyStr = (formData.get('yearOfStudy') as string) || '';
    const passwordStr = (formData.get('password') as string) || '';
    const confirmPasswordStr = (formData.get('confirmPassword') as string) || '';

    if (
      !fullNameStr.trim() ||
      !mobileStr.trim() ||
      !emailStr.trim() ||
      !collegeStr.trim() ||
      !departmentStr.trim() ||
      !yearOfStudyStr.trim() ||
      !passwordStr.trim() ||
      !confirmPasswordStr.trim()
    ) {
      setErrorMsg('All fields are required. Please fill in all fields to create your account.');
      return;
    }

    if (passwordStr !== confirmPasswordStr) {
      setErrorMsg('Passwords do not match. Please ensure Password and Confirm Password are identical.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup(formData);
      
      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      } else if (res?.success && res?.redirectTo) {
        window.location.href = res.redirectTo;
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during sign up.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col lg:flex-row overflow-x-hidden font-sans select-none relative">
      
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
      <div className="w-full lg:w-[55%] min-h-screen py-8 p-4 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center z-10 relative overflow-y-auto">
        
        {/* Glassmorphic Card Container */}
        <div className="max-w-xl lg:max-w-xl w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-6 sm:p-8 md:p-10 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/70 lg:border-none transition-all">
          
          {/* Header Title with Logo Directly Beside "Join" */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-none drop-shadow-sm">
                Join
              </h1>
              <img
                src="/assets/Eventrix logo.svg"
                alt="Eventrix Logo"
                className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-anton text-3xl text-eventrix-lavender tracking-widest hidden" id="fallback-logo">EVENTRIX</span>
            </div>
            <p className="text-gray-900 lg:text-gray-500 text-xs sm:text-sm font-bold mt-2">
              Fill all required fields below to create your account.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn font-bold">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Inputs */}
          <form action={clientAction} className="space-y-4">
            
            {/* Grid 1: Full Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mohamed Imran"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-900 block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="imran110585@gmail.com"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* College Name */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-900 block">
                College / Institution Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="college"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. SRM Institute of Science and Technology"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
                />
                <Building2 className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid 2: Department & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Department Input */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Department / Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="department"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. B.Tech IT / CSE"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
                  />
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Year of Study Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="yearOfStudy"
                    required
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full bg-white text-gray-950 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="PG / Other">PG / Other</option>
                  </select>
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all pr-10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-900 block">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-sm font-bold transition-all pr-10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-eventrix-black text-white font-extrabold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span></>
              )}
            </button>

          </form>

          <div className="mt-5 text-center text-xs font-extrabold text-gray-500">
            Already have an account?{' '}
            <Link href="/" className="text-violet-600 uppercase tracking-widest hover:text-violet-900 transition-colors">
              Sign In
            </Link>
          </div>

          {/* Footer Metadata */}
          <div className="pt-6 text-xs text-gray-800 lg:text-gray-400 text-center sm:text-left font-extrabold">
            Eventrix Platform © 2026. All rights reserved.
          </div>
        </div>

      </div>

      {/* RIGHT SECTION - Avatar Image (45% Width on Desktop) */}
      <div className="hidden lg:block w-[45%] h-full min-h-screen relative overflow-hidden bg-[#7c3aed] fixed right-0 top-0 bottom-0">
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
