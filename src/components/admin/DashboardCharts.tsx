"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Users, Ticket, ArrowUpRight, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', registrations: 12 },
  { name: 'Tue', registrations: 19 },
  { name: 'Wed', registrations: 15 },
  { name: 'Thu', registrations: 28 },
  { name: 'Fri', registrations: 22 },
  { name: 'Sat', registrations: 45 },
  { name: 'Sun', registrations: 62 },
];

const activityData = [
  { name: 'Technical', value: 85 },
  { name: 'Non-Technical', value: 65 },
  { name: 'Workshops', value: 30 },
];

export function DashboardCharts({ 
  trendsData = data, 
  popularityData = activityData 
}: { 
  trendsData?: { name: string; registrations: number }[];
  popularityData?: { name: string; value: number }[];
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[300px] w-full bg-[#F8F8FC] animate-pulse rounded-md"></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Registration Chart */}
      <div className="lg:col-span-2 border border-[#D9D9DF] bg-white p-6 rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-eventrix-black font-anton tracking-wide">REGISTRATION TRENDS</h3>
            <p className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest">Last 7 Days Activity</p>
          </div>
          <div className="bg-[#F3F0FF] text-eventrix-lavender px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24%
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
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
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
              <XAxis type="number" hide />
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
  );
}
