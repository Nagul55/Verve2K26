"use client";

import React, { useState } from "react";
import { QrCode, Scan, Search, CheckCircle2, XCircle, UserCheck } from "lucide-react";

export default function CoordinatorScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);

  const simulateScan = () => {
    setScanning(true);
    setScanResult(null);
    setLookupResult(null);
    
    // Simulate camera QR scan
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        success: true,
        participant: "Imran Khan",
        registerNo: "21CS001",
        department: "Computer Science",
        ticketType: "Technical (Code Clash)",
        message: "Ticket Verified & Attendance Recorded!"
      });
    }, 1500);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setLookupResult({
      found: true,
      participant: "Mohamed Imran",
      email: manualQuery.includes("@") ? manualQuery : "imran@college.edu",
      registerNo: manualQuery.includes("@") ? "21CS042" : manualQuery,
      department: "Information Technology",
      status: "Verified",
      checkedIn: false
    });
  };

  const markManualAttendance = () => {
    if (lookupResult) {
      setLookupResult({
        ...lookupResult,
        checkedIn: true
      });
      setScanResult({
        success: true,
        participant: lookupResult.participant,
        registerNo: lookupResult.registerNo,
        department: lookupResult.department,
        ticketType: "Manual Verification",
        message: "Manual Attendance Recorded Successfully!"
      });
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Ticket Scanner
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Coordinator Tool: Scan participant QR tickets or perform manual lookup to record event attendance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Scanner Viewport */}
        <div className="flex-1 border border-[#D9D9DF] bg-eventrix-black p-4 rounded-md relative overflow-hidden h-[500px] flex items-center justify-center group shadow-md">
          {/* Target Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-eventrix-lavender/50 relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-eventrix-lavender"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-eventrix-lavender"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-eventrix-lavender"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-eventrix-lavender"></div>
              
              {/* Scanning animation line */}
              {scanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-eventrix-lavender animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_2px_rgba(167,139,250,0.5)]"></div>
              )}
            </div>
          </div>

          <div className="absolute z-10 text-center">
            {scanning ? (
              <p className="text-eventrix-lavender font-bold text-sm tracking-widest uppercase animate-pulse">Scanning QR Ticket...</p>
            ) : (
              <button 
                onClick={simulateScan}
                className="bg-eventrix-lavender text-eventrix-black px-6 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 mx-auto"
              >
                <Scan className="w-5 h-5 stroke-[3]" /> Activate Scanner Camera
              </button>
            )}
          </div>
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

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Participant Name</p>
                    <p className="font-bold text-eventrix-black text-lg">{scanResult.participant}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Register No.</p>
                      <p className="font-mono font-bold text-eventrix-black">{scanResult.registerNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Department</p>
                      <p className="font-medium text-eventrix-black">{scanResult.department}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-eventrix-muted font-bold uppercase tracking-widest">Ticket Access</p>
                    <p className="font-medium text-eventrix-black">{scanResult.ticketType}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10">
                <QrCode className="w-12 h-12 text-eventrix-muted mb-4" />
                <p className="text-sm font-bold text-eventrix-muted">Ready to scan ticket QR code...</p>
              </div>
            )}
          </div>

          {/* Manual Lookup */}
          <div className="border border-[#D9D9DF] bg-[#F8F8FC] p-6 rounded-md shadow-sm">
            <h3 className="font-bold text-sm text-eventrix-black mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Search className="w-4 h-4 text-eventrix-lavender" /> Manual Participant Lookup
            </h3>
            
            <form onSubmit={handleManualSearch} className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Enter Register No or Email" 
                  className="flex-1 border border-[#D9D9DF] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-eventrix-lavender bg-white font-medium"
                />
                <button 
                  type="submit"
                  className="bg-eventrix-black text-white px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {lookupResult && (
              <div className="mt-4 p-4 bg-white border border-[#D9D9DF] rounded-md space-y-3 text-xs animate-in fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-eventrix-black">{lookupResult.participant}</p>
                    <p className="text-eventrix-muted font-mono">{lookupResult.registerNo} • {lookupResult.department}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {lookupResult.status}
                  </span>
                </div>

                {lookupResult.checkedIn ? (
                  <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs pt-1">
                    <CheckCircle2 className="w-4 h-4" /> Already Checked In
                  </div>
                ) : (
                  <button
                    onClick={markManualAttendance}
                    className="w-full bg-eventrix-lavender text-eventrix-black py-2 rounded font-bold text-xs uppercase tracking-wide hover:bg-eventrix-black hover:text-white transition-colors flex items-center justify-center gap-1.5 mt-2"
                  >
                    <UserCheck className="w-4 h-4" /> Mark Attendance
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
