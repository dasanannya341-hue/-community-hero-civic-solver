/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Heart, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { IssueCategory } from '../types';

export const AnalyticsStats: React.FC = () => {
  const { stats, loading } = useApp();

  if (loading || !stats) {
    return (
      <div className="rounded-2xl border border-natural-border bg-white p-12 text-center">
        <Activity className="mx-auto h-8 w-8 animate-spin text-natural-sage mb-2.5" />
        <h3 className="text-sm font-semibold text-natural-text">Analyzing neighborhood metrics...</h3>
        <p className="text-xs text-natural-muted mt-1">Aggregating reported parameters and predicting smart city analytics...</p>
      </div>
    );
  }

  // Map category keys to human-readable strings
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      garbage: 'Garbage Management',
      road_damage: 'Road / Potholes',
      water_leakage: 'Water Leakage',
      streetlight: 'Streetlights',
      drainage: 'Drainage',
      public_safety: 'Public Safety',
      stray_animals: 'Stray Animals',
      environmental: 'Environmental',
      community_request: 'Community Requests',
      infrastructure: 'Infrastructure',
      emergency: 'Emergency Issues'
    };
    return labels[category] || category;
  };

  const categories = Object.keys(stats.categoryDistribution) as IssueCategory[];
  const maxCategoryCount = Math.max(...(Object.values(stats.categoryDistribution) as number[]), 1);

  // SVG Trend Chart Helpers
  const chartHeight = 120;
  const chartWidth = 450;
  const padding = 25;
  const points = stats.monthlyTrends;
  const maxVal = Math.max(...points.map((p) => Math.max(p.reported, p.resolved)), 1);

  const getCoordinates = (index: number, val: number) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (points.length - 1);
    const y = chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxVal;
    return { x, y };
  };

  // Generate SVG Path Strings for reported and resolved lines
  const reportedPath = points.map((p, i) => {
    const { x, y } = getCoordinates(i, p.reported);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const resolvedPath = points.map((p, i) => {
    const { x, y } = getCoordinates(i, p.resolved);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      
      {/* Smart City Health Header */}
      <div className="rounded-2xl border border-natural-sage/20 bg-gradient-to-r from-[#2D362E] to-[#3A453B] p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-natural-sage" />
            <span>Civic AI Analytics & Dashboard</span>
          </h2>
          <p className="text-xs text-natural-cream/80 max-w-xl">
            Real-time neighborhood monitoring, predictive resolution timeframes, and smart duplicates clustering computed server-side.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
          <Heart className="h-8 w-8 text-natural-coral shrink-0" />
          <div className="text-left">
            <span className="text-[10px] text-natural-cream/70 block uppercase font-bold">Neighborhood Health Score</span>
            <strong className="text-2xl font-extrabold tracking-tight text-white">{stats.averageHealthScore} / 100</strong>
            <span className="text-[9px] text-natural-sage block font-semibold mt-0.5">Satisfactory Grade</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        
        <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-natural-sage-light text-natural-sage-dark shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] text-natural-muted block uppercase font-bold truncate">Total Reported</span>
            <strong className="text-lg sm:text-xl font-bold text-natural-text block truncate">{stats.totalIssues} Issues</strong>
            <span className="text-[10px] text-natural-sage block mt-0.5 font-medium truncate">Hyperlocal Incidents</span>
          </div>
        </div>

        <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F3E7] text-[#4A6748] shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] text-natural-muted block uppercase font-bold truncate">Resolved & Closed</span>
            <strong className="text-lg sm:text-xl font-bold text-natural-text block truncate">{stats.resolvedIssues} Resolved</strong>
            <span className="text-[10px] text-natural-sage block mt-0.5 font-medium truncate">
              {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}% success rate
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-natural-sage-light text-natural-sage-dark shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] text-natural-muted block uppercase font-bold truncate">Active Volunteers</span>
            <strong className="text-lg sm:text-xl font-bold text-natural-text block truncate">{stats.activeVolunteers} Heroes</strong>
            <span className="text-[10px] text-natural-sage-dark block mt-0.5 font-medium truncate">Deployable Squads</span>
          </div>
        </div>

        <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDF1E7] text-[#A6754B] shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] text-natural-muted block uppercase font-bold truncate">Average Response</span>
            <strong className="text-lg sm:text-xl font-bold text-natural-text block truncate">22.5 Hours</strong>
            <span className="text-[10px] text-[#A6754B] block mt-0.5 font-medium truncate font-sans">Resolution Speed</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Categories Distribution and Monthly Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Categories distribution bar counts */}
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm lg:col-span-6">
          <div className="mb-4 flex items-center gap-2 border-b border-natural-border pb-3">
            <BarChart3 className="h-5 w-5 text-natural-sage-dark" />
            <div>
              <h3 className="text-sm font-bold text-natural-text tracking-tight">Report Distribution by Category</h3>
              <p className="text-[10px] text-natural-muted">Categorization extracted automatically via Gemini AI</p>
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const count = stats.categoryDistribution[cat] || 0;
              const pct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-natural-text">
                    <span className="capitalize">{getCategoryLabel(cat)}</span>
                    <span className="font-mono text-natural-muted">{count} reports</span>
                  </div>
                  <div className="h-2 w-full bg-natural-sand rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-natural-sage rounded-full"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic resolution trends Line Chart (Custom responsive SVG) */}
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm lg:col-span-6 flex flex-col">
          <div className="mb-4 flex items-center gap-2 border-b border-natural-border pb-3 shrink-0">
            <TrendingUp className="h-5 w-5 text-natural-sage-dark" />
            <div>
              <h3 className="text-sm font-bold text-natural-text tracking-tight">Monthly Resolution Trend Analysis</h3>
              <p className="text-[10px] text-natural-muted">Report intake vs resolved operations</p>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] flex items-center justify-center p-2">
            <div className="w-full h-full relative">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible"
              >
                {/* Background Grid Lines */}
                <line x1={padding} y1={padding} x2={chartWidth-padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight/2} x2={chartWidth-padding} y2={chartHeight/2} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight-padding} x2={chartWidth-padding} y2={chartHeight-padding} stroke="#e2e8f0" strokeWidth="1" />

                {/* Intake (Reported) Line */}
                <path
                  d={reportedPath}
                  fill="none"
                  stroke="#4A6748"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Resolution (Resolved) Line */}
                <path
                  d={resolvedPath}
                  fill="none"
                  stroke="#C45E3A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 3"
                />

                {/* Trend Points markers */}
                {points.map((p, i) => {
                  const rCoords = getCoordinates(i, p.reported);
                  const resCoords = getCoordinates(i, p.resolved);
                  return (
                    <g key={i}>
                      {/* Reported circles */}
                      <circle cx={rCoords.x} cy={rCoords.y} r="4" fill="#4A6748" stroke="#ffffff" strokeWidth="1.5" />
                      {/* Resolved circles */}
                      <circle cx={resCoords.x} cy={resCoords.y} r="4" fill="#C45E3A" stroke="#ffffff" strokeWidth="1.5" />
                      
                      {/* Month Label */}
                      <text
                        x={rCoords.x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="bold"
                        className="font-mono"
                      >
                        {p.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Chart Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs font-semibold">
                <div className="flex items-center gap-2 text-natural-sage-dark">
                  <div className="h-3 w-3 bg-[#4A6748] rounded-full" />
                  <span>Reported Issues</span>
                </div>
                <div className="flex items-center gap-2 text-[#C45E3A]">
                  <div className="h-3 w-3 bg-[#C45E3A] rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />
                  <span>Resolved & Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hotspots Card list */}
      <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-natural-border pb-3">
          <MapPin className="h-5 w-5 text-natural-sage-dark" />
          <div>
            <h3 className="text-sm font-bold text-natural-text tracking-tight">Local Critical Hotspots Identification</h3>
            <p className="text-[10px] text-natural-muted">Hyperlocal addresses attracting critical citizen attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.hotspots.map((h, i) => (
            <div key={i} className="flex gap-3.5 items-center rounded-xl border border-natural-border bg-natural-sand/40 p-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-natural-sage-light text-xs font-bold text-natural-sage-dark">
                #{i+1}
              </span>
              <div className="flex-1 text-left min-w-0">
                <h4 className="text-xs font-bold text-natural-text truncate">{h.name}</h4>
                <p className="text-[10px] text-natural-muted mt-0.5 font-mono">Severity Priority: {h.issueCount} Upvotes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
