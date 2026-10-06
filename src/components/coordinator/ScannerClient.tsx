"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Scan, CheckCircle2, XCircle, UserCheck, Sparkles, Building2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

interface ScannerClientProps {
  assignedEventId?: string | null;
  assignedEventIds?: string[];
  isAdmin?: boolean;
}

export default function ScannerClient({ assignedEventId, assignedEventIds = [], isAdmin = false }: ScannerClientProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const validAssignedIds = assignedEventIds.length > 0 
    ? assignedEventIds 
    : (assignedEventId ? [assignedEventId] : []);
  
  // Store the scanner instance in a ref to properly clean it up on unmount
  const scannerRef = React.useRef<any | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    setScanResult(null);

    const { Html5Qrcode } = await import("html5-qrcode");

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          // Found a QR Code -> Stop camera immediately to freeze view
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            setScanning(false);
          }

          processDecodedQr(decodedText);
        },
        () => {
          // Frame parse error - ignore
        }
      );
    } catch (err) {
      console.error(err);
      setScanning(false);
      toast.error("Failed to start camera. Please check camera permissions.");
      setScanResult({ success: false, message: "Failed to start camera. Please check permissions." });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };

  const processDecodedQr = (decodedText: string) => {
    let payload: any = {};
    try {
      payload = JSON.parse(decodedText);
    } catch (e) {
      payload = { rawCode: decodedText.trim() };
    }

    const pid = payload.pid || payload.participant_id || payload.participantId || (typeof payload.rawCode === 'string' ? payload.rawCode : null);
    const eventId = payload.event_id || payload.sub_event_id || payload.eventId || payload.subEventId || null;
    const registrationId = payload.registration_id || payload.registrationId || payload.ticketId || payload.ticket_id || null;

    if (!pid && !registrationId && !payload.rawCode) {
      toast.error("Invalid QR Code content");
      setScanResult({ success: false, message: "Invalid QR Code content" });
      return;
    }

    verifyTicketApi({ pid, event_id: eventId, registration_id: registrationId, rawCode: payload.rawCode });
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualQuery.trim();
    if (!query) {
      toast.error("Please enter a Register Number, Email, or Ticket ID");
      return;
    }

    setIsSubmittingManual(true);
    await verifyTicketApi({ rawCode: query, pid: query });
    setIsSubmittingManual(false);
  };

  const verifyTicketApi = async (bodyPayload: any) => {
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message || "Ticket verified successfully!");
        setScanResult({
          success: true,
          participant: data.participantName || "Verified Participant",
          registerNo: data.registerNo || "N/A",
          eventName: data.eventName || "Event Activity",
          eventCategory: data.eventCategory || "Technical",
          location: data.location || "Venue",
          ticketType: data.ticketType || "QR Ticket Verified",
          message: data.message
        });
      } else {
        toast.error(data.error || "Failed to verify ticket");
        setScanResult({
          success: false,
          message: data.error || "Verification failed"
        });
      }
    } catch (err) {
      toast.error("Network error occurred during ticket verification.");
      setScanResult({ success: false, message: "Network error occurred." });
    }
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
              className="bg-eventrix-lavender text-eventrix-black px-6 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Scan className="w-5 h-5 stroke-[3]" /> Activate Scanner Camera
            </button>
            {isAdmin ? (
               <p className="text-emerald-400 mt-4 text-xs font-bold uppercase tracking-widest">
                 Admin Mode: Authorized for All Events
               </p>
            ) : (
              <p className="text-purple-300 mt-4 text-xs font-bold uppercase tracking-widest">
                Coordinator Mode: Authorized for Assigned Events ({validAssignedIds.length})
              </p>
            )}
          </div>
        )}

        {scanning && (
          <div className="absolute top-4 right-4 z-20">
             <button onClick={stopScanner} className="bg-red-500 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-red-600 shadow-sm cursor-pointer">
               Stop Camera
             </button>
          </div>
        )}

      </div>

      {/* Results & Verification Sidebar */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
        
        {/* Results Card */}
        <div className={`flex-1 border border-[#D9D9DF] rounded-md p-6 bg-white transition-all duration-300 ${scanResult ? 'border-eventrix-black shadow-md' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xs text-eventrix-muted uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-eventrix-lavender" /> Scan Verification Result
            </h3>
            {scanResult && (
              <button 
                onClick={startScanner}
                className="text-[10px] font-bold text-eventrix-lavender hover:underline uppercase tracking-wider cursor-pointer"
              >
                Scan Next Ticket
              </button>
            )}
          </div>
          
          {scanResult ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5">
              <div className={`p-4 rounded-md flex gap-3 ${scanResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {scanResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" /> : <XCircle className="w-5 h-5 shrink-0 text-red-600" />}
                <div>
                  <p className="font-bold text-sm leading-snug">{scanResult.message}</p>
                  {scanResult.success && (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-green-200 text-green-900 px-2 py-0.5 rounded inline-block mt-1">
                      Check-in Successful
                    </span>
                  )}
                </div>
              </div>

              {scanResult.success && (
                <div className="space-y-4 pt-2 border-t border-[#D9D9DF]">
                  <div>
                    <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest mb-0.5">Student Participant</p>
                    <p className="font-bold text-eventrix-black text-lg flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-eventrix-lavender" /> {scanResult.participant}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest mb-0.5">Register / ID</p>
                      <p className="font-mono font-bold text-eventrix-black text-sm">{scanResult.registerNo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest mb-0.5">Ticket Type</p>
                      <p className="font-semibold text-eventrix-black text-xs">{scanResult.ticketType}</p>
                    </div>
                  </div>

                  <div className="bg-[#F8F8FC] p-3 rounded border border-[#D9D9DF]">
                    <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest mb-1">Event Activity</p>
                    <p className="font-bold text-eventrix-black text-sm">{scanResult.eventName}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-eventrix-muted">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {scanResult.eventCategory}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" /> {scanResult.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
              <QrCode className="w-12 h-12 text-eventrix-muted mb-4" />
              <p className="text-sm font-bold text-eventrix-muted">Ready to scan student ticket QR code...</p>
              <p className="text-xs text-eventrix-muted/80 mt-1 max-w-[220px]">
                Click "Activate Scanner Camera" or perform manual lookup below.
              </p>
            </div>
          )}
        </div>

        {/* Manual Lookup Card */}
        <div className="border border-[#D9D9DF] bg-[#F8F8FC] p-5 rounded-md">
          <h3 className="font-bold text-xs text-eventrix-black mb-3 uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-eventrix-lavender" /> Manual Attendance Lookup
          </h3>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input 
              type="text" 
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Enter Register No or Email..." 
              className="flex-1 border border-[#D9D9DF] rounded px-3 py-2 text-xs focus:outline-none focus:border-eventrix-lavender bg-white"
            />
            <button 
              type="submit"
              disabled={isSubmittingManual}
              className="bg-eventrix-black text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingManual ? 'Checking...' : 'Verify'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

