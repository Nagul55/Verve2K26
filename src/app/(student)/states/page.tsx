"use client";

import React, { useState } from "react";
import { 
  FolderOpen, 
  Loader2, 
  AlertTriangle, 
  WifiOff, 
  Hourglass, 
  SearchX, 
  Lock, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Sparkles
} from "lucide-react";
import {
  EmptyState,
  LoadingState,
  ErrorState,
  NoInternetState,
  SlowNetworkState,
  NoSearchResultState,
  PermissionDeniedState,
  SessionExpiredState,
  FormValidationState,
  SuccessState
} from "@/components/ui/StateComponents";

export default function StateShowcasePage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const states = [
    { id: 1, name: "1. Empty State", icon: FolderOpen },
    { id: 2, name: "2. Loading State", icon: Loader2 },
    { id: 3, name: "3. Error State", icon: AlertTriangle },
    { id: 4, name: "4. No Internet", icon: WifiOff },
    { id: 5, name: "5. Slow Network", icon: Hourglass },
    { id: 6, name: "6. No Search Result", icon: SearchX },
    { id: 7, name: "7. Permission Denied", icon: Lock },
    { id: 8, name: "8. Session Expired", icon: LogOut },
    { id: 9, name: "9. Form Validation", icon: AlertCircle },
    { id: 10, name: "10. Success State", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#080A12] border border-[#1F2438] p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-eventrix-lavender/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-eventrix-lavender text-eventrix-black text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Eventrix UI Kit
          </span>
          <span className="text-xs font-bold text-gray-400">10 Standard System States</span>
        </div>
        <h1 className="font-anton text-[36px] uppercase tracking-wide text-white">
          System State Showcase
        </h1>
        <p className="text-gray-300 text-sm font-medium max-w-2xl mt-1">
          Interactive gallery of all 10 industry-level UI feedback states designed with dualtone accents, smooth animations, and actionable user triggers.
        </p>
      </div>

      {/* State Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#D9D9DF] rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab(0)}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 0 
              ? "bg-eventrix-black text-white shadow-sm" 
              : "bg-[#F8F8FC] text-eventrix-muted hover:text-eventrix-black hover:bg-gray-200"
          }`}
        >
          <Layers className="w-4 h-4 text-eventrix-lavender" /> View All 10 States
        </button>
        {states.map((st) => {
          const Icon = st.icon;
          return (
            <button
              key={st.id}
              onClick={() => setActiveTab(st.id)}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === st.id 
                  ? "bg-eventrix-lavender text-eventrix-black shadow-sm" 
                  : "bg-[#F8F8FC] text-eventrix-muted hover:text-eventrix-black hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {st.name}
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-eventrix-black text-white border border-eventrix-lavender px-5 py-3 rounded-lg text-xs font-bold shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-eventrix-lavender" /> {toastMsg}
        </div>
      )}

      {/* Render Active State View */}
      <div className="space-y-6">

        {(activeTab === 0 || activeTab === 1) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 01 — Empty State</span>
              <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded">No Data</span>
            </div>
            <EmptyState 
              title="No Registrations Yet" 
              description="You have not enrolled in any technical or non-technical activities for Verve26." 
              actionText="Browse Available Fests"
              onAction={() => showToast("Action Triggered: Navigate to Events")}
            />
          </div>
        )}

        {(activeTab === 0 || activeTab === 2) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 02 — Loading State</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Fetching Data</span>
            </div>
            <LoadingState message="Fetching Eventrix Schedule & Leaderboard..." />
          </div>
        )}

        {(activeTab === 0 || activeTab === 3) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 03 — Error State</span>
              <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded">API Failure</span>
            </div>
            <ErrorState 
              title="Connection Failed" 
              description="Could not reach the Eventrix database server. Please verify your credentials."
              onRetry={() => showToast("Action Triggered: Retrying API Request...")}
            />
          </div>
        )}

        {(activeTab === 0 || activeTab === 4) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 04 — No Internet</span>
              <span className="bg-slate-800 text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Offline</span>
            </div>
            <NoInternetState onRetry={() => showToast("Action Triggered: Checking Network...")} />
          </div>
        )}

        {(activeTab === 0 || activeTab === 5) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 05 — Slow Network</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">High Latency</span>
            </div>
            <SlowNetworkState onCancel={() => showToast("Action Triggered: Cancelled Slow Request")} />
          </div>
        )}

        {(activeTab === 0 || activeTab === 6) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 06 — No Search Result</span>
              <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded">0 Matches</span>
            </div>
            <NoSearchResultState query="Hackathon 2026" onClear={() => showToast("Action Triggered: Search Cleared")} />
          </div>
        )}

        {(activeTab === 0 || activeTab === 7) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 07 — Permission Denied</span>
              <span className="bg-red-950 text-red-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Restricted</span>
            </div>
            <PermissionDeniedState message="Access strictly reserved for Eventrix Admin users and Event Coordinators." />
          </div>
        )}

        {(activeTab === 0 || activeTab === 8) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 08 — Session Expired</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Timeout</span>
            </div>
            <SessionExpiredState onLogin={() => showToast("Action Triggered: Redirecting to Sign In")} />
          </div>
        )}

        {(activeTab === 0 || activeTab === 9) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 09 — Form Validation</span>
              <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Inline Errors</span>
            </div>
            <FormValidationState 
              errors={[
                "Register Number must follow college format (e.g. 21CS101).",
                "Mobile phone number must be 10 digits.",
                "Team lead must select at least 1 technical sub-event."
              ]}
              onFix={() => showToast("Action Triggered: Scrolled to Form Fields")}
            />
          </div>
        )}

        {(activeTab === 0 || activeTab === 10) && (
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted">State 10 — Success State</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">Success</span>
            </div>
            <SuccessState 
              title="Registration Confirmed!" 
              description="Your ticket pass for Verve26 has been generated and sent to your registered email address."
              actionText="View Pass & Tickets"
              onContinue={() => showToast("Action Triggered: Navigating to Tickets")}
            />
          </div>
        )}

      </div>
    </div>
  );
}
