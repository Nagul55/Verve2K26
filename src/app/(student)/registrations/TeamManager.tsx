"use client";

import React, { useState } from "react";
import { Users, Lock, UserMinus, ShieldAlert } from "lucide-react";
import { removeTeamMember, lockTeam } from "@/actions/team.actions";

export function TeamManager({ teamDetails }: { teamDetails: any }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async (participantId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setLoading(true);
    const res = await removeTeamMember(teamDetails.teamId, participantId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (!confirm("Are you sure you want to lock the team? Once locked, you cannot remove members.")) return;
    setLoading(true);
    const res = await lockTeam(teamDetails.teamId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F8] border border-[#D9D9DE] p-4 rounded-[2px] flex flex-col gap-3 relative overflow-hidden mt-3">
      <div className="absolute top-0 left-0 w-[3px] h-full bg-[#A98BFF]/50"></div>
      
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-2 text-[#080A12]">
          <Users className="w-4 h-4" />
          <span className="font-['Inter'] text-[10px] font-bold tracking-[0.1em] uppercase">Team Info</span>
        </div>
        {teamDetails.isLocked && (
          <span className="bg-[#080A12] text-white text-[9px] px-2 py-0.5 rounded-sm flex items-center gap-1 font-bold">
            <Lock className="w-3 h-3" /> LOCKED
          </span>
        )}
      </div>

      <div className="pl-2">
        <p className="font-['Roboto_Condensed','Anton',sans-serif] font-[800] text-[20px] leading-[1] text-[#080A12] uppercase mb-3">
          {teamDetails.teamName}
        </p>

        <div className="space-y-2">
          {teamDetails.members.map((member: any) => (
            <div key={member.participantId} className="flex items-center justify-between bg-white border border-[#D9D9DE] p-2 rounded-sm">
              <div>
                <p className="text-xs font-bold text-[#080A12]">{member.name}</p>
                <p className={`text-[10px] font-bold ${member.status === 'Accepted' ? 'text-green-600' : 'text-orange-500'}`}>
                  {member.status}
                </p>
              </div>
              
              {teamDetails.isLeader && !teamDetails.isLocked && member.status !== 'Accepted' && (
                <button 
                  onClick={() => handleRemove(member.participantId)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-sm transition-colors disabled:opacity-50"
                  title="Remove Member"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {teamDetails.isLeader && !teamDetails.isLocked && (
          <div className="mt-4 pt-3 border-t border-dashed border-[#D9D9DE]">
            <p className="text-[10px] text-[#596078] mb-2 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> 
              As leader, lock the team once all members are final.
            </p>
            <button 
              onClick={handleLock}
              disabled={loading}
              className="w-full bg-[#080A12] text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm hover:bg-[#A98BFF] hover:text-[#080A12] transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Lock Team"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
