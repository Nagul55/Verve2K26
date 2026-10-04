"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Scan, Search, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

export default function ScannerClient({ assignedEventId }: { assignedEventId: string | null }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  
  // Store the scanner instance in a ref to properly clean it up on unmount
  const scannerRef = React.useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Cleanup html5-qrcode scanner on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (!assignedEventId) {
      toast.error("You are not assigned to any specific event. Cannot scan tickets.");
      return;
    }

    setScanning(true);
    setScanResult(null);
    setLookupResult(null);

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Found a QR Code
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            setScanning(false);
          }

          try {
            const data = JSON.parse(decodedText);
            if (data.pid) {
              verifyTicketApi(data.pid, data.event_id);
            } else {
              toast.error("Invalid Ticket QR Format");
              setScanResult({ success: false, message: "Invalid Ticket QR Format" });
            }
          } catch (e) {
            toast.error("Invalid Ticket QR Format");
            setScanResult({ success: false, message: "Invalid Ticket QR Format (Not JSON)" });
          }
        },
        (errorMessage) => {
          // parse error, ignore
        }
      );
    } catch (err) {
      console.error(err);
      setScanning(false);
      toast.error("Failed to start camera. Please check permissions.");
      setScanResult({ success: false, message: "Failed to start camera. Please check permissions." });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };

  const verifyTicketApi = async (pid: string, qrEventId?: string) => {
    try {
      if (qrEventId && qrEventId !== assignedEventId) {
        const errMsg = "WRONG TICKET! This ticket is for a different event.";
        toast.error(errMsg);
        setScanResult({
          success: false,
          message: errMsg
        });
        return;
      }

      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid, event_id: assignedEventId })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Ticket verified successfully!");
        setScanResult({
          success: true,
          participant: data.participantName || "Verified Participant",
          registerNo: data.registerNo || pid.substring(0, 8),
          ticketType: "QR Ticket",
          message: data.message
        });
      } else {
        toast.error(data.error || "Failed to verify ticket");
        setScanResult({
          success: false,
          message: data.error
        });
      }
    } catch (err) {
      toast.error("Network error occurred.");
      setScanResult({ success: false, message: "Network error occurred." });
    }
  };

  // Keep manual search mockup for now or also link it to an API route
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    
    // In a full model, this would ping a `/api/admin/manual-lookup` endpoint
    toast.info("Manual lookup is currently under construction. Please use QR Scan.");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Scanner Viewport */}
      <div className="flex-1 border border-[#D9D9DF] bg-eventrix-black p-4 rounded-md relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center group shadow-md">
        
        {/* HTML5 QR Code Container */}
        <div id="qr-reader" className="w-full max-w-[400px] rounded-lg overflow-hidden border-2 border-transparent"></div>

        {!scanning && (
          <div className="absolute z-10 text-center flex flex-col items-center">
            <button 
              onClick={startScanner}
              className="bg-eventrix-lavender text-eventrix-black px-6 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 mx-auto"
            >
              <Scan className="w-5 h-5 stroke-[3]" /> Activate Scanner Camera
            </button>
            {!assignedEventId && (
               <p className="text-red-400 mt-4 text-xs font-bold uppercase tracking-widest">
                 No event assigned. Cannot scan.
               </p>
            )}
          </div>
        )}

        {scanning && (
          <div className="absolute top-4 right-4 z-20">
             <button onClick={stopScanner} className="bg-red-500 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-red-600 shadow-sm">
               Stop Camera
             </button>
          </div>
        )}

      </div>

      {/* Results & Manual Lookup Sidebar */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
        
        {/* Results Card */}
        <div className={`flex-1 border border-[#D9D9DF] rounded-md p-6 bg-white transition-all duration-300 ${scanResult ? 'border-eventrix-black shadow-md' : ''}`}>
          <h3 className="font-bold text-xs text-eventrix-muted uppercase tracking-widest mb-4">Scan Verification Result</h3>
          
          {scanResult ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className={`p-4 rounded-md mb-5 flex gap-3 ${scanResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {scanResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                <p className="font-bold text-sm">{scanResult.message}</p>
              </div>

              {scanResult.success && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Participant Name</p>
                    <p className="font-bold text-eventrix-black text-lg">{scanResult.participant}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">ID Hash</p>
                      <p className="font-mono font-bold text-eventrix-black">{scanResult.registerNo}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Ticket Access</p>
                    <p className="font-medium text-eventrix-black">{scanResult.ticketType}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10">
              <QrCode className="w-12 h-12 text-eventrix-muted mb-4" />
              <p className="text-sm font-bold text-eventrix-muted">Ready to scan ticket QR code...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
