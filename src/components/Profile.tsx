/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Award, 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Trash2, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  Chrome, 
  AlertTriangle,
  Info,
  Sliders,
  BellRing
} from 'lucide-react';
import { UserRole } from '../types';

export const Profile: React.FC = () => {
  const { 
    currentUser, 
    register, 
    login, 
    logout, 
    updateProfile, 
    changePassword, 
    updatePreferences, 
    deleteAccount 
  } = useApp();

  // Navigation tab for the profile section
  const [activeSubTab, setActiveSubTab] = useState<'view' | 'edit' | 'notifications' | 'auth'>('view');

  // Interactive feedback states replacing default window.alerts
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Edit details form states
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Authentication registration states (for manual testing of login/register)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>('citizen');
  const [isRegistering, setIsRegistering] = useState(false);

  // Account deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Simulated notification list for the "Status Updates One-by-One" requirement
  const [simulatedNotifications, setSimulatedNotifications] = useState([
    { id: 1, text: "Your reported 'Water Leakage' has been assigned to Public Works.", date: "Just now", read: false },
    { id: 2, text: "Volunteer cleanup scheduled for 'Central Park Garbage pile' is starting in 2 hours.", date: "2 hours ago", read: false },
    { id: 3, text: "Citizen Ananya Das upvoted your 'Streetlight failure' report.", date: "1 day ago", read: true },
    { id: 4, text: "Pothole on 10th Avenue status updated to [RESOLVED] by Director Miller.", date: "2 days ago", read: true }
  ]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
      bio: editBio,
      avatar: editAvatar || undefined
    });
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, msg: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ success: false, msg: 'Password must be at least 6 characters' });
      return;
    }

    const res = await changePassword({
      oldPassword: oldPassword || undefined,
      newPassword
    });

    if (res.success) {
      setPasswordStatus({ success: true, msg: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ success: false, msg: res.error || 'Failed to update password' });
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      const success = await register({
        name: authName,
        email: authEmail,
        password: authPassword,
        role: authRole
      });
      if (success) {
        setActiveSubTab('view');
        // Clear fields
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      }
    } else {
      const success = await login(authEmail, undefined, authPassword);
      if (success) {
        setActiveSubTab('view');
        setAuthEmail('');
        setAuthPassword('');
      }
    }
  };

  const handleGoogleOAuthSimulate = async () => {
    // Generate a secure mock Google JWT token
    const mockGoogleHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const mockGooglePayload = btoa(JSON.stringify({
      sub: "1234567890",
      email: authEmail || "google.hero@communityhero.org",
      name: authName || "Alex Google Hero",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      email_verified: true
    }));
    const mockCredential = `${mockGoogleHeader}.${mockGooglePayload}.signature`;

    try {
      setActionError(null);
      setActionSuccess(null);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockCredential, role: authRole })
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccess('Google OAuth simulation authenticated successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setActionError('Google OAuth verification failed in preview container');
      }
    } catch (err) {
      console.error(err);
      setActionError('Failed to authenticate via Google simulated service');
    }
  };

  const handleDeleteAccountSubmit = async () => {
    setActionError(null);
    setActionSuccess(null);
    if (deleteInput !== 'DELETE') {
      setActionError('Please type "DELETE" to confirm account removal.');
      return;
    }
    const success = await deleteAccount();
    if (success) {
      setActionSuccess('Your account has been deleted. Logging out...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const toggleNotificationItem = (id: number) => {
    setSimulatedNotifications(prev => 
      prev.map(item => item.id === id ? { ...item, read: !item.read } : item)
    );
  };

  const markAllNotificationsRead = () => {
    setSimulatedNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 text-left">
      {/* Sidebar Controls */}
      <div className="col-span-1 flex flex-col gap-3">
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm">
          {currentUser ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-full border-2 border-natural-sage object-cover shadow-md"
                />
                <span className="absolute bottom-0 right-0 rounded-full bg-natural-sage px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest border border-white">
                  {currentUser.role}
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-natural-text">{currentUser.name}</h3>
              <p className="text-xs text-natural-muted truncate max-w-full w-48 mb-4">{currentUser.email}</p>

              <div className="flex items-center gap-1.5 rounded-full bg-natural-sand px-3 py-1 text-xs font-semibold text-natural-ochre">
                <Award className="h-4 w-4" />
                <span>{currentUser.reputationPoints} Reputation Points</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <UserIcon className="h-10 w-10 text-natural-muted mx-auto mb-2" />
              <p className="text-xs text-natural-muted">Not Signed In</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-1 border-t border-natural-border pt-4">
            <button
              onClick={() => setActiveSubTab('view')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeSubTab === 'view'
                  ? 'bg-natural-sage/10 text-natural-sage-dark'
                  : 'text-natural-muted hover:bg-natural-sand'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Public Profile Details</span>
            </button>
            <button
              onClick={() => setActiveSubTab('edit')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeSubTab === 'edit'
                  ? 'bg-natural-sage/10 text-natural-sage-dark'
                  : 'text-natural-muted hover:bg-natural-sand'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Modify Details & Pass</span>
            </button>
            <button
              onClick={() => setActiveSubTab('notifications')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeSubTab === 'notifications'
                  ? 'bg-natural-sage/10 text-natural-sage-dark'
                  : 'text-natural-muted hover:bg-natural-sand'
              }`}
            >
              <BellRing className="h-4 w-4" />
              <span>Hyperlocal Alerts & Safety</span>
            </button>
            <button
              onClick={() => setActiveSubTab('auth')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeSubTab === 'auth'
                  ? 'bg-natural-sage/10 text-natural-sage-dark'
                  : 'text-natural-muted hover:bg-natural-sand'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Register / Authenticate</span>
            </button>
          </div>
        </div>

        {currentUser && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-5">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">Destructive Actions</h4>
            <p className="text-[10px] text-rose-700/80 mb-3 leading-relaxed">
              Permanently purge your reputation points, reported items history, and authorization session from databases.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-2 text-xs font-bold transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Request Account Purge</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="col-span-1 lg:col-span-3 space-y-4">
        {actionError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
            <span className="font-semibold shrink-0">⚠️ Notice:</span>
            <p className="leading-relaxed">{actionError}</p>
          </div>
        )}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
            <span className="font-semibold shrink-0">✅ Success:</span>
            <p className="leading-relaxed">{actionSuccess}</p>
          </div>
        )}

        {/* Tab 1: Profile View */}
        {activeSubTab === 'view' && currentUser && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-natural-border">
                <h3 className="text-lg font-bold text-natural-text">Civic Identification</h3>
                <span className="rounded-full bg-natural-sand border border-natural-border px-2.5 py-1 text-[10px] font-bold text-natural-sage-dark tracking-wider uppercase">
                  ID: {currentUser.id.substring(0, 12)}...
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-natural-bg/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-natural-sage/15 text-natural-sage">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-natural-muted font-mono leading-none">Full Name</span>
                    <p className="text-xs font-bold text-natural-text mt-0.5">{currentUser.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-natural-bg/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-natural-sage/15 text-natural-sage">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-natural-muted font-mono leading-none">Verified Email</span>
                    <p className="text-xs font-bold text-natural-text mt-0.5 truncate max-w-[180px]">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-natural-bg/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-natural-sage/15 text-natural-sage">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-natural-muted font-mono leading-none">Phone Contact</span>
                    <p className="text-xs font-bold text-natural-text mt-0.5">
                      {currentUser.phone || <span className="text-natural-muted font-normal italic">No contact added</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-natural-bg/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-natural-sage/15 text-natural-sage">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-natural-muted font-mono leading-none">Address Precinct</span>
                    <p className="text-xs font-bold text-natural-text mt-0.5 truncate max-w-[180px]">
                      {currentUser.address || <span className="text-natural-muted font-normal italic">No address precinct</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-natural-bg/50 p-4">
                <span className="text-[10px] text-natural-muted font-mono block">Biography & Mission</span>
                <p className="text-xs text-natural-text mt-1 leading-relaxed italic">
                  "{currentUser.bio || 'This civic member has not penned a community statement yet.'}"
                </p>
              </div>
            </div>

            {/* Badges showcase */}
            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-natural-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-natural-ochre" />
                <span>Earned Civic Recognition Badges</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(currentUser.badges || ['Civic Recruit']).map((badge, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 rounded-xl border border-natural-ochre/25 bg-natural-sand px-3 py-2 text-xs font-semibold text-natural-ochre"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-natural-ochre" />
                    <span>{badge}</span>
                  </div>
                ))}
                {(!currentUser.badges || currentUser.badges.length === 0) && (
                  <p className="text-xs text-natural-muted italic">Earn your first badge by filing an incident or joining volunteer cleanup squads.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Edit Details & Password */}
        {activeSubTab === 'edit' && currentUser && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-natural-text mb-4">Edit Profile Identification</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/photo..."
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Phone Contact</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Address Precinct</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="City Hall Quarter"
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-natural-muted block mb-1">Biography / Personal Statement</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your commitment to hyperlocal neighborhoods..."
                    className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveSuccess && (
                    <span className="text-xs text-natural-sage font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Changes saved successfully</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto flex items-center gap-1.5 rounded-xl bg-natural-sidebar hover:bg-natural-sidebar-hover text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-natural-text mb-4">Change Account Password</h3>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-natural-muted block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {passwordStatus && (
                    <span className={`text-xs font-semibold flex items-center gap-1 ${passwordStatus.success ? 'text-natural-sage' : 'text-natural-coral'}`}>
                      {passwordStatus.success ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      <span>{passwordStatus.msg}</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto flex items-center gap-1.5 rounded-xl bg-natural-sidebar hover:bg-natural-sidebar-hover text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Change Secure Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Hyperlocal Alert Settings */}
        {activeSubTab === 'notifications' && currentUser && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <div className="mb-4 text-left">
                <h3 className="text-base font-bold text-natural-text">Geographic Safety & Alert Settings</h3>
                <p className="text-xs text-natural-muted mt-1 leading-relaxed">
                  Decide how you are alerted regarding reported issues near your coordinates. Civic Admins and Officers automatically receive wider district dispatches.
                </p>
              </div>

              <div className="space-y-4">
                {/* Notification Radius Slider */}
                <div className="rounded-xl border border-natural-border/60 bg-natural-bg/25 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-natural-text">Hyperlocal Alert Radius</span>
                    <span className="rounded-full bg-natural-sage px-2.5 py-0.5 text-xs font-bold text-white font-mono">
                      {currentUser.notificationPreferences?.radius || 5} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={currentUser.notificationPreferences?.radius || 5}
                    onChange={(e) => updatePreferences({
                      notificationPreferences: { radius: Number(e.target.value) }
                    })}
                    className="w-full accent-natural-sage cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-natural-muted font-mono mt-1">
                    <span>1 km (Hyperlocal Block)</span>
                    <span>25 km (Wider City)</span>
                    <span>50 km (Precinct)</span>
                  </div>
                </div>

                {/* Grid of Toggles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-natural-border bg-white p-3 shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-natural-text block">Near Area Alerts Only</span>
                      <span className="text-[10px] text-natural-muted">Suppress alerts outside of chosen radius.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentUser.notificationPreferences?.nearAreaOnly || false}
                        onChange={(e) => updatePreferences({
                          notificationPreferences: { nearAreaOnly: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-sage"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-natural-border bg-white p-3 shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-natural-text block">One-by-One Status Sync</span>
                      <span className="text-[10px] text-natural-muted">Track status changes of your issues 1-by-1.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentUser.notificationPreferences?.issueStatusUpdates || false}
                        onChange={(e) => updatePreferences({
                          notificationPreferences: { issueStatusUpdates: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-sage"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-natural-border bg-white p-3 shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-natural-text block">Email Dispatches</span>
                      <span className="text-[10px] text-natural-muted">Receive weekly digests of local progress.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentUser.notificationPreferences?.email || false}
                        onChange={(e) => updatePreferences({
                          notificationPreferences: { email: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-sage"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-natural-border bg-white p-3 shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-natural-text block">SMS Safety Alerts</span>
                      <span className="text-[10px] text-natural-muted">Urgent alerts regarding critical hazards.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentUser.notificationPreferences?.sms || false}
                        onChange={(e) => updatePreferences({
                          notificationPreferences: { sms: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-sage"></div>
                    </label>
                  </div>
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-natural-border bg-white p-4 mt-2">
                  <div>
                    <span className="text-xs font-bold text-natural-text block">Anonymous Reporting Mode</span>
                    <span className="text-[10px] text-natural-muted leading-relaxed">
                      Mask your civic name when reporting neighborhood incidents. Useful for reporting sensitive hazards.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentUser.privacySettings?.anonymousReporting || false}
                      onChange={(e) => updatePreferences({
                        privacySettings: { anonymousReporting: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-natural-sage"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Simulated Live Alert Monitor "1 by 1 Notifications" */}
            <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-natural-text uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-natural-sage" />
                    <span>Interactive Incident & Safety Log</span>
                  </h3>
                  <p className="text-[10px] text-natural-muted">Simulated real-time status tracker notifying your area's issues one-by-one</p>
                </div>
                <button 
                  onClick={markAllNotificationsRead}
                  className="rounded-lg bg-natural-sand hover:bg-natural-sand/80 px-2.5 py-1 text-[10px] font-bold text-natural-sage-dark border border-natural-border transition-colors"
                >
                  Mark All Read
                </button>
              </div>

              <div className="space-y-2">
                {simulatedNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => toggleNotificationItem(notif.id)}
                    className={`flex items-start gap-3 rounded-xl p-3 border cursor-pointer transition-all ${
                      notif.read 
                        ? 'bg-natural-bg/20 border-natural-border/50 opacity-75' 
                        : 'bg-natural-sage-light border-natural-sage/20 shadow-xs ring-1 ring-natural-sage/10'
                    }`}
                  >
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-natural-sage'}`} />
                    <div className="flex-1 text-xs">
                      <p className={`leading-relaxed ${notif.read ? 'text-natural-muted' : 'text-natural-text font-medium'}`}>
                        {notif.text}
                      </p>
                      <span className="text-[9px] font-mono text-natural-muted mt-1 block">{notif.date}</span>
                    </div>
                    {!notif.read && (
                      <span className="rounded bg-natural-sage/15 px-1.5 py-0.5 text-[8px] font-bold text-natural-sage-dark uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Auth registration tab (Sign In / Register Screen) */}
        {activeSubTab === 'auth' && (
          <div className="rounded-2xl border border-natural-border bg-white p-6 shadow-sm max-w-xl mx-auto text-left">
            <div className="text-center mb-6">
              <Shield className="h-10 w-10 text-natural-sage mx-auto mb-2" />
              <h3 className="text-lg font-bold text-natural-text">
                {isRegistering ? 'Create Civic Account' : 'Authenticate Civic Member'}
              </h3>
              <p className="text-xs text-natural-muted mt-1">
                {isRegistering 
                  ? 'Join Community Hero to start accumulating reputation and protecting your neighborhood.' 
                  : 'Enter your credentials to access your persistent reporter and volunteer history.'}
              </p>
            </div>

            <form onSubmit={handleManualAuth} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="text-xs font-bold text-natural-muted block mb-1">Citizen Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setEditName(e.target.value) || setAuthName(e.target.value)}
                    placeholder="Ananya Das"
                    className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-natural-muted block mb-1">Civic Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="citizen@communityhero.org"
                  className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-natural-muted block mb-1">Secure Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="text-xs font-bold text-natural-muted block mb-1">Primary Role Persona</label>
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-natural-border bg-natural-bg/40 px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-natural-sage"
                  >
                    <option value="citizen">Citizen (Reports issues, upvotes, earns Rep)</option>
                    <option value="volunteer">Volunteer (Coordinates drives, highlights cleanup squads)</option>
                    <option value="authority">Civic Authority (Updates status, uploads before/after)</option>
                    <option value="admin">System Admin (Full metrics moderating access)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-natural-sidebar hover:bg-natural-sidebar-hover text-white py-2.5 text-xs font-bold shadow-md transition-all"
              >
                <Shield className="h-4 w-4" />
                <span>{isRegistering ? 'Register Account' : 'Authenticate Session'}</span>
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-natural-border"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-natural-muted uppercase tracking-wider font-mono">Or connect with</span>
              <div className="flex-grow border-t border-natural-border"></div>
            </div>

            {/* Google OAuth simulation button */}
            <button
              onClick={handleGoogleOAuthSimulate}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-natural-border hover:bg-natural-sand text-natural-text py-2.5 text-xs font-bold transition-all"
            >
              <Chrome className="h-4 w-4 text-rose-500" />
              <span>Simulate Google OAuth Session</span>
            </button>

            <p className="text-center text-xs text-natural-muted mt-5">
              {isRegistering ? 'Already registered on platform?' : 'New Community Hero helper?'}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-natural-sage font-bold hover:underline ml-1"
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        )}

        {/* Purge / delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 mt-4 text-left">
            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Are you absolutely certain?</span>
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed mb-4">
              This action is fully irreversible. Type the word <strong className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-900">DELETE</strong> below to authorize immediate account removal.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="flex-1 rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                onClick={handleDeleteAccountSubmit}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition-all"
              >
                Authorize Account Purge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
