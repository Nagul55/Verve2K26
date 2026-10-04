"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, GraduationCap, Building2, Calendar, Award } from 'lucide-react';

interface DemographicItem {
  name: string;
  count: number;
  percentage: number;
}

interface DashboardChartsProps {
  trendsData?: { name: string; registrations: number }[];
  popularityData?: { name: string; value: number }[];
  growthRate?: string;
  yearData?: DemographicItem[];
  deptData?: DemographicItem[];
  collegeData?: DemographicItem[];
}

export function DashboardCharts({ 
  trendsData = [], 
  popularityData = [],
  growthRate = "+0%",
  yearData = [],
  deptData = [],
  collegeData = []
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[300px] w-full bg-[#F8F8FC] animate-pulse rounded-md"></div>;

  const isNegative = growthRate.startsWith('-');

  return (
    <div className="space-y-6">
      {/* Upper Charts Row: Registration Trends & Event Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Registration Chart */}
        <div className="lg:col-span-2 border border-[#D9D9DF] bg-white p-6 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-eventrix-black font-anton tracking-wide">REGISTRATION TRENDS</h3>
              <p className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest">Last 7 Days Activity</p>
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
              <span>{growthRate}</span>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Category Distribution Chart */}
        <div className="border border-[#D9D9DF] bg-white p-6 rounded-md shadow-sm">
          <h3 className="text-lg font-bold text-eventrix-black font-anton tracking-wide mb-1">EVENT POPULARITY</h3>
          <p className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest mb-6">By Category</p>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#080A12', border: 'none', borderRadius: '4px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#080A12" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
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
            <p className="text-xs text-eventrix-muted font-medium">Real-time calculations computed from registered student accounts.</p>
          </div>
          <span className="text-[11px] font-bold text-eventrix-lavender bg-eventrix-lavender/10 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            Live Database Sync
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
              {yearData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic">No year data recorded yet.</p>
              ) : (
                yearData.map((item, idx) => (
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
              {deptData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic">No department data recorded yet.</p>
              ) : (
                deptData.slice(0, 5).map((item, idx) => (
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
              {collegeData.length === 0 ? (
                <p className="text-xs text-eventrix-muted italic">No college data recorded yet.</p>
              ) : (
                collegeData.slice(0, 5).map((item, idx) => (
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
