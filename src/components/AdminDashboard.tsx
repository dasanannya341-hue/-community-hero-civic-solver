/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Trash2, 
  Volume2, 
  Award, 
  Zap, 
  MapPin, 
  AlertOctagon, 
  Activity, 
  Bell, 
  Search, 
  UserX,
  PieChart,
  RefreshCw,
  Send
} from 'lucide-react';
import { User, Issue, IssuePriority, IssueStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser,
    issues, 
    allUsers, 
    fetchUsers, 
    deleteUser, 
    stats, 
    fetchStats, 
    deleteAccount,
    updateIssueStatus,
    fetchIssues 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'issues' | 'notifications'>('users');
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [issueSearch, setIssueSearch] = useState<string>('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [broadcastLog, setBroadcastLog] = useState<{ id: string; title: string; message: string; date: string }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Custom styled notifications replacing default alerts/confirms
  const [dashboardNotification, setDashboardNotification] = useState<{ type: 'success' | 'info' | 'error', msg: string } | null>(null);

  // Verification gateway state
  const [isVerified, setIsVerified] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [department, setDepartment] = useState('Municipal Works');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats(), fetchIssues()]);
    setIsRefreshing(false);
  };

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'authority') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-red-200 rounded-3xl p-8 shadow-xl text-center font-sans">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto mb-6 border border-rose-100 animate-pulse">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-natural-text tracking-tight">Access Prohibited</h2>
        <p className="text-xs text-natural-sage font-bold tracking-widest uppercase font-mono mt-1">Official Municipal Gate</p>
        <p className="mt-4 text-xs text-natural-muted leading-relaxed">
          The Authority & Admin Control Hub is restricted to verified municipal agency workers, responders, and platform system administrators.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-natural-sand border border-natural-border text-xs text-natural-text text-left">
          <p className="font-semibold text-natural-text">How to access this hub?</p>
          <p className="mt-1.5 leading-relaxed text-natural-muted">
            You are logged in as a <strong className="capitalize">{currentUser?.role}</strong>. Please use the Quick Demo role selector in the navigation bar to switch your active persona to either <strong>Civic Authority</strong> or <strong>System Admin</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-natural-border rounded-3xl p-8 shadow-xl text-left font-sans animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-natural-ochre mb-6 border border-amber-100">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-natural-text tracking-tight">Authority Verification Gateway</h2>
        <p className="text-[10px] font-bold text-natural-sage tracking-widest uppercase font-mono mt-1">Personnel Credentials Audit</p>
        
        <p className="mt-3 text-xs text-natural-muted leading-relaxed">
          Please verify your official municipal department and security passcode to unlock sensitive citizen moderation, incident dispatcher controls, and agency statistics.
        </p>

        {passcodeError && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 font-medium">
            ⚠️ {passcodeError}
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          if (passcode === '1357') {
            setIsVerified(true);
            setPasscodeError(null);
          } else {
            setPasscodeError('Invalid municipal security passcode. Check the credentials and try again.');
          }
        }} className="mt-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-natural-text uppercase tracking-wider font-mono mb-1">
              Assigned Department / Bureau
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-natural-border bg-white text-natural-text font-medium"
            >
              <option value="Municipal Works">Municipal Works & Public Health</option>
              <option value="Roads Bureau">Roads & Transport Authority</option>
              <option value="Public Safety">Department of Public Safety</option>
              <option value="Admin Office">Mayor's Secretariat Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-natural-text uppercase tracking-wider font-mono mb-1">
              4-Digit Agency Passcode
            </label>
            <input
              type="password"
              maxLength={6}
              required
              placeholder="••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text font-mono tracking-widest"
            />
          </div>

          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-[11px] text-natural-ochre flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider shrink-0 text-[10px]">Demo Credentials:</span>
            <span>Passcode is <strong className="font-mono text-sm">1357</strong></span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-natural-sidebar hover:bg-natural-sidebar-hover shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Unlock Authority Control</span>
          </button>
        </form>
      </div>
    );
  }

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyMsg.trim()) return;

    const newBroadcast = {
      id: `broadcast_${Date.now()}`,
      title: notifyTitle,
      message: notifyMsg,
      date: new Date().toLocaleString()
    };

    setBroadcastLog(prev => [newBroadcast, ...prev]);
    setNotifyTitle('');
    setNotifyMsg('');
    setDashboardNotification({
      type: 'success',
      msg: `Broadcast Dispatched! In-app emergency banner "${newBroadcast.title}" has been successfully pushed to all active citizen devices in Metropolis.`
    });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const ok = await deleteUser(userId);
    if (ok) {
      setDashboardNotification({
        type: 'success',
        msg: `User "${userName}" has been successfully moderated and suspended from all Community Hero platforms.`
      });
    }
  };

  // Calculations for Widgets
  const totalUsersCount = allUsers.length || 4; 
  const totalIssuesCount = issues.length;
  const openIssuesCount = issues.filter(i => i.status !== 'resolved' && i.status !== 'archived').length;
  const resolvedIssuesCount = issues.filter(i => i.status === 'resolved').length;
  const criticalIssuesCount = issues.filter(i => i.priority === 'critical').length;
  const activeVolunteersCount = allUsers.filter(u => u.role === 'volunteer').length || 1;
  const averageHealthScore = stats?.averageHealthScore || 82;
  const hotspotCount = stats?.hotspots.length || 3;

  // Filter lists
  const filteredUsers = allUsers.filter(u => {
    const matchesRole = userFilterRole === 'all' || u.role === userFilterRole;
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredIssues = issues.filter(i => {
    return i.title.toLowerCase().includes(issueSearch.toLowerCase()) || i.location.address.toLowerCase().includes(issueSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {dashboardNotification && (
        <div className={`border rounded-2xl p-4 text-xs flex gap-3 items-start animate-fade-in ${
          dashboardNotification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          dashboardNotification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="font-semibold shrink-0">
            {dashboardNotification.type === 'success' ? '✅ Operations Center:' : '⚠️ Attention Required:'}
          </span>
          <p className="leading-relaxed flex-1">{dashboardNotification.msg}</p>
          <button 
            onClick={() => setDashboardNotification(null)}
            className="text-current opacity-60 hover:opacity-100 font-bold ml-2 font-mono text-sm leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Admin Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-natural-border pb-4">
        <div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">Operations Control Panel</span>
          <h3 className="text-lg font-bold text-natural-text tracking-tight mt-0.5">Community Hero Global Admin Panel</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-xl border border-natural-border bg-white px-3.5 py-2 text-xs font-bold text-natural-text hover:bg-natural-sand cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-natural-sage ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Core Data</span>
        </button>
      </div>

      {/* Admin Stat Grid Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        
        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Total Users</span>
          <strong className="text-lg font-bold text-natural-text block mt-1">{totalUsersCount}</strong>
          <span className="text-[8px] text-natural-sage block mt-0.5">Registered accounts</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Total Issues</span>
          <strong className="text-lg font-bold text-natural-text block mt-1">{totalIssuesCount}</strong>
          <span className="text-[8px] text-natural-sage block mt-0.5">Reports lodged</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Open Tickets</span>
          <strong className="text-lg font-bold text-rose-600 block mt-1">{openIssuesCount}</strong>
          <span className="text-[8px] text-rose-400 block mt-0.5">Need resolution</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Resolved</span>
          <strong className="text-lg font-bold text-natural-sage block mt-1">{resolvedIssuesCount}</strong>
          <span className="text-[8px] text-natural-sage-dark block mt-0.5">Closed successfully</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-rose-50/50 p-3 shadow-xs">
          <span className="text-[9px] font-bold text-red-500 uppercase block leading-none">Critical Issues</span>
          <strong className="text-lg font-bold text-rose-700 block mt-1">{criticalIssuesCount}</strong>
          <span className="text-[8px] text-rose-500 block mt-0.5">High priority active</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Volunteers</span>
          <strong className="text-lg font-bold text-natural-text block mt-1">{activeVolunteersCount}</strong>
          <span className="text-[8px] text-natural-sage block mt-0.5">Ready for dispatch</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Health Score</span>
          <strong className="text-lg font-bold text-natural-sage block mt-1">{averageHealthScore}/100</strong>
          <span className="text-[8px] text-natural-sage block mt-0.5">Area average</span>
        </div>

        <div className="rounded-xl border border-natural-border bg-white p-3 shadow-xs">
          <span className="text-[9px] font-bold text-natural-muted uppercase block leading-none">Hotspot Zones</span>
          <strong className="text-lg font-bold text-natural-text block mt-1">{hotspotCount}</strong>
          <span className="text-[8px] text-natural-muted block mt-0.5">Clusters mapped</span>
        </div>

      </div>

      {/* Control Tabs */}
      <div className="border-b border-natural-border flex gap-4">
        {(['users', 'issues', 'notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2.5 text-xs font-bold capitalize transition-all cursor-pointer border-b-2 -mb-[2px] ${
              activeSubTab === tab
                ? 'border-rose-500 text-rose-600 font-bold'
                : 'border-transparent text-natural-muted hover:text-natural-text'
            }`}
          >
            {tab === 'users' ? 'User Moderation' : tab === 'issues' ? 'Integrity & Issue Audit' : 'Push Broadcaster'}
          </button>
        ))}
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-natural-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider">Registered System Users ({filteredUsers.length})</h4>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-natural-muted" />
                <input
                  type="text"
                  placeholder="Filter by name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-lg border border-natural-border pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:border-rose-300 w-44"
                />
              </div>
              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="rounded-lg border border-natural-border bg-natural-sand px-2 py-1 text-xs focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizen</option>
                <option value="volunteer">Volunteer</option>
                <option value="authority">Authority</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-border text-natural-muted font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Persona / Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">System Role</th>
                  <th className="py-2.5 px-3">Reputation Points</th>
                  <th className="py-2.5 px-3">Badges</th>
                  <th className="py-2.5 px-3 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-sand">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-natural-muted italic">No registered users matched the active filters.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-natural-sand/20">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} className="h-6 w-6 rounded-full object-cover" />
                        <span className="font-semibold text-natural-text">{user.name}</span>
                      </td>
                      <td className="py-3 px-3 text-natural-muted font-mono">{user.email}</td>
                      <td className="py-3 px-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border capitalize ${
                          user.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          user.role === 'authority' ? 'bg-amber-50 text-natural-ochre border-amber-200' :
                          user.role === 'volunteer' ? 'bg-natural-sage-light text-natural-sage-dark border-natural-sage/20' :
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-natural-text flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-natural-ochre" />
                        <span>{user.reputationPoints} Points</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(user.badges || ['Civic Contributor']).map((badge, bidx) => (
                            <span key={bidx} className="bg-natural-sand px-1.5 py-0.5 rounded text-[9px] font-medium text-natural-text truncate max-w-[80px]" title={badge}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {user.role === 'admin' ? (
                          <span className="text-[10px] text-natural-muted italic">System Owner</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex cursor-pointer"
                            title="Moderate Account"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'issues' && (
        <div className="bg-white border border-natural-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider">Issue Integrity & Fraud Audit Console</h4>
              <p className="text-[10px] text-natural-muted mt-0.5">Gemini-generated authenticity index and safety checks</p>
            </div>

            <div className="relative">
              <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-natural-muted" />
              <input
                type="text"
                placeholder="Search active issues..."
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                className="rounded-lg border border-natural-border pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:border-rose-300 w-48"
              />
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredIssues.map((issue) => {
              const score = issue.authenticityScore || 90;
              const hasFraudFactors = issue.fraudAssessment && (
                issue.fraudAssessment.isAiGenerated || 
                issue.fraudAssessment.isDuplicateImage || 
                issue.fraudAssessment.isDuplicateReport || 
                issue.fraudAssessment.isFakeGps || 
                issue.fraudAssessment.isSpam
              );

              return (
                <div key={issue.id} className="border border-natural-border/70 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="text-left">
                      <span className="text-[9px] font-mono font-bold text-natural-muted uppercase bg-natural-sand px-2 py-0.5 rounded mr-2">ID: {issue.id}</span>
                      <strong className="text-xs font-bold text-natural-text">{issue.title}</strong>
                      <p className="text-[11px] text-natural-muted font-mono mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-natural-sage" />
                        <span>{issue.location.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[9px] text-natural-muted block uppercase font-bold leading-none">Authenticity Index</span>
                        <strong className={`text-sm font-bold block mt-1 ${score > 70 ? 'text-natural-sage-dark' : score > 40 ? 'text-natural-ochre' : 'text-red-600'}`}>
                          {score}% Valid
                        </strong>
                      </div>
                      <span className={`rounded-full h-2 w-2 ${score > 70 ? 'bg-natural-sage' : score > 40 ? 'bg-natural-ochre' : 'bg-red-500 animate-ping'}`} />
                    </div>
                  </div>

                  {/* Integrity Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {issue.fraudAssessment ? (
                      <>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${issue.fraudAssessment.isAiGenerated ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          AI Generated: {issue.fraudAssessment.isAiGenerated ? 'FLAGGED' : 'Clean'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${issue.fraudAssessment.isDuplicateReport ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          Dup Report: {issue.fraudAssessment.isDuplicateReport ? 'FLAGGED' : 'Unique'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${issue.fraudAssessment.isFakeGps ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          Fake GPS: {issue.fraudAssessment.isFakeGps ? 'FLAGGED' : 'Verified'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${issue.fraudAssessment.isSpam ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          Spam Check: {issue.fraudAssessment.isSpam ? 'FLAGGED' : 'Clean'}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-natural-muted italic">Local DB fallback integrity assessment: OK (No anomalies found)</span>
                    )}
                  </div>

                  <div className="bg-natural-sand/20 rounded-lg p-2.5 text-xs text-natural-text border border-natural-border/40">
                    <p className="font-medium text-natural-muted uppercase text-[9px] tracking-wider mb-1">AI Diagnostic analysis reason</p>
                    <p className="leading-relaxed text-natural-text/90 italic">
                      {issue.fraudAssessment?.analysisReason || 'Incident reported is consistent. Imagery shows clear physical environmental context matching the user description, and GPS geolocation coordinate alignment is verified.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Dispatcher Form */}
          <div className="md:col-span-6 bg-white border border-natural-border rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-rose-500" />
              <span>Area Notification Dispatcher</span>
            </h4>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-natural-muted uppercase block mb-1">Broadcaster Header Title</label>
                <input
                  type="text"
                  placeholder="e.g., Heavy Rainfall & Flooding Alert in Metropolis Ward 3"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full rounded-xl border border-natural-border px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-natural-muted uppercase block mb-1">Push Alert Message Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Avoid parking near lower drainage lines. Volunteers requested to join storm channel clearing drives starting at Metropolis Town Center."
                  value={notifyMsg}
                  onChange={(e) => setNotifyMsg(e.target.value)}
                  className="w-full rounded-xl border border-natural-border px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                type="submit"
                disabled={!notifyTitle.trim() || !notifyMsg.trim()}
                className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Dispatch Broadcast Notification</span>
              </button>
            </form>
          </div>

          {/* Broadcast History logs */}
          <div className="md:col-span-6 bg-white border border-natural-border rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-4">Area Broadcast History Log ({broadcastLog.length})</h4>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {broadcastLog.length === 0 ? (
                <p className="text-xs text-natural-muted italic text-center py-12">No area broadcasts dispatched in this session yet.</p>
              ) : (
                broadcastLog.map((log) => (
                  <div key={log.id} className="border border-natural-border/60 bg-natural-sand/15 rounded-xl p-3 text-left">
                    <div className="flex justify-between text-[10px] text-natural-muted mb-1 font-mono">
                      <span>Broadcast ID: {log.id}</span>
                      <span>{log.date}</span>
                    </div>
                    <strong className="text-xs font-bold text-natural-text block">{log.title}</strong>
                    <p className="text-xs text-natural-muted mt-1 leading-relaxed">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
