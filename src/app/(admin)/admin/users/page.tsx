"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Building2, 
  GraduationCap, 
  Mail, 
  Phone, 
  Trash2, 
  X, 
  ShieldCheck, 
  UserCheck, 
  UserX,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { getAllUsersAdmin, deleteUserAccount } from "@/actions/auth.actions";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import { EventrixSelect } from "@/components/ui/EventrixSelect";

interface SystemUser {
  id: string;
  email: string;
  role: string;
  gender?: string;
  fullName: string;
  college: string;
  department: string;
  yearOfStudy?: string;
  registerNumber?: string;
  mobile?: string;
  createdAt: string;
  lastSignInAt?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "student" | "coordinator">("ALL");
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersAdmin();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load system users");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserAccount(userToDelete.id);
      if (res.success) {
        toast.success(`User ${userToDelete.fullName || userToDelete.email} removed from system`);
        setUserToDelete(null);
        await loadUsers();
      } else {
        toast.error(res.error || "Failed to remove user account");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error("An unexpected error occurred while deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.college && u.college.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.registerNumber && u.registerNumber.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Counts for KPI cards
  const studentCount = useMemo(() => users.filter(u => u.role === 'student').length, [users]);
  const coordinatorCount = useMemo(() => users.filter(u => u.role === 'coordinator').length, [users]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            SYSTEM USERS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Manage all student and coordinator user accounts registered on the Eventrix platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadUsers}
            disabled={loading}
            className="p-3 bg-white border border-[#D9D9DF] rounded-md text-eventrix-black hover:bg-[#F8F8FC] transition-colors disabled:opacity-50 flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Total Accounts</span>
            <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{users.length}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">All registered accounts</p>
        </div>

        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Students</span>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{studentCount}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Student user accounts</p>
        </div>

        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Coordinators</span>
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{coordinatorCount}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Coordinator accounts</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#D9D9DF] p-4 rounded-md shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-eventrix-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-sm font-medium focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto min-w-[200px]">
          <EventrixSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val as any)}
            options={[
              { value: "ALL", label: `All Roles (${users.length})` },
              { value: "student", label: `Students (${studentCount})` },
              { value: "coordinator", label: `Coordinators (${coordinatorCount})` },
            ]}
            size="sm"
          />

          {(searchQuery || roleFilter !== "ALL") && (
            <button
              onClick={() => { setSearchQuery(""); setRoleFilter("ALL"); }}
              className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 uppercase tracking-wider"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[1000px]">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest whitespace-nowrap">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">College & Dept</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-eventrix-lavender" />
                    Loading system users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F8FC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={u}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#D9D9DF]"
                        />
                        <div>
                          <p className="font-bold text-eventrix-black">{u.fullName || "Unnamed User"}</p>
                          <p className="text-[11px] text-eventrix-muted font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : u.role === 'coordinator' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {u.role === 'coordinator' && <ShieldCheck className="w-3 h-3" />}
                        {u.role === 'student' && <UserCheck className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-eventrix-black font-medium">
                          <Mail className="w-3.5 h-3.5 text-eventrix-muted shrink-0" />
                          <span className="truncate max-w-[180px]">{u.email}</span>
                        </div>
                        {u.mobile && (
                          <div className="flex items-center gap-1.5 text-eventrix-muted">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{u.mobile}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-eventrix-black truncate max-w-[200px]" title={u.college}>
                          {u.college || "N/A"}
                        </p>
                        <p className="text-eventrix-muted font-medium">
                          {u.department || "N/A"} {u.yearOfStudy ? `(${u.yearOfStudy} Yr)` : ''}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-eventrix-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove User
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Admin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#F8F8FC] border-t border-[#D9D9DF] flex justify-between items-center text-xs font-medium text-eventrix-muted">
          <span>Showing {filteredUsers.length} of {users.length} system accounts</span>
          <span>Verve26 Admin Control</span>
        </div>
      </div>

      {/* Remove User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#D9D9DF] rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-50 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <UserX className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="text-xl font-bold text-gray-950 mb-2">
              Remove User Account?
            </h3>
            <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-gray-900">{userToDelete.fullName}</span> (<span className="font-mono text-xs">{userToDelete.email}</span>)?
            </p>
            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-6 text-left">
              ⚠️ This will permanently delete their account from the database and authentication system. The user will be unable to log in until they register for a brand new account.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
