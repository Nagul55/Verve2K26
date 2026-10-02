"use client";

import React, { useState } from "react";
import { QrCode, Scan, Search, CheckCircle2, XCircle } from "lucide-react";

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const simulateScan = () => {
    setScanning(true);
    setScanResult(null);
    
    // Simulate API delay
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        success: true,
        participant: "Imran Khan",
        registerNo: "21CS001",
        department: "CSE",
        ticketType: "Technical (Code Clash)",
        message: "Attendance recorded successfully!"
      });
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Ticket Scanner
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Coordinator Tool: Scan participant QR tickets or perform manual lookup to record attendance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Scanner Viewport */}
        <div className="flex-1 border border-[#D9D9DF] bg-eventrix-black p-4 rounded-md relative overflow-hidden h-[500px] flex items-center justify-center group">
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
              <p className="text-eventrix-lavender font-bold text-sm tracking-widest uppercase animate-pulse">Scanning...</p>
            ) : (
              <button 
                onClick={simulateScan}
                className="bg-eventrix-lavender text-eventrix-black px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex items-center gap-2 mx-auto"
              >
                <Scan className="w-4 h-4 stroke-[3]" /> Start Camera
              </button>
            )}
          </div>
        </div>

        {/* Results & Manual Lookup Sidebar */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
          
          {/* Results Card */}
          <div className={`flex-1 border border-[#D9D9DF] rounded-md p-6 bg-white transition-all duration-300 ${scanResult ? 'border-eventrix-black shadow-[0_4px_20px_rgba(0,0,0,0.05)]' : ''}`}>
            <h3 className="font-bold text-sm text-eventrix-muted uppercase tracking-widest mb-6">Scan Result</h3>
            
            {scanResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className={`p-4 rounded-md mb-6 flex gap-3 ${scanResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
                      <p className="font-medium text-eventrix-black">{scanResult.registerNo}</p>
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
                <p className="text-sm font-bold text-eventrix-muted">Waiting for scan...</p>
              </div>
            )}
          </div>

          {/* Manual Lookup */}
          <div className="border border-[#D9D9DF] bg-[#F8F8FC] p-6 rounded-md">
            <h3 className="font-bold text-sm text-eventrix-black mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Manual Lookup
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Register No or Email" 
                className="flex-1 border border-[#D9D9DF] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-eventrix-lavender bg-white"
              />
              <button className="bg-eventrix-black text-white px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-colors">
                Search
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
