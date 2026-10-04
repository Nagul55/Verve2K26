"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signout } from "@/actions/auth.actions";

interface LogoutButtonProps {
  variant?: "sidebar" | "icon";
  className?: string;
}

export function LogoutButton({ variant = "sidebar", className }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    try {
      setIsPending(true);
      await signout();
    } catch (err) {
      console.error("Logout failed:", err);
      setIsPending(false);
    }
  };

  return (
    <>
      {variant === "sidebar" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            className ||
            "flex items-center gap-4 px-4 py-3 w-full rounded-lg font-medium transition-colors text-sm text-eventrix-white hover:bg-white/5 text-left"
          }
        >
          <LogOut className="w-5 h-5 stroke-[1.5] text-eventrix-lavender" />
          <span>Logout</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Logout"
          className={
            className ||
            "text-eventrix-muted hover:text-red-500 transition-colors ml-1"
          }
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-gray-900 text-center relative z-[101] transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <LogOut className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="text-xl font-bold text-gray-950 mb-2">
              Log Out of Eventrix?
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
              Are you sure you want to log out? You will need to sign back in to access your account.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
