"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, QrCode, AlertCircle, ExternalLink, Sparkles, X, ShieldCheck } from "lucide-react";
import { testSimulateYoupiPayment } from "@/actions/payment.actions";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  checkoutUrl: string;
  amount: number;
  festName: string;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentId,
  checkoutUrl,
  amount,
  festName,
  onPaymentSuccess
}: PaymentModalProps) {
  const [status, setStatus] = useState<"WAITING" | "PAID" | "FAILED">("WAITING");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentId) return;

    // Poll payment status every 1.5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:6100/api/v1/checkout/${paymentId}/state`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "SUCCESS" || data.status === "PROCESSING") {
            setStatus("PAID");
            clearInterval(interval);
            toast.success("Payment verified successfully via YouPI UPI!");
            setTimeout(() => {
              onPaymentSuccess();
            }, 1000);
          }
        }
      } catch (e) {
        // Gateway might be offline or polling
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, paymentId, onPaymentSuccess]);

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await testSimulateYoupiPayment(paymentId, amount);
      if (res.success) {
        toast.success("Test Payment Simulated: Bank credit alert verified!");
        setStatus("PAID");
        setTimeout(() => {
          onPaymentSuccess();
        }, 1200);
      } else {
        toast.error("Simulation failed. Make sure YouPI gateway is running.");
      }
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-lg border-2 border-eventrix-black shadow-[8px_8px_0px_0px_rgba(8,10,18,1)] overflow-hidden">
        {/* Header */}
        <div className="bg-eventrix-black text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="font-anton text-xl tracking-wider uppercase">UPI Checkout • YouPI-PG</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Order Details */}
          <div className="bg-[#FAF9FF] border border-[#E5E5EB] p-4 rounded-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-eventrix-muted block">Event / Fest</span>
              <p className="font-bold text-sm text-eventrix-black">{festName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-eventrix-muted block">Registration Fee</span>
              <p className="font-anton text-2xl text-eventrix-black leading-none">₹{amount}</p>
            </div>
          </div>

          {/* Checkout Status Area */}
          {status === "PAID" ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-300 rounded-md animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-anton text-2xl text-emerald-900 uppercase">Payment Verified!</h4>
              <p className="text-xs text-emerald-700 mt-1">Completing your registration and generating your ticket...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
                <QrCode className="w-10 h-10 text-eventrix-lavender mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-sm text-eventrix-black mb-1">
                  Pay via any UPI App (GPay, PhonePe, Paytm, CRED)
                </h4>
                <p className="text-xs text-eventrix-muted max-w-sm mx-auto mb-4">
                  0% transaction fees • Direct settlement to the college organizing bank account.
                </p>

                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-eventrix-black hover:bg-eventrix-lavender hover:text-black text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-[3px_3px_0px_0px_rgba(169,139,255,1)]"
                >
                  Open YouPI QR & App Drawer <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Developer Test Simulator Button */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-amber-900">Developer Testing Mode</p>
                    <p className="text-[10px] text-amber-700">Simulate bank SMS credit alert without real money transfer.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSimulating ? "Simulating..." : "🧪 Simulate Payment"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-eventrix-muted uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Powered by Sovereign YouPI-PG Gateway
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
