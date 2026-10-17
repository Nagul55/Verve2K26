"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, GraduationCap, Building2, Calendar, Award, Filter, RefreshCw } from 'lucide-react';
import { EventrixSelect } from '@/components/ui/EventrixSelect';

export interface DemographicItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardChartsProps {
  participants?: any[];
  events?: any[];
  fests?: any[];
  trendsData?: { name: string; registrations: number }[];
  growthRate?: string;
  yearData?: DemographicItem[];
  deptData?: DemographicItem[];
  collegeData?: DemographicItem[];
}

export function DashboardCharts({ 
  participants = [],
  events = [],
  fests = [],
  trendsData: initialTrendsData = [], 
  growthRate: initialGrowthRate = "+0%",
  yearData: initialYearData = [],
  deptData: initialDeptData = [],
  collegeData: initialCollegeData = []
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Construct options for EventrixSelect
  const filterOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string; description?: string }> = [
      { 
        value: "ALL", 
        label: "All Events (Overall Report)", 
        description: "Aggregated platform-wide metrics" 
      }
    ];

    // Add Fests if available
    if (fests && fests.length > 0) {
      fests.forEach((f: any) => {
        opts.push({
          value: `fest:${f.id}`,
          label: `Fest: ${f.name}`,
          description: `All registrations under ${f.name}`
        });
      });
    }

    // Add Sub-Events
    if (events && events.length > 0) {
      events.forEach((ev: any) => {
        opts.push({
          value: `sub:${ev.id}`,
          label: ev.title,
          description: `${ev.category || 'Event'} • ${ev.participation_type || 'Format'}`
        });
      });
    }

    return opts;
  }, [events, fests]);

  const selectedOption = useMemo(() => {
    return filterOptions.find(o => o.value === selectedFilter) || filterOptions[0];
  }, [filterOptions, selectedFilter]);

  // Filter participants according to selected event/fest
  const filteredParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    if (selectedFilter === "ALL") return participants;

    return participants.filter(p => {
      if (!p.registrations || !Array.isArray(p.registrations)) return false;

      if (selectedFilter.startsWith("fest:")) {
        const festId = selectedFilter.replace("fest:", "");
        return p.registrations.some((reg: any) => reg.fest_id === festId);
      }

      if (selectedFilter.startsWith("sub:")) {
        const subId = selectedFilter.replace("sub:", "");
        return p.registrations.some((reg: any) =>
          reg.registration_sub_events?.some((rse: any) => rse.sub_events?.id === subId)
        );
      }

      return p.registrations.some((reg: any) =>
        reg.fest_id === selectedFilter ||
        reg.registration_sub_events?.some((rse: any) => rse.sub_events?.id === selectedFilter)
      );
    });
  }, [participants, selectedFilter]);

  // Compute 7-day registration activity for the selected scope
  const activeTrendsData = useMemo(() => {
    if (selectedFilter === "ALL" && initialTrendsData.length > 0 && (!participants || participants.length === 0)) {
      return initialTrendsData;
    }

    const today = new Date();
    const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        registrations: 0,
      };
    });

    const studentList = filteredParticipants.filter(p => (p.role || 'student').toLowerCase() === 'student' || !p.role);

    studentList.forEach(p => {
      if (p.registrations && Array.isArray(p.registrations)) {
        p.registrations.forEach((reg: any) => {
          let countToAdd = 0;

          if (selectedFilter === "ALL") {
            countToAdd = reg.registration_sub_events?.length || 1;
          } else if (selectedFilter.startsWith("fest:")) {
            const targetFestId = selectedFilter.replace("fest:", "");
            if (reg.fest_id === targetFestId) {
              countToAdd = reg.registration_sub_events?.length || 1;
            }
          } else if (selectedFilter.startsWith("sub:")) {
            const targetSubId = selectedFilter.replace("sub:", "");
            const matchingCount = reg.registration_sub_events?.filter((rse: any) => rse.sub_events?.id === targetSubId).length || 0;
            countToAdd = matchingCount;
          }

          if (countToAdd > 0 && reg.created_at) {
            const regDate = new Date(reg.created_at).toISOString().split('T')[0];
            const dayData = last7DaysData.find(d => d.dateStr === regDate);
            if (dayData) {
              dayData.registrations += countToAdd;
            }
          }
        });
      }
    });

    return last7DaysData.map(d => ({ name: d.name, registrations: d.registrations }));
  }, [filteredParticipants, selectedFilter, initialTrendsData, participants]);

  // Compute growth rate for the selected scope
  const activeGrowthRate = useMemo(() => {
    if (selectedFilter === "ALL" && initialGrowthRate && (!participants || participants.length === 0)) {
      return initialGrowthRate;
    }

    const today = new Date();
    let currentPeriodRegs = 0;
    let previousPeriodRegs = 0;

    const studentList = filteredParticipants.filter(p => (p.role || 'student').toLowerCase() === 'student' || !p.role);

    studentList.forEach(p => {
      if (p.registrations && Array.isArray(p.registrations)) {
        p.registrations.forEach((reg: any) => {
          let countToAdd = 0;

          if (selectedFilter === "ALL") {
            countToAdd = reg.registration_sub_events?.length || 1;
          } else if (selectedFilter.startsWith("fest:")) {
            const targetFestId = selectedFilter.replace("fest:", "");
            if (reg.fest_id === targetFestId) {
              countToAdd = reg.registration_sub_events?.length || 1;
            }
          } else if (selectedFilter.startsWith("sub:")) {
            const targetSubId = selectedFilter.replace("sub:", "");
            const matchingCount = reg.registration_sub_events?.filter((rse: any) => rse.sub_events?.id === targetSubId).length || 0;
            countToAdd = matchingCount;
          }

          if (countToAdd > 0 && reg.created_at) {
            const regDate = new Date(reg.created_at);
            const diffDays = Math.floor((today.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays >= 0 && diffDays < 7) {
              currentPeriodRegs += countToAdd;
            } else if (diffDays >= 7 && diffDays < 14) {
              previousPeriodRegs += countToAdd;
            }
          }
        });
      }
    });

    if (previousPeriodRegs === 0) {
      return currentPeriodRegs > 0 ? "+100%" : "0%";
    }
    const diff = currentPeriodRegs - previousPeriodRegs;
    const pct = Math.round((diff / previousPeriodRegs) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }, [filteredParticipants, selectedFilter, initialGrowthRate, participants]);

  // Compute demographic statistics (Year of Study, Department, College)
  const { activeYearData, activeDeptData, activeCollegeData } = useMemo(() => {
    if (selectedFilter === "ALL" && initialYearData.length > 0 && (!participants || participants.length === 0)) {
      return {
        activeYearData: initialYearData,
        activeDeptData: initialDeptData,
        activeCollegeData: initialCollegeData
      };
    }

    const studentList = filteredParticipants.filter(p => (p.role || 'student').toLowerCase() === 'student' || !p.role);
    const totalCount = studentList.length || 1;

    // 1. Year of study
    const yCounts: Record<string, number> = {};
    studentList.forEach(p => {
      const yr = (p.year_of_study || p.yearOfStudy || '').trim();
      const label = yr ? (yr.includes('Yr') || yr.includes('Year') ? yr : `${yr} Year`) : 'Not Specified';
      yCounts[label] = (yCounts[label] || 0) + 1;
    });

    const yData = Object.entries(yCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalCount) * 100)
    })).sort((a, b) => b.count - a.count);

    // 2. Department Breakdown
    const dCounts: Record<string, number> = {};
    studentList.forEach(p => {
      const dept = (p.department || '').trim().toUpperCase();
      const label = dept || 'NOT SPECIFIED';
      dCounts[label] = (dCounts[label] || 0) + 1;
    });

    const dData = Object.entries(dCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalCount) * 100)
    })).sort((a, b) => b.count - a.count);

    // 3. College Breakdown
    const cCounts: Record<string, number> = {};
    studentList.forEach(p => {
      const col = (p.college || '').trim();
      const label = col || 'Not Specified';
      cCounts[label] = (cCounts[label] || 0) + 1;
    });

    const cData = Object.entries(cCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalCount) * 100)
    })).sort((a, b) => b.count - a.count);

    return {
      activeYearData: yData,
      activeDeptData: dData,
      activeCollegeData: cData
    };
  }, [filteredParticipants, selectedFilter, initialYearData, initialDeptData, initialCollegeData, participants]);

  if (!isMounted) return <div className="h-[300px] w-full bg-[#F8F8FC] animate-pulse rounded-md"></div>;

  const isNegative = activeGrowthRate.startsWith('-');

  return (
    <div className="space-y-6">
      {/* Analytics Scope Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#D9D9DF] p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-eventrix-lavender/20 text-eventrix-lavender">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-eventrix-black uppercase tracking-wider">
                Analytics Report
              </h3>
              <span className="bg-eventrix-lavender/20 text-eventrix-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {filteredParticipants.length} Student{filteredParticipants.length === 1 ? '' : 's'} Enrolled
              </span>
            </div>
            <p className="text-xs text-eventrix-muted font-medium mt-0.5">
              Filtered by: <span className="font-semibold text-eventrix-black">{selectedOption.label}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EventrixSelect
            value={selectedFilter}
            onChange={(val) => setSelectedFilter(val)}
            options={filterOptions}
            searchable
            placeholder="Filter by Event or Fest..."
            size="sm"
            className="w-72"
          />
          {selectedFilter !== "ALL" && (
            <button
              onClick={() => setSelectedFilter("ALL")}
              type="button"
              className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-md uppercase tracking-wider border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
              title="Reset to All Events"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Upper Charts Row: Registration Trends */}
      <div className="w-full">
        {/* Main Registration Chart */}
        <div className="border border-[#D9D9DF] bg-white p-6 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-eventrix-black font-anton tracking-wide">REGISTRATION TRENDS</h3>
              <p className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest">
                Last 7 Days Activity • {selectedOption.label.toUpperCase()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isNegative 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-[#F3F0FF] text-eventrix-lavender border border-purple-200'
            }`}>
              {isNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-eventrix-lavender" />
              )}
              <span>{activeGrowthRate}</span>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080A12', border: 'none', borderRadius: '4px', color: '#fff' }}
                  itemStyle={{ color: '#A78BFA' }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#A78BFA" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Demographics Breakdown Cards (Years, Departments, Colleges) */}
      <div className="border border-[#D9D9DF] bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9D9DF] pb-4">
          <div>
            <h3 className="text-xl font-anton text-eventrix-black tracking-wide uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-eventrix-lavender" /> DEMOGRAPHIC ANALYTICS & BREAKDOWN
            </h3>
            <p className="text-xs text-eventrix-muted font-medium">
              Calculations for: <span className="font-semibold text-eventrix-black">{selectedOption.label}</span> ({filteredParticipants.length} student{filteredParticipants.length === 1 ? '' : 's'})
            </p>
          </div>
          <span className="text-[11px] font-bold text-eventrix-lavender bg-eventrix-lavender/10 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            {selectedFilter === "ALL" ? "Live Database Sync" : `Filtered: ${selectedOption.label}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Year of Study Breakdown */}
          <div className="bg-[#F8F8FC] border border-[#D9D9DF] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D9DF] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-anton text-base text-eventrix-black uppercase tracking-wide">Year of Study</h4>
                  <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest">Student Distribution</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {activeYearData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic py-4 text-center">No student data for this selection.</p>
              ) : (
                activeYearData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-eventrix-black">{item.name}</span>
                      <span className="font-mono text-[11px] font-extrabold text-eventrix-muted">
                        {item.count} student{item.count > 1 ? 's' : ''} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Department Breakdown */}
          <div className="bg-[#F8F8FC] border border-[#D9D9DF] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D9DF] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-anton text-base text-eventrix-black uppercase tracking-wide">Departments</h4>
                  <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest">Branch Wise Share</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {activeDeptData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic py-4 text-center">No department data for this selection.</p>
              ) : (
                activeDeptData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-eventrix-black truncate max-w-[150px]" title={item.name}>{item.name}</span>
                      <span className="font-mono text-[11px] font-extrabold text-eventrix-muted">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: College Breakdown */}
          <div className="bg-[#F8F8FC] border border-[#D9D9DF] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D9DF] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-anton text-base text-eventrix-black uppercase tracking-wide">Colleges</h4>
                  <p className="text-[10px] text-eventrix-muted font-bold uppercase tracking-widest">Top Institutions</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {activeCollegeData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic py-4 text-center">No college data for this selection.</p>
              ) : (
                activeCollegeData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-eventrix-black truncate max-w-[150px]" title={item.name}>{item.name}</span>
                      <span className="font-mono text-[11px] font-extrabold text-eventrix-muted">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
