"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signup } from "@/actions/auth.actions";
import { Eye, EyeOff, User, Mail, Phone, Building2, GraduationCap, Calendar, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useFormDraft } from '@/hooks/useFormDraft';
import { EventrixSelect } from '@/components/ui/EventrixSelect';
import { DepartmentSelect } from '@/components/ui/DepartmentSelect';
import { CollegeSelect } from '@/components/ui/CollegeSelect';

export default function SignupPage() {
  const { formData, setFormData, resetForm } = useFormDraft({
    key: "eventrix_signup_form_draft",
    initialValues: {
      fullName: '',
      email: '',
      gender: '',
      mobile: '',
      college: '',
      department: '',
      yearOfStudy: '1st Year',
      password: '',
      confirmPassword: '',
    },
    excludeKeys: ['password', 'confirmPassword'],
    showRestoredToast: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clientAction = async (fData: FormData) => {
    const fullNameStr = (fData.get('fullName') as string) || '';
    const mobileStr = (fData.get('mobile') as string) || '';
    const emailStr = (fData.get('email') as string) || '';
    const genderStr = (fData.get('gender') as string) || '';
    const collegeStr = (fData.get('college') as string) || '';
    const departmentStr = (fData.get('department') as string) || '';
    const yearOfStudyStr = (fData.get('yearOfStudy') as string) || '';
    const passwordStr = (fData.get('password') as string) || '';
    const confirmPasswordStr = (fData.get('confirmPassword') as string) || '';

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
      toast.error('All fields are required. Please fill in all fields to create your account.');
      return;
    }

    if (!genderStr.trim()) {
      toast.error('Please select your gender.');
      return;
    }

    if (mobileStr.length !== 10) {
      toast.error('10 digits required');
      return;
    }

    if (passwordStr !== confirmPasswordStr) {
      toast.error('Passwords do not match. Please ensure Password and Confirm Password are identical.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup(fData);
      
      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
      } else if (res?.success && res?.redirectTo) {
        toast.success("Account created successfully!");
        resetForm();
        window.location.href = res.redirectTo;
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred during sign up.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page w-full h-[100dvh] min-h-[100dvh] bg-white flex flex-col lg:flex-row overflow-hidden select-none relative">
      
      {/* MOBILE & TABLET BACKGROUND AVATAR IMAGE */}
      <div className="lg:hidden fixed inset-0 z-0">
        <img
          src="/images/mobile-hero-bg.webp"
          alt="Eventrix Mobile Hero Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-purple-900/35 to-black/70 backdrop-blur-[1px]"></div>
      </div>

      {/* LEFT SECTION - Form (50% Width on Desktop) */}
      <div className="w-full lg:w-[50%] h-[100dvh] min-h-[100dvh] py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col justify-center items-center z-10 relative overflow-hidden">
        
        {/* Glassmorphic Card Container */}
        <div className="max-w-xl lg:max-w-xl w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-4 sm:p-5 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-white/70 lg:border-none transition-all my-auto">
          
          {/* Header Title with Logo Directly Beside "Join" */}
          <div className="mb-2 sm:mb-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-950 tracking-tight leading-none drop-shadow-sm">
                Join
              </h1>
              <img
                src="/assets/Eventrix logo.svg"
                alt="Eventrix Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-anton text-2xl text-eventrix-lavender tracking-widest hidden" id="fallback-logo">EVENTRIX</span>
            </div>
            <p className="text-gray-900 lg:text-gray-500 text-[11px] sm:text-xs font-medium mt-1">
              Fill all required fields below to create your account.
            </p>
          </div>

          {/* Form Inputs */}
          <form action={clientAction} className="space-y-2 sm:space-y-2.5">
            
            {/* Grid 1: Full Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Full Name Input */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-gray-900 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your Full Name"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-xs font-medium placeholder:font-normal transition-all shadow-sm"
                  />
                  <User className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-gray-900 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    title="10 digits required"
                    onInvalid={(e) => e.currentTarget.setCustomValidity('10 digits required')}
                    onInput={(e) => e.currentTarget.setCustomValidity('')}
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="Your Phone Number"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-xs font-medium placeholder:font-normal transition-all shadow-sm"
                  />
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-0.5 sm:space-y-1">
              <label className="text-[11px] sm:text-xs font-semibold text-gray-900 block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-xs font-medium placeholder:font-normal transition-all shadow-sm"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Gender Select */}
            <EventrixSelect
              label="Gender"
              name="gender"
              required
              size="sm"
              placeholder="Select Gender"
              value={formData.gender}
              onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
              options={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
              ]}
            />

            {/* College Dropdown */}
            <CollegeSelect
              label="College / Institution Name"
              name="college"
              required
              size="sm"
              value={formData.college}
              onChange={(val) => setFormData(prev => ({ ...prev, college: val }))}
              placeholder="Select College / Institution"
            />

            {/* Grid 2: Department & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Department Dropdown */}
              <DepartmentSelect
                label="Department / Branch"
                name="department"
                required
                size="sm"
                value={formData.department}
                onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                placeholder="Select Department"
              />

              {/* Year of Study Dropdown */}
              <EventrixSelect
                label="Year of Study"
                name="yearOfStudy"
                required
                size="sm"
                value={formData.yearOfStudy}
                onChange={(val) => setFormData((prev) => ({ ...prev, yearOfStudy: val }))}
                options={[
                  { value: "1st Year", label: "1st Year" },
                  { value: "2nd Year", label: "2nd Year" },
                  { value: "3rd Year", label: "3rd Year" },
                  { value: "4th Year", label: "4th Year" },
                  { value: "PG / Other", label: "PG / Other" },
                ]}
              />
            </div>

            {/* Grid 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Password Input */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-gray-900 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-xs font-medium placeholder:font-normal transition-all pr-9 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-gray-900 block">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-white/90 text-gray-950 placeholder-gray-400 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/30 text-xs sm:text-xs font-medium placeholder:font-normal transition-all pr-9 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 sm:mt-2.5 bg-eventrix-black text-white font-bold py-2.5 sm:py-3 px-5 rounded-xl transition-all duration-200 shadow-[3px_3px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[3px_3px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span></>
              )}
            </button>

          </form>

          <div className="mt-2 sm:mt-2.5 text-center text-[11px] sm:text-xs font-medium text-gray-500">
            Already have an account?{' '}
            <Link href="/" className="text-violet-600 font-semibold uppercase tracking-widest hover:text-violet-900 transition-colors">
              Sign In
            </Link>
          </div>

        </div>

      </div>

      {/* RIGHT SECTION - Avatar Image (50% Width on Desktop) */}
      <div className="hidden lg:block w-[50%] h-[100dvh] fixed right-0 top-0 bottom-0 overflow-hidden bg-[#7c3aed] z-0">
        <img
          src="/images/mobile-hero-bg.webp"
          alt="Eventrix Avatar Illustration"
          className="w-full h-full object-cover object-center transition-all duration-300"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-purple-900/10 pointer-events-none"></div>
      </div>

    </div>
  );
}
