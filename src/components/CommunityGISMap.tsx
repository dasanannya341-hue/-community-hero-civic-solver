/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Map, 
  Layers, 
  MapPin, 
  Radio, 
  Activity, 
  Sliders, 
  Sparkles, 
  Eye, 
  Navigation, 
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { Issue, IssuePriority, IssueStatus } from '../types';

export const CommunityGISMap: React.FC = () => {
  const { issues, currentUser, toggleUpvote } = useApp();

  // Mapping state controls
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [radiusFilter, setRadiusFilter] = useState<number>(3); // radius in km (0.5 to 5km)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(issues[0]?.id || null);
  
  // Simulated GPS position of the user
  const userGPS = { lat: 37.774929, lng: -122.419416 }; // Central Anchor

  // SVG coordinate mapping bounds
  // We'll map Latitude and Longitude to a 1000 x 600 Cartesian grid canvas
  const mapBounds = {
    minLat: 37.750,
    maxLat: 37.800,
    minLng: -122.450,
    maxLng: -122.390
  };

  const getCanvasCoordinates = (lat: number, lng: number) => {
    // Lat to Y (inverse because Y goes down in SVG)
    const latPct = (lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat);
    const y = 600 - (latPct * 600);

    // Lng to X
    const lngPct = (lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng);
    const x = lngPct * 1000;

    return { 
      x: isNaN(x) ? 500 : Math.max(20, Math.min(980, x)), 
      y: isNaN(y) ? 300 : Math.max(20, Math.min(580, y)) 
    };
  };

  // Distance calculating utility (Haversine formula approximation)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter issues based on nearby radius selection
  const nearbyFilteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const distance = calculateDistance(
        userGPS.lat,
        userGPS.lng,
        issue.location.lat,
        issue.location.lng
      );
      return distance <= radiusFilter;
    });
  }, [issues, radiusFilter]);

  // Priority color markers configuration
  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return { pin: '#EF4444', ring: 'rgba(239, 68, 68, 0.4)', bg: 'bg-red-500' };
      case 'high':
        return { pin: '#F97316', ring: 'rgba(249, 115, 22, 0.4)', bg: 'bg-orange-500' };
      case 'medium':
        return { pin: '#EAB308', ring: 'rgba(234, 179, 8, 0.4)', bg: 'bg-yellow-500' };
      case 'low':
        return { pin: '#10B981', ring: 'rgba(16, 185, 129, 0.4)', bg: 'bg-emerald-500' };
    }
  };

  // Grouping issues into Grid Clusters (Heuristic representation for SVG)
  const mappedClusters = useMemo(() => {
    const clusters: { x: number; y: number; issues: Issue[]; id: string }[] = [];
    
    nearbyFilteredIssues.forEach((issue) => {
      const coords = getCanvasCoordinates(issue.location.lat, issue.location.lng);
      
      // Look for any existing cluster within a 60px SVG distance
      let placed = false;
      for (const cl of clusters) {
        const d = Math.hypot(cl.x - coords.x, cl.y - coords.y);
        if (d < 65) {
          cl.issues.push(issue);
          // Recalculate centroid slightly
          cl.x = (cl.x + coords.x) / 2;
          cl.y = (cl.y + coords.y) / 2;
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        clusters.push({
          x: coords.x,
          y: coords.y,
          issues: [issue],
          id: `cluster_${issue.id}`
        });
      }
    });

    return clusters;
  }, [nearbyFilteredIssues]);

  // Selected issue reference
  const activeIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Map Control Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spatial Map Canvas Column (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* GIS Filters and Toggle Bar */}
          <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4.5 w-4.5 text-natural-sage" />
              <span className="text-xs font-bold text-natural-text uppercase tracking-wider">Map GIS Overlays</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Heatmap Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowHeatmap(!showHeatmap);
                  if (showHeatmap === false) setShowClusters(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                  showHeatmap 
                    ? 'bg-orange-50 text-orange-700 border-orange-200' 
                    : 'bg-white text-natural-muted border-natural-border'
                }`}
              >
                🔥 AI Hotspot Heatmap
              </button>

              {/* Clustering Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowClusters(!showClusters);
                  if (showClusters === false) setShowHeatmap(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                  showClusters 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-natural-muted border-natural-border'
                }`}
              >
                👥 Marker Clustering
              </button>

              {/* Proximity Radius Slider */}
              <div className="flex items-center gap-2 border-l border-natural-border pl-3">
                <span className="text-[10px] text-natural-muted font-bold uppercase">Radius ({radiusFilter}km)</span>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(parseFloat(e.target.value))}
                  className="w-24 accent-natural-sage"
                />
              </div>
            </div>
          </div>

          {/* Interactive Spatial SVG Map Canvas */}
          <div className="relative aspect-[1000/600] w-full rounded-2xl border border-natural-border bg-slate-50 overflow-hidden shadow-sm select-none">
            
            {/* GIS Map background layers */}
            <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full">
              {/* Waterway canal (San Francisco Bay mockup) */}
              <path d="M0 120 C 300 180, 500 50, 1000 80 L 1000 0 L 0 0 Z" fill="#e0f2fe" opacity="0.8" />
              <text x="80" y="50" fill="#0369a1" fontSize="11" fontWeight="bold" className="italic font-sans pointer-events-none">Metropolis Marina Base</text>

              {/* Neighborhood green park district */}
              <rect x="180" y="220" width="160" height="200" rx="15" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="2" />
              <text x="260" y="320" textAnchor="middle" fill="#15803d" fontSize="10" fontWeight="bold" className="font-sans pointer-events-none">Metropolis Central Park</text>

              {/* Grid block layouts representing roads and building segments */}
              <g stroke="#94a3b8" strokeWidth="1" opacity="0.15" strokeDasharray="3 3">
                <line x1="0" y1="100" x2="1000" y2="100" />
                <line x1="0" y1="200" x2="1000" y2="200" />
                <line x1="0" y1="300" x2="1000" y2="300" />
                <line x1="0" y1="400" x2="1000" y2="400" />
                <line x1="0" y1="500" x2="1000" y2="500" />

                <line x1="150" y1="0" x2="150" y2="600" />
                <line x1="300" y1="0" x2="300" y2="600" />
                <line x1="450" y1="0" x2="450" y2="600" />
                <line x1="600" y1="0" x2="600" y2="600" />
                <line x1="750" y1="0" x2="750" y2="600" />
                <line x1="900" y1="0" x2="900" y2="600" />
              </g>

              {/* Key major street arteries */}
              <g stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" opacity="0.6">
                <path d="M 50 500 L 950 500" /> {/* Main Boulevard */}
                <path d="M 500 80 L 500 550" /> {/* Civic Avenue */}
                <path d="M 120 180 L 880 420" strokeWidth="8" /> {/* Diagonal Roadway */}
              </g>
              <g stroke="#ffffff" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" opacity="0.8">
                <path d="M 50 500 L 950 500" />
                <path d="M 500 80 L 500 550" />
              </g>

              {/* Text street indicators */}
              <text x="800" y="492" fill="#475569" fontSize="9" fontWeight="bold" className="font-mono uppercase pointer-events-none tracking-wider">Main Civic Blvd</text>
              <text x="510" y="150" fill="#475569" fontSize="9" fontWeight="bold" className="font-mono uppercase pointer-events-none tracking-wider rotate-90 origin-left">5th Avenue Way</text>

              {/* Simulated GPS Home Anchor of User */}
              <g>
                {/* Geolocation anchor */}
                <circle cx="500" cy="300" r="18" fill="rgba(74, 103, 72, 0.15)" className="animate-ping" />
                <circle cx="500" cy="300" r="8" fill="#4A6748" stroke="#ffffff" strokeWidth="2" />
                <circle cx="500" cy="300" r="2.5" fill="#ffffff" />
              </g>

              {/* PROXIMITY RADIUS FILTER OVERLAY */}
              {/* Maps visually the selected radius limit onto coordinate grid */}
              <circle 
                cx="500" 
                cy="300" 
                r={radiusFilter * 85} 
                fill="rgba(74, 103, 72, 0.03)" 
                stroke="#4A6748" 
                strokeWidth="1.5" 
                strokeDasharray="6 4" 
                className="transition-all duration-300"
              />

              {/* HEATMAP LAYER: Radial glow gradient clouds centered on reports */}
              {showHeatmap && !showClusters && (
                <g opacity="0.75">
                  {nearbyFilteredIssues.map((issue) => {
                    const coords = getCanvasCoordinates(issue.location.lat, issue.location.lng);
                    const prioColor = getPriorityColor(issue.priority);
                    return (
                      <g key={`heat_${issue.id}`}>
                        <defs>
                          <radialGradient id={`grad_${issue.id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={prioColor.pin} stopOpacity="0.8" />
                            <stop offset="50%" stopColor={prioColor.pin} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={prioColor.pin} stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <circle cx={coords.x} cy={coords.y} r="55" fill={`url(#grad_${issue.id})`} />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* STANDARD PIN MARKERS LAYER */}
              {!showClusters && nearbyFilteredIssues.map((issue) => {
                const coords = getCanvasCoordinates(issue.location.lat, issue.location.lng);
                const isSelected = issue.id === selectedIssueId;
                const colorInfo = getPriorityColor(issue.priority);

                return (
                  <g 
                    key={issue.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    {/* Ring highlight on selection */}
                    {isSelected && (
                      <circle cx={coords.x} cy={coords.y} r="18" fill="none" stroke="#2D362E" strokeWidth="1.5" className="animate-pulse" />
                    )}
                    
                    {/* Pulsing warning ring */}
                    <circle cx={coords.x} cy={coords.y} r="12" fill={colorInfo.ring} />

                    {/* Colored Solid Pin */}
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r={isSelected ? "7" : "5"} 
                      fill={colorInfo.pin} 
                      stroke="#ffffff" 
                      strokeWidth="1.5"
                      className="transition-all duration-200 group-hover:scale-125"
                    />

                    {/* Tiny text overlay label */}
                    {isSelected && (
                      <g transform={`translate(${coords.x}, ${coords.y - 12})`}>
                        <rect x="-60" y="-14" width="120" height="18" rx="4" fill="#1e293b" opacity="0.9" />
                        <text x="0" y="-2" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="semibold" className="font-sans">
                          {issue.title.substring(0, 18)}...
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* MARKER CLUSTERS LAYER */}
              {showClusters && mappedClusters.map((cl) => {
                const isClusterMulti = cl.issues.length > 1;
                const isSelected = cl.issues.some((i) => i.id === selectedIssueId);

                if (!isClusterMulti) {
                  // Fallback to simple single marker pin
                  const issue = cl.issues[0];
                  const coords = getCanvasCoordinates(issue.location.lat, issue.location.lng);
                  const colorInfo = getPriorityColor(issue.priority);
                  return (
                    <g 
                      key={cl.id} 
                      className="cursor-pointer group" 
                      onClick={() => setSelectedIssueId(issue.id)}
                    >
                      <circle cx={coords.x} cy={coords.y} r="11" fill={colorInfo.ring} />
                      <circle cx={coords.x} cy={coords.y} r="5" fill={colorInfo.pin} stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  );
                }

                // Render high quality grouped bubble
                return (
                  <g 
                    key={cl.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedIssueId(cl.issues[0].id);
                    }}
                  >
                    <circle cx={cl.x} cy={cl.y} r="20" fill="rgba(37, 99, 235, 0.15)" />
                    <circle cx={cl.x} cy={cl.y} r="13" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <text 
                      x={cl.x} 
                      y={cl.y + 3.5} 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize="9.5" 
                      fontWeight="extrabold"
                      className="font-mono pointer-events-none"
                    >
                      {cl.issues.length}
                    </text>
                  </g>
                );
              })}

            </svg>

            {/* Simulated Live Compass Indicator */}
            <div className="absolute top-4 left-4 rounded-xl bg-white/90 backdrop-blur-md border border-natural-border p-3 flex items-center gap-2 pointer-events-none">
              <Navigation className="h-4 w-4 text-natural-sage rotate-45 shrink-0" />
              <div className="text-left leading-none">
                <p className="text-[10px] font-bold text-natural-muted uppercase">Anchor Center</p>
                <p className="text-[11px] font-mono font-bold text-natural-text mt-0.5">37.77° N, 122.41° W</p>
              </div>
            </div>

            {/* Marker Color Legend */}
            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 backdrop-blur border border-natural-border p-3 flex flex-col gap-1.5 pointer-events-none text-[10px] font-semibold text-natural-text">
              <span className="text-[8px] font-bold text-natural-muted uppercase block border-b border-natural-sand pb-1 mb-0.5">Priority Map Pins</span>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-500" /><span>Critical</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500" /><span>High Priority</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-yellow-400" /><span>Medium Priority</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span>Low Priority</span></div>
            </div>

          </div>

          {/* Map details footer indicator */}
          <div className="rounded-xl border border-natural-sage/20 bg-natural-sage-light/15 p-3 flex items-center gap-2 text-xs text-natural-sage-dark">
            <Info className="h-4 w-4 text-natural-sage shrink-0" />
            <p>
              Currently showing <strong>{nearbyFilteredIssues.length} issues</strong> within a **{radiusFilter}km radius** from your simulated GPS headquarters.
            </p>
          </div>

        </div>

        {/* Selected Issue Inspector Sidebar (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col">
          {activeIssue ? (
            <div className="rounded-2xl border border-natural-border bg-white shadow-sm overflow-hidden flex flex-col h-[480px] lg:h-full text-left">
              
              {/* Header block */}
              <div className="border-b border-natural-border bg-gradient-to-r from-natural-sand to-white p-4">
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                  activeIssue.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
                  activeIssue.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                  activeIssue.priority === 'medium' ? 'bg-yellow-50 text-yellow-800 border-yellow-100' :
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {activeIssue.priority} Priority
                </span>
                <h4 className="text-sm font-bold text-natural-text mt-2 leading-snug line-clamp-2">
                  {activeIssue.title}
                </h4>
                <p className="text-[10px] text-natural-muted font-mono mt-1 truncate">
                  📍 {activeIssue.location.address}
                </p>
              </div>

              {/* Main Info */}
              <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                
                {/* Photo proof */}
                {activeIssue.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-natural-border max-h-32">
                    <img 
                      src={activeIssue.imageUrl} 
                      alt="gis-pin-proof" 
                      className="w-full object-cover max-h-32 hover:scale-105 transition-all" 
                    />
                  </div>
                )}

                <div>
                  <h5 className="text-[10px] font-bold text-natural-muted uppercase tracking-wider mb-1">Issue Description</h5>
                  <p className="text-xs text-natural-text leading-relaxed line-clamp-4">
                    {activeIssue.description}
                  </p>
                </div>

                {/* AI Hotspot classification details */}
                <div className="rounded-xl border border-natural-sage/10 bg-natural-sage-light/20 p-3 space-y-1.5">
                  <span className="text-[8px] font-bold text-natural-sage-dark uppercase tracking-widest block flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Hotspot Diagnostics</span>
                  </span>
                  
                  <div className="flex items-center justify-between text-xs text-natural-text">
                    <span className="text-natural-muted">Suggested Dispatch:</span>
                    <strong className="font-semibold text-natural-text leading-none">{activeIssue.suggestedAuthority || 'Public Works Division'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs text-natural-text">
                    <span className="text-natural-muted">Resolution ETA:</span>
                    <strong className="font-mono text-natural-sage-dark">{activeIssue.analytics?.resolutionETA || '48 Hours'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs text-natural-text">
                    <span className="text-natural-muted">Area Health Impact:</span>
                    <strong className="font-mono text-rose-500">{activeIssue.analytics?.areaHealthScore || '55'}/100 Risk</strong>
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="border-t border-natural-border bg-natural-sand/30 p-3.5 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-natural-muted font-mono">
                  Report ID: {activeIssue.id.substring(0, 11)}
                </span>

                <button
                  onClick={() => toggleUpvote(activeIssue.id)}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                    currentUser && activeIssue.upvotes.includes(currentUser.id)
                      ? 'bg-natural-sage-light border-natural-sage/30 text-natural-sage-dark'
                      : 'bg-white border-natural-border text-natural-muted hover:bg-natural-sand'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Support ({activeIssue.upvotes.length})</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-natural-border bg-white p-12 text-center text-natural-muted flex h-full items-center justify-center">
              <div>
                <MapPin className="mx-auto h-8 w-8 text-natural-muted/60 mb-2" />
                <h4 className="text-xs font-bold text-natural-text uppercase tracking-wider">Spatial Inspector</h4>
                <p className="text-xs text-natural-muted mt-1 max-w-xs">
                  Click on any incident marker pin inside the GIS coordinate map to inspect real-time diagnostics.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
