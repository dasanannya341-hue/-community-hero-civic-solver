/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Send,
  Calendar,
  X,
  AlertOctagon,
  Wrench,
  Search,
  Sparkles,
  Upload,
  Camera
} from 'lucide-react';
import { Issue, IssueCategory, IssueStatus, IssuePriority } from '../types';

export const DashboardMap: React.FC = () => {
  const { 
    issues, 
    currentUser, 
    toggleUpvote, 
    toggleVolunteer, 
    addComment, 
    updateIssueStatus 
  } = useApp();

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(issues[0] || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');

  // Dispatch console states
  const [statusComment, setStatusComment] = useState<string>('');
  const [resolutionImage, setResolutionImage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Handle category mapping labels
  const getCategoryBadge = (category: IssueCategory) => {
    const maps: Record<IssueCategory, { label: string; bg: string; text: string }> = {
      garbage: { label: 'Garbage Management', bg: 'bg-natural-sand border-natural-border', text: 'text-natural-text' },
      road_damage: { label: 'Road Damage / Potholes', bg: 'bg-orange-50 border-orange-100', text: 'text-natural-coral' },
      water_leakage: { label: 'Water Leakage', bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-800' },
      streetlight: { label: 'Streetlight Failure', bg: 'bg-amber-50 border-amber-100', text: 'text-natural-ochre' },
      drainage: { label: 'Drainage Problem', bg: 'bg-teal-50 border-teal-100', text: 'text-teal-800' },
      public_safety: { label: 'Public Safety Hazard', bg: 'bg-red-50 border-red-100', text: 'text-red-800' },
      stray_animals: { label: 'Stray Animal Issue', bg: 'bg-natural-sage-light border-natural-sage/20', text: 'text-natural-sage-dark' },
      environmental: { label: 'Environmental Concern', bg: 'bg-natural-sage-light border-natural-sage/30', text: 'text-natural-sage-dark font-semibold' },
      community_request: { label: 'Community Request', bg: 'bg-natural-sand border-natural-border', text: 'text-natural-text' },
      infrastructure: { label: 'Infrastructure Problem', bg: 'bg-natural-sand border-natural-border', text: 'text-natural-muted' },
      emergency: { label: 'Emergency Threat', bg: 'bg-red-50 border-red-100 text-red-800', text: 'text-red-900' }
    };
    return maps[category] || { label: category, bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-[#C45E3A] border-red-100';
      case 'high':
        return 'bg-[#FDF1E7] text-[#A6754B] border-[#F0E2D5]';
      case 'medium':
        return 'bg-[#E8F3E7] text-[#4A6748] border-[#DCEAD9]';
      case 'low':
        return 'bg-[#F0F2F0] text-[#7A827B] border-[#E2E8E4]';
    }
  };

  const getStatusLabel = (status: IssueStatus) => {
    switch (status) {
      case 'reported':
        return { text: 'Reported', color: 'bg-natural-sand text-natural-muted border-natural-border' };
      case 'investigating':
        return { text: 'Investigating', color: 'bg-[#FDF1E7] text-[#A6754B] border-[#F0E2D5]' };
      case 'in_progress':
        return { text: 'In Progress', color: 'bg-blue-50 text-blue-800 border-blue-100' };
      case 'resolved':
        return { text: 'Resolved & Closed', color: 'bg-natural-sage-light text-natural-sage-dark border-natural-sage/30' };
      case 'archived':
        return { text: 'Archived', color: 'bg-natural-sand text-natural-muted border-natural-border' };
    }
  };

  // Filter list
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssue) return;
    addComment(selectedIssue.id, commentText);
    setCommentText('');
  };

  // Safe selection reference
  const activeIssue = issues.find(i => i.id === selectedIssue?.id) || selectedIssue || issues[0] || null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Search & Filter & Incident List: Column 1 */}
      <div className="flex flex-col gap-4 lg:col-span-5">
        
        {/* Search and Filters Bento Card */}
        <div className="rounded-2xl border border-natural-border bg-white p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute top-3 left-3 h-4 w-4 text-natural-muted" />
            <input
              type="text"
              placeholder="Search reports by address, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-natural-border py-2.5 pr-4 pl-10 text-sm focus:border-natural-sage focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-natural-muted uppercase tracking-wider block mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-lg border border-natural-border bg-natural-sand py-1.5 px-2 text-xs font-medium focus:border-natural-sage focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="garbage">Garbage</option>
                <option value="road_damage">Road Damage</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="streetlight">Streetlight</option>
                <option value="drainage">Drainage</option>
                <option value="public_safety">Public Safety</option>
                <option value="stray_animals">Strays</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-natural-muted uppercase tracking-wider block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-natural-border bg-natural-sand py-1.5 px-2 text-xs font-medium focus:border-natural-sage focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="investigating">Investigating</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of active neighborhood issues */}
        <div className="flex-1 rounded-2xl border border-natural-border bg-white p-4 shadow-sm max-h-[550px] overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-natural-text tracking-tight flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-natural-sage" />
              <span>Hyperlocal Reports ({filteredIssues.length})</span>
            </h2>
            <span className="text-[10px] font-mono bg-natural-sage-light text-natural-sage-dark px-2 py-0.5 rounded-full font-bold">
              Live Feed
            </span>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-natural-muted">
              <MapPin className="mx-auto h-8 w-8 text-natural-muted/60 mb-2" />
              <p className="text-sm">No neighborhood reports found matching filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const isSelected = activeIssue?.id === issue.id;
                const catInfo = getCategoryBadge(issue.category);
                const statusInfo = getStatusLabel(issue.status);
                
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-natural-sage bg-natural-sage-light/25 shadow-sm'
                        : 'border-natural-border bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${catInfo.bg} ${catInfo.text}`}>
                        {catInfo.label}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-natural-text leading-snug line-clamp-1 mb-1">
                      {issue.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-natural-muted mb-2.5">
                      <MapPin className="h-3.5 w-3.5 text-natural-sage shrink-0" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-natural-border/50 pt-2 text-[11px] font-medium text-natural-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-natural-muted/60" />
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-natural-muted/60" /> {issue.upvotes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-natural-muted/60" /> {issue.comments.length}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 font-bold uppercase text-[8px] ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Panel: Column 2 */}
      <div className="lg:col-span-7">
        {activeIssue ? (
          <div className="rounded-2xl border border-natural-border bg-white shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* Header Section */}
            <div className="border-b border-natural-border bg-gradient-to-r from-natural-sand to-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getCategoryBadge(activeIssue.category).bg} ${getCategoryBadge(activeIssue.category).text}`}>
                    {getCategoryBadge(activeIssue.category).label}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getPriorityBadge(activeIssue.priority)}`}>
                    {activeIssue.priority} Priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-natural-muted font-mono">ID: {activeIssue.id}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusLabel(activeIssue.status).color}`}>
                    {getStatusLabel(activeIssue.status).text}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-natural-text tracking-tight leading-snug mb-2">
                {activeIssue.title}
              </h2>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-natural-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-natural-sage shrink-0" />
                  <span className="font-medium text-natural-text">{activeIssue.location.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-natural-muted/60" />
                  <span>Reported by <strong>{activeIssue.reporterName}</strong> on {new Date(activeIssue.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Layout Split: Details and AI Predictions */}
            <div className="p-5 flex-1 space-y-5 overflow-y-auto max-h-[480px]">
              
              {/* Optional reported photo / multi-image gallery */}
              {activeIssue.imageUrls && activeIssue.imageUrls.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden max-h-60 border border-natural-border bg-natural-sand flex items-center justify-center">
                    <img
                      referrerPolicy="no-referrer"
                      src={activeIssue.imageUrl || activeIssue.imageUrls[0]}
                      alt="Primary proof"
                      className="max-h-60 object-contain w-full"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#2D362E]/90 backdrop-blur-md text-natural-cream font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      Primary Proof Image
                    </div>
                  </div>
                  
                  {activeIssue.imageUrls.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-natural-muted uppercase tracking-wider block">Additional proof attachments ({activeIssue.imageUrls.length})</span>
                      <div className="flex gap-2 overflow-x-auto pb-1.5">
                        {activeIssue.imageUrls.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            alt={`proof-${i}`}
                            className="h-14 w-18 rounded-lg object-cover border border-natural-border shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all" 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeIssue.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden max-h-56 border border-natural-border bg-natural-sand">
                  <img
                    referrerPolicy="no-referrer"
                    src={activeIssue.imageUrl}
                    alt="Hyperlocal Issue Proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#2D362E]/90 backdrop-blur-md text-natural-cream font-mono text-[9px] px-2 py-1 rounded font-bold uppercase">
                    Captured Incident Image
                  </div>
                </div>
              ) : null}

              {/* Before/After physical resolution comparison */}
              {activeIssue.beforeAfterImages && (activeIssue.beforeAfterImages.beforeUrl || activeIssue.beforeAfterImages.afterUrl) && (
                <div className="rounded-xl border border-natural-border bg-natural-sand/20 p-4 space-y-3">
                  <span className="text-xs font-bold text-natural-text uppercase tracking-wider block">Incident Progress Visualizer</span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-natural-coral uppercase">Before (Incident)</span>
                      <img 
                        src={activeIssue.beforeAfterImages.beforeUrl || activeIssue.imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300'} 
                        className="h-32 w-full object-cover rounded-lg border border-natural-border" 
                        alt="Before comparison"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-natural-sage-dark uppercase">After (Resolved Result)</span>
                      {activeIssue.beforeAfterImages.afterUrl ? (
                        <img 
                          src={activeIssue.beforeAfterImages.afterUrl} 
                          className="h-32 w-full object-cover rounded-lg border-2 border-natural-sage/40" 
                          alt="After comparison"
                        />
                      ) : (
                        <div className="h-32 w-full bg-natural-sand/40 border border-dashed border-natural-border rounded-lg flex flex-col items-center justify-center text-center p-3 text-natural-muted">
                          <span className="text-[10px] italic leading-normal">Resolution proof photograph will be published once the dispatched authority marks this as [Resolved]</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen description of the incident */}
              <div>
                <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-2">Incident Description</h3>
                <p className="text-sm text-natural-text leading-relaxed bg-natural-sand/50 rounded-xl p-4 border border-natural-border/40">
                  {activeIssue.description}
                </p>
              </div>

              {/* Gemini Smart City Predictive Analytics Grid */}
              <div>
                <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-3">AI Smart City Analytics</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-natural-border bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-natural-muted uppercase tracking-wider mb-1">Smart Priority</p>
                    <p className="text-lg font-bold text-natural-sage-dark">{activeIssue.analytics.smartPriorityIndex}/100</p>
                    <div className="mt-1 h-1.5 w-full bg-natural-sand rounded-full overflow-hidden">
                      <div className="h-full bg-natural-sage" style={{ width: `${activeIssue.analytics.smartPriorityIndex}%` }} />
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-natural-border bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-natural-muted uppercase tracking-wider mb-1">Resolution ETA</p>
                    <p className="text-sm font-extrabold text-natural-text leading-none mt-1.5">{activeIssue.analytics.resolutionETA}</p>
                    <span className="text-[9px] text-natural-sage font-semibold mt-1 inline-block">Predicted Action</span>
                  </div>

                  <div className="rounded-xl border border-natural-border bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-natural-muted uppercase tracking-wider mb-1">Escalation Risk</p>
                    <p className={`text-xs font-extrabold uppercase mt-1 px-1.5 py-0.5 rounded inline-block ${
                      activeIssue.analytics.escalationRisk === 'high' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-natural-sage-light text-natural-sage-dark border border-natural-sage/20'
                    }`}>
                      {activeIssue.analytics.escalationRisk}
                    </p>
                    <span className="text-[9px] text-natural-muted block mt-1">Hazard Risk</span>
                  </div>

                  <div className="rounded-xl border border-natural-border bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-natural-muted uppercase tracking-wider mb-1">Satisfaction Pred.</p>
                    <p className="text-lg font-bold text-natural-sage-dark">{activeIssue.analytics.citizenSatisfactionPrediction}%</p>
                    <span className="text-[9px] text-natural-muted block">Citizen Rating</span>
                  </div>
                </div>
              </div>

              {/* Gemini advisory assessment panels */}
              {(activeIssue.municipalityReport || activeIssue.suggestedAuthority || activeIssue.preventiveMeasures || activeIssue.authenticityScore) && (
                <div className="rounded-xl border border-natural-border bg-white p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-natural-border pb-2">
                    <Sparkles className="h-4 w-4 text-natural-sage" />
                    <h4 className="text-xs font-bold text-natural-text uppercase tracking-wider">Gemini Civic Advisory Assessment</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                    {activeIssue.suggestedAuthority && (
                      <div>
                        <span className="text-[10px] text-natural-muted uppercase font-bold">Recommended Dispatch Authority</span>
                        <p className="font-bold text-natural-text mt-0.5">{activeIssue.suggestedAuthority}</p>
                      </div>
                    )}
                    {activeIssue.authenticityScore !== undefined && (
                      <div>
                        <span className="text-[10px] text-natural-muted uppercase font-bold">AI Authenticity score</span>
                        <p className="font-bold text-natural-text mt-0.5 flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-natural-sage" />
                          {activeIssue.authenticityScore}% Verified Authenticity
                        </p>
                      </div>
                    )}
                  </div>

                  {activeIssue.municipalityReport && (
                    <div className="text-xs border-t border-natural-border/40 pt-2.5">
                      <span className="text-[10px] text-natural-muted uppercase font-bold block mb-1">AI Official Municipality Report</span>
                      <p className="text-natural-text leading-relaxed bg-natural-sand/30 rounded-lg p-2.5 border">{activeIssue.municipalityReport}</p>
                    </div>
                  )}

                  {activeIssue.preventiveMeasures && (
                    <div className="text-xs border-t border-natural-border/40 pt-2.5">
                      <span className="text-[10px] text-natural-muted uppercase font-bold block mb-1">AI Suggested Preventive Measures</span>
                      <p className="text-natural-text leading-relaxed bg-natural-sand/30 rounded-lg p-2.5 border">{activeIssue.preventiveMeasures}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Impact assessment details */}
              <div className="rounded-xl border border-natural-sage/25 bg-natural-sage-light/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-natural-sage-dark" />
                  <h4 className="text-xs font-bold text-natural-text uppercase tracking-wider">AI Neighborhood Impact Assessment</h4>
                </div>
                <p className="text-xs text-natural-text mb-3 font-medium leading-relaxed">
                  {activeIssue.impact.severity}
                </p>
                <div className="grid grid-cols-3 gap-3 border-t border-natural-border/50 pt-3 text-xs">
                  <div>
                    <span className="text-natural-muted block text-[10px] uppercase">Est. Affected Residents</span>
                    <strong className="text-natural-text font-bold text-sm">{activeIssue.impact.populationAffected} Citizens</strong>
                  </div>
                  <div>
                    <span className="text-natural-muted block text-[10px] uppercase">Area Hazard Risk</span>
                    <strong className="text-natural-text font-bold text-sm capitalize">{activeIssue.impact.areaRisk} Risk</strong>
                  </div>
                  <div>
                    <span className="text-natural-muted block text-[10px] uppercase">Impact Index Score</span>
                    <strong className="text-natural-text font-bold text-sm">{activeIssue.impact.communityImpactScore}/100</strong>
                  </div>
                </div>
              </div>

              {/* Volunteer drives and activities details */}
              {activeIssue.volunteerEngagement.maxNeeded > 0 && (
                <div className="rounded-xl border border-natural-sage/20 bg-natural-sage-light/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-natural-sage-dark">
                      <Users className="h-4 w-4 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Neighborhood Action Drive</h4>
                    </div>
                    <p className="text-xs text-natural-muted leading-relaxed">
                      This issue requires local volunteer deployment. Join cleanup or management efforts!
                    </p>
                    {activeIssue.volunteerEngagement.scheduledCleanupDate && (
                      <p className="text-[10px] font-mono text-natural-sage-dark font-semibold mt-1.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Scheduled: {activeIssue.volunteerEngagement.scheduledCleanupDate}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-natural-muted block uppercase font-bold">Positions Filled</span>
                      <strong className="text-sm text-natural-text font-bold">{activeIssue.volunteerEngagement.volunteerCount} / {activeIssue.volunteerEngagement.maxNeeded}</strong>
                    </div>

                    <button
                      onClick={() => toggleVolunteer(activeIssue.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        currentUser && activeIssue.volunteerEngagement.volunteerIds.includes(currentUser.id)
                          ? 'bg-natural-sage-light text-natural-sage-dark hover:bg-natural-sage/20 border border-natural-sage/30'
                          : 'bg-natural-sage text-white shadow-md hover:bg-natural-sage-dark'
                      }`}
                    >
                      {currentUser && activeIssue.volunteerEngagement.volunteerIds.includes(currentUser.id) ? 'Joined Squad' : 'Join Squad'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step-by-Step progress timeline display */}
              {activeIssue.timeline && activeIssue.timeline.length > 0 && (
                <div className="space-y-3.5 border-t border-natural-border/60 pt-4">
                  <span className="text-xs font-bold text-natural-text uppercase tracking-wider block">Official Dispatch Timeline</span>
                  <div className="relative border-l-2 border-natural-sage/30 pl-4 ml-2.5 space-y-4">
                    {activeIssue.timeline.map((item, idx) => {
                      const itemStatus = getStatusLabel(item.status);
                      return (
                        <div key={item.id || idx} className="relative text-xs">
                          {/* Marker bullet */}
                          <div className="absolute -left-[23px] mt-0.5 h-3 w-3 rounded-full border-2 border-white bg-natural-sage shadow-xs" />
                          <div className="bg-natural-sand/30 border border-natural-border/40 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${itemStatus.color}`}>
                                {itemStatus.text}
                              </span>
                              <span className="text-[9px] text-natural-muted font-mono">{new Date(item.date).toLocaleString()}</span>
                            </div>
                            <p className="text-natural-text leading-relaxed font-medium">{item.comment}</p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-natural-muted">
                              <span>Updated by: <strong>{item.updatedBy}</strong> ({item.role})</span>
                            </div>
                            {item.imageUrl && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-natural-border max-h-32">
                                <img src={item.imageUrl} alt="timeline-proof" className="w-full object-cover max-h-32" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Civic Authority Action center */}
              {currentUser && ['authority', 'admin'].includes(currentUser.role) && (
                <div className="rounded-xl border border-natural-border bg-natural-sand/30 p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-natural-text">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-natural-sage" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Civic dispatch console</h4>
                    </div>
                    <span className="text-[9px] text-natural-sage-dark font-mono bg-natural-sage-light px-2 py-0.5 rounded-full font-bold">
                      OFFICER SCREEN
                    </span>
                  </div>
                  
                  <p className="text-xs text-natural-muted leading-relaxed">
                    Update response status step-by-step, attach progress comments, and optionally post an **after-resolution** proof photo to close this incident ticket.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-natural-muted block mb-1">Change Incident Status</label>
                      <div className="flex flex-wrap gap-2">
                        {(['investigating', 'in_progress', 'resolved'] as IssueStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={async () => {
                              setIsUpdatingStatus(true);
                              await updateIssueStatus(activeIssue.id, status, statusComment || `Status set to ${status}`, resolutionImage || undefined);
                              setStatusComment('');
                              setResolutionImage(null);
                              setIsUpdatingStatus(false);
                            }}
                            disabled={isUpdatingStatus}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                              activeIssue.status === status
                                ? 'bg-natural-sage text-white shadow-xs'
                                : 'bg-white text-natural-sage-dark border border-natural-sage/30 hover:bg-natural-sage-light'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-natural-muted block mb-1">Progress Update Note (Timeline Dispatch comment)</label>
                      <input
                        type="text"
                        placeholder="e.g., Dispatch crew cleared the blocked storm sewer drain on Market St."
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        className="w-full rounded-lg border border-natural-border bg-white px-3 py-1.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-natural-muted block mb-1.5 flex items-center gap-1">
                        <Camera className="h-3 w-3 text-natural-sage-dark" />
                        <span>Optional Resolution Image (Base64)</span>
                      </label>
                      
                      {resolutionImage ? (
                        <div className="relative rounded-lg overflow-hidden max-h-32 border border-natural-border bg-natural-sand flex items-center justify-center">
                          <img src={resolutionImage} alt="resolution-proof" className="max-h-32 object-contain w-full" />
                          <button
                            type="button"
                            onClick={() => setResolutionImage(null)}
                            className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-slate-950 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setResolutionImage(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                          className="w-full text-xs text-natural-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-natural-sage-light file:text-natural-sage-dark hover:file:bg-natural-sage/20"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive community discussion thread */}
              <div className="border-t border-natural-border pt-4">
                <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-3">Community Discussion</h3>
                
                <div className="space-y-3 mb-4">
                  {activeIssue.comments.length === 0 ? (
                    <p className="text-xs text-natural-muted italic">No community comments posted yet. Start the conversation!</p>
                  ) : (
                    activeIssue.comments.map((comm) => (
                      <div key={comm.id} className="flex gap-2.5 text-xs items-start bg-natural-sand/40 rounded-xl p-3 border border-natural-border/30">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-natural-sage-light text-natural-sage-dark font-bold text-[10px] shrink-0 uppercase">
                          {comm.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-natural-text">{comm.userName}</span>
                            <span className="text-[10px] text-natural-muted font-mono">{new Date(comm.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          {comm.userRole !== 'citizen' && (
                            <span className="inline-block bg-natural-sage-light text-natural-sage-dark text-[8px] font-bold px-1.5 py-0.2 rounded uppercase mb-1">
                              {comm.userRole === 'authority' ? 'Civic Official' : comm.userRole}
                            </span>
                          )}
                          <p className="text-natural-text/90 leading-relaxed whitespace-pre-line">{comm.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit comment form */}
                {currentUser && (
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add neighborhood comment / support detail..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 rounded-xl border border-natural-border px-3.5 py-2 text-xs focus:border-natural-sage focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-natural-sidebar p-2.5 text-white shadow-sm hover:bg-natural-sidebar-hover transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Bottom Actions section */}
            <div className="border-t border-natural-border bg-natural-sand/50 p-4 flex justify-between items-center shrink-0">
              <button
                onClick={() => toggleUpvote(activeIssue.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  currentUser && activeIssue.upvotes.includes(currentUser.id)
                    ? 'bg-natural-sage-light border-natural-sage/30 text-natural-sage-dark'
                    : 'bg-white border-natural-border text-natural-muted hover:bg-natural-sand'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Upvote Community Support ({activeIssue.upvotes.length})</span>
              </button>

              <span className="text-[10px] text-natural-muted font-medium">
                Rewards: +15 Rep for reporting, +5 Rep for commenting
              </span>
            </div>

          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-natural-border bg-white p-12 text-center text-natural-muted">
            <div>
              <MapPin className="mx-auto h-12 w-12 text-natural-muted/60 mb-2.5 animate-bounce" />
              <h3 className="text-base font-semibold text-natural-text">Neighborhood Explorer</h3>
              <p className="text-sm text-natural-muted mt-1 max-w-sm">
                Select any incident report from the list to view live details, predictive AI metrics, community actions, and photos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
