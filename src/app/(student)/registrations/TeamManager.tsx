"use client";

import React, { useState } from "react";
import { Users, Edit3, UserPlus, Save, X } from "lucide-react";
import { updateRegisteredTeam } from "@/actions/team.actions";
import { toast } from "sonner";

export function TeamManager({ teamDetails }: { teamDetails: any }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const minCandidates = teamDetails?.minCandidates || 2;
  const maxCandidates = teamDetails?.maxCandidates || 5;
  const maxExtraMembers = Math.max(0, maxCandidates - 1);
  const minExtraMembers = Math.max(0, minCandidates - 1);

  // Extract initial member emails (excluding leader)
  const getInitialExtraEmails = () => {
    return (teamDetails?.members || [])
      .filter((m: any) => !m.isLeader)
      .map((m: any) => m.email || '');
  };

  const [memberEmails, setMemberEmails] = useState<string[]>([]);

  const handleOpenEdit = () => {
    setMemberEmails(getInitialExtraEmails());
    setIsEditing(true);
  };

  const handleSaveTeamEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmails = memberEmails.map(e => e.trim().toLowerCase()).filter(Boolean);
    const uniqueEmails = Array.from(new Set(cleanEmails));

    if (uniqueEmails.length !== cleanEmails.length) {
      toast.error("Duplicate member email addresses found. Please ensure each email is unique.");
      return;
    }

    // Check if leader email was entered
    const leaderMember = (teamDetails?.members || []).find((m: any) => m.isLeader);
    if (leaderMember?.email && cleanEmails.includes(leaderMember.email.toLowerCase())) {
      toast.error("Team Leader is automatically included. Do not add leader email as a member.");
      return;
    }

    const totalTeamSize = 1 + cleanEmails.length;

    if (totalTeamSize < minCandidates) {
      toast.error(`Team must have at least ${minCandidates} members (1 Leader + at least ${minExtraMembers} member/s).`);
      return;
    }

    if (totalTeamSize > maxCandidates) {
      toast.error(`Maximum team size is ${maxCandidates} members (1 Leader + at most ${maxExtraMembers} member/s).`);
      return;
    }

    setLoading(true);
    const res = await updateRegisteredTeam(teamDetails.teamId, cleanEmails);
    if (res.success) {
      toast.success("Team updated successfully!");
      setIsEditing(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to update team");
      setLoading(false);
    }
  };

  const handleEmailChange = (index: number, val: string) => {
    const updated = [...memberEmails];
    updated[index] = val;
    setMemberEmails(updated);
  };

  const addEmailField = () => {
    if (memberEmails.length >= maxExtraMembers) {
      toast.error(`Maximum allowed additional members is ${maxExtraMembers}.`);
      return;
    }
    setMemberEmails(prev => [...prev, '']);
  };

  const removeEmailField = (index: number) => {
    setMemberEmails(prev => prev.filter((_, i) => i !== index));
  };

  const currentTotal = 1 + (isEditing ? memberEmails.filter(e => e.trim() !== '').length : (teamDetails?.members?.length || 1));

  return (
    <div className="bg-[#F7F7F8] border border-[#D9D9DE] p-4 rounded-[2px] flex flex-col gap-3 relative overflow-hidden mt-3">
      <div className="absolute top-0 left-0 w-[3px] h-full bg-[#A98BFF]"></div>
      
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-2 text-[#080A12]">
          <Users className="w-4 h-4 text-[#A98BFF]" />
          <span className="font-['Inter'] text-[10px] font-bold tracking-[0.1em] uppercase">Team Info</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {teamDetails.isTeamComplete ? (
            <span className="bg-[#20B486]/10 text-[#20B486] text-[9px] px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider border border-[#20B486]/30">
              Team Confirmed ✓
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 text-[9px] px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider border border-amber-200">
              Acceptance Pending
            </span>
          )}
          <span className="bg-[#A98BFF]/10 text-[#596078] text-[9px] px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider">
            Size: {currentTotal} / {maxCandidates} (Min: {minCandidates})
          </span>
          {teamDetails.isLeader && !isEditing && (
            <button
              onClick={handleOpenEdit}
              className="bg-[#080A12] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm hover:bg-[#A98BFF] hover:text-[#080A12] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit Team
            </button>
          )}
        </div>
      </div>

      <div className="pl-2">
        <p className="font-['Roboto_Condensed','Anton',sans-serif] font-[800] text-[20px] leading-[1] text-[#080A12] uppercase mb-2">
          {teamDetails.teamName}
        </p>

        {!teamDetails.isTeamComplete && !isEditing && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-sm text-[11px] font-medium text-amber-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
            <span>Waiting for all team members to accept invitations before tickets are generated.</span>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-2">
            {teamDetails.members.map((member: any) => (
              <div key={member.participantId || member.email} className="flex items-center justify-between bg-white border border-[#D9D9DE] p-2.5 rounded-sm">
                <div>
                  <p className="text-xs font-bold text-[#080A12] flex items-center gap-1.5">
                    {member.name}
                    {member.isLeader && (
                      <span className="bg-[#080A12] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                        Team Leader
                      </span>
                    )}
                  </p>
                  <p className={`text-[10px] font-bold mt-0.5 ${member.status === 'Accepted' || member.isLeader ? 'text-green-600' : 'text-orange-500'}`}>
                    {member.isLeader ? 'Leader' : member.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSaveTeamEdit} className="space-y-4 bg-white border border-[#D9D9DE] p-4 rounded-md">
            <div className="flex justify-between items-center pb-2 border-b border-[#D9D9DE]">
              <span className="text-xs font-bold text-[#080A12] uppercase tracking-wider">
                Edit Members (Leader + {minExtraMembers} to {maxExtraMembers} members)
              </span>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500">
              You are the Team Leader. Enter registered member emails below:
            </p>

            <div className="space-y-2">
              {memberEmails.map((email, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    placeholder={`Member ${idx + 2} Email`}
                    className="flex-1 border border-[#D9D9DE] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#A98BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => removeEmailField(idx)}
                    className="text-red-500 hover:text-red-700 p-2 border border-red-100 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    title="Remove Member Field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {memberEmails.length < maxExtraMembers && (
              <button
                type="button"
                onClick={addEmailField}
                className="text-xs font-bold text-[#A98BFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Member Field
              </button>
            )}

            <div className="flex gap-2 pt-2 border-t border-[#D9D9DE]">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#080A12] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-[#A98BFF] hover:text-[#080A12] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> {loading ? "Saving..." : "Save Team Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="border border-[#D9D9DE] text-gray-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
