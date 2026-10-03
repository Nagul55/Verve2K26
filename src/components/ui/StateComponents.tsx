"use client";

import React from "react";
import { 
  FolderOpen, 
  AlertTriangle, 
  WifiOff, 
  SearchX, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft, 
  LogIn, 
  X,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CubeLoader } from "./CubeLoader";

export { CubeLoader };

// 1. EMPTY STATE
export function EmptyState({ 
  title = "Nothing Here Yet", 
  description = "No records or activities have been added to this section yet.",
  actionText = "Create New Item",
  onAction
}: { 
  title?: string; 
  description?: string; 
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-[#D9D9DF] rounded-xl shadow-sm my-4 transition-all duration-300">
      <div className="relative mb-5 group">
        <div className="absolute inset-0 bg-eventrix-lavender/30 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 bg-[#F8F8FC] border border-[#D9D9DF] rounded-2xl flex items-center justify-center text-eventrix-black shadow-inner group-hover:scale-105 transition-transform duration-300">
          <FolderOpen className="w-10 h-10 text-eventrix-lavender animate-bounce" />
        </div>
      </div>
      <h3 className="font-anton text-2xl text-eventrix-black uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-eventrix-muted text-sm font-medium max-w-md mb-6">
        {description}
      </p>
      {onAction && (
        <button 
          onClick={onAction}
          className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// 2. LOADING STATE (Using 3D Isometric Endless Cube Loader)
export function LoadingState({ 
  message = "Loading Eventrix Data...",
  variant = "brand"
}: { 
  message?: string;
  variant?: "brand" | "monochrome";
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#D9D9DF] rounded-xl shadow-sm my-4 space-y-6">
      <CubeLoader size="md" variant={variant} text="" />
      
      <div className="text-center space-y-2 max-w-sm w-full">
        <p className="font-anton text-sm tracking-widest text-eventrix-black uppercase animate-pulse">
          {message}
        </p>
        <div className="space-y-2 pt-2">
          <div className="h-2.5 bg-[#E5E5EB] rounded-full w-3/4 mx-auto animate-pulse"></div>
          <div className="h-2 bg-[#F0F0F5] rounded-full w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// 2B. RELOADING STATE (Endless Cube Loader for Reloads & Refreshing)
export function ReloadingState({
  message = "Reloading Data...",
  onReload
}: {
  message?: string;
  onReload?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-[#080A12] text-white border border-[#1F2438] rounded-xl shadow-2xl my-4 space-y-6">
      <CubeLoader size="lg" variant="brand" text="" />
      
      <div className="text-center space-y-2 max-w-sm w-full">
        <h4 className="font-anton text-xl tracking-wide uppercase text-white">
          {message}
        </h4>
        <p className="text-slate-400 text-xs font-medium">
          Synchronizing latest changes from Eventrix server...
        </p>
      </div>

      {onReload && (
        <button 
          onClick={onReload}
          className="bg-eventrix-lavender text-eventrix-black px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[3px_3px_0px_0px_#FFFFFF] hover:bg-white active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Force Reload
        </button>
      )}
    </div>
  );
}

// 3. ERROR STATE
export function ErrorState({ 
  title = "Something Went Wrong", 
  description = "An unexpected error occurred while communicating with the server.",
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50/50 border border-red-200 rounded-xl shadow-sm my-4">
      <div className="w-16 h-16 bg-red-100 border border-red-200 rounded-full flex items-center justify-center text-red-600 mb-4 shadow-sm animate-bounce">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="font-anton text-2xl text-red-950 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-red-700 text-sm font-medium max-w-md mb-6">
        {description}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#991B1B] hover:bg-red-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry Request
        </button>
      )}
    </div>
  );
}

// 4. NO INTERNET STATE
export function NoInternetState({ 
  onRetry 
}: { 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-white border border-slate-800 rounded-xl shadow-xl my-4">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-ping"></div>
        <div className="relative w-20 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
          <WifiOff className="w-10 h-10 animate-pulse" />
        </div>
      </div>
      <h3 className="font-anton text-2xl text-white uppercase tracking-wide mb-2">
        No Internet Connection
      </h3>
      <p className="text-slate-400 text-sm font-medium max-w-md mb-6">
        Your device is currently offline. Please check your Wi-Fi or mobile network and try again.
      </p>
      <button 
        onClick={onRetry || (() => window.location.reload())}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-purple-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" /> Check Connection
      </button>
    </div>
  );
}

// 5. SLOW NETWORK STATE (Featuring Isometric Cube Loader + Progress Indicator)
export function SlowNetworkState({ 
  onCancel 
}: { 
  onCancel?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-amber-50/60 border border-amber-200 rounded-xl shadow-sm my-4">
      <CubeLoader size="md" variant="monochrome" text="" />
      
      <h3 className="font-anton text-2xl text-amber-950 uppercase tracking-wide mt-4 mb-2">
        Taking Longer Than Expected...
      </h3>
      <p className="text-amber-800 text-sm font-medium max-w-md mb-5">
        High network latency detected. The isometric engine is still attempting to fetch your data.
      </p>
      
      <div className="w-full max-w-xs bg-amber-200/60 rounded-full h-2 overflow-hidden mb-6">
        <div className="bg-amber-600 h-full w-2/3 rounded-full animate-pulse"></div>
      </div>

      {onCancel && (
        <button 
          onClick={onCancel}
          className="text-amber-900 border border-amber-300 hover:bg-amber-100 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Cancel Request
        </button>
      )}
    </div>
  );
}

// 6. NO SEARCH RESULT STATE
export function NoSearchResultState({ 
  query = "", 
  onClear 
}: { 
  query?: string; 
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-[#D9D9DF] rounded-xl shadow-sm my-4">
      <div className="w-18 h-18 bg-[#F8F8FC] border border-[#D9D9DF] rounded-full flex items-center justify-center text-eventrix-muted mb-4 shadow-inner">
        <SearchX className="w-9 h-9 text-eventrix-lavender" />
      </div>
      <h3 className="font-anton text-2xl text-eventrix-black uppercase tracking-wide mb-2">
        No Matching Results
      </h3>
      <p className="text-eventrix-muted text-sm font-medium max-w-md mb-6">
        {query ? <>We couldn&apos;t find any matches for &quot;<span className="text-eventrix-black font-bold">{query}</span>&quot;. Try refining your search terms.</> : "No results match your current search or filter criteria."}
      </p>
      {onClear && (
        <button 
          onClick={onClear}
          className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
        >
          <X className="w-4 h-4" /> Clear Search Filter
        </button>
      )}
    </div>
  );
}

// 7. PERMISSION DENIED STATE
export function PermissionDeniedState({ 
  message = "You do not have administrative privileges to access this area." 
}: { 
  message?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-white border border-slate-800 rounded-xl shadow-xl my-4">
      <div className="w-20 h-20 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center justify-center text-red-400 mb-5 shadow-lg">
        <ShieldAlert className="w-10 h-10 animate-pulse" />
      </div>
      <h3 className="font-anton text-2xl text-white uppercase tracking-wide mb-2">
        Access Restricted
      </h3>
      <p className="text-slate-400 text-sm font-medium max-w-md mb-6">
        {message}
      </p>
      <button 
        onClick={() => router.back()}
        className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 hover:bg-eventrix-lavender active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}

// 8. SESSION EXPIRED STATE
export function SessionExpiredState({ 
  onLogin 
}: { 
  onLogin?: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-purple-200 rounded-xl shadow-md my-4">
      <div className="w-18 h-18 bg-purple-50 border border-purple-200 rounded-full flex items-center justify-center text-purple-700 mb-4 shadow-sm">
        <LogOut className="w-9 h-9" />
      </div>
      <h3 className="font-anton text-2xl text-eventrix-black uppercase tracking-wide mb-2">
        Session Expired
      </h3>
      <p className="text-eventrix-muted text-sm font-medium max-w-md mb-6">
        Your login session has timed out for security. Please sign in again to continue accessing Eventrix.
      </p>
      <button 
        onClick={onLogin || (() => router.push('/'))}
        className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
      >
        <LogIn className="w-4 h-4" /> Login Again
      </button>
    </div>
  );
}

// 9. FORM VALIDATION STATE
export function FormValidationState({ 
  errors = ["Registration number is required", "Invalid email address format"],
  onFix
}: { 
  errors?: string[];
  onFix?: () => void;
}) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm my-4 text-left">
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-red-200">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
        <h4 className="font-anton text-lg text-red-950 uppercase tracking-wide">
          Please Correct the Highlighted Fields
        </h4>
      </div>
      <ul className="space-y-1.5 pl-6 list-disc text-sm font-medium text-red-700 mb-4">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
      {onFix && (
        <button 
          onClick={onFix}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
        >
          Review Fields
        </button>
      )}
    </div>
  );
}

// 10. SUCCESS STATE
export function SuccessState({ 
  title = "Action Completed Successfully!", 
  description = "Your registration has been confirmed and saved to the Eventrix system.",
  actionText = "Continue to Dashboard",
  onContinue
}: { 
  title?: string; 
  description?: string; 
  actionText?: string;
  onContinue?: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-emerald-50/80 border border-emerald-200 rounded-xl shadow-sm my-4">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-emerald-300/40 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
      </div>
      <h3 className="font-anton text-2xl text-emerald-950 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-emerald-800 text-sm font-medium max-w-md mb-6">
        {description}
      </p>
      <button 
        onClick={onContinue || (() => router.push('/dashboard'))}
        className="bg-emerald-700 text-white px-8 py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#065F46] hover:bg-emerald-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
      >
        {actionText}
      </button>
    </div>
  );
}
