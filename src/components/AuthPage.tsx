/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Shield, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Users,
  CheckCircle,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'login') {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      const success = await login(email, undefined, password || undefined);
      if (!success) {
        setError('Invalid credentials. Check your email/password or use a Quick Demo profile.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Name, Email, and Password are required to sign up');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      const success = await register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        address: address || undefined,
        bio: bio || undefined
      });
      if (!success) {
        setError('Registration failed. The email might already be in use.');
      }
    }
  };

  // Demo Login Quick-swapper list
  const demoUsers = [
    {
      email: 'citizen@communityhero.org',
      role: 'citizen' as UserRole,
      name: 'Ananya Das',
      desc: 'Report hyperlocal issues, upvote neighbors, and earn badged reputation.',
      badge: 'Active Citizen',
      color: 'border-natural-sage/30 hover:border-natural-sage bg-natural-sage-light/40 text-natural-sage-dark'
    },
    {
      email: 'volunteer@communityhero.org',
      role: 'volunteer' as UserRole,
      name: 'Marcus Vance',
      desc: 'Join community cleanliness squads, sign up for cleanup drives, and lead volunteers.',
      badge: 'Community Squad Leader',
      color: 'border-natural-ochre/30 hover:border-natural-ochre bg-amber-50/50 text-natural-ochre'
    },
    {
      email: 'authority@communityhero.org',
      role: 'authority' as UserRole,
      name: 'Jane Miller',
      desc: 'Dispatch maintenance crews, update resolution ETAs, and communicate with residents.',
      badge: 'Civic Authority / Director',
      color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-700'
    },
    {
      email: 'admin@communityhero.org',
      role: 'admin' as UserRole,
      name: 'Sarah Connor',
      desc: 'Access the main telemetry dashboard, moderate flags, manage users, and issue local emergency alerts.',
      badge: 'System Admin',
      color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50 text-natural-coral'
    }
  ];

  const handleDemoLogin = async (demoEmail: string, demoRole: UserRole) => {
    setError(null);
    await login(demoEmail, demoRole);
  };

  const handleGoogleOAuthSimulate = async () => {
    setError(null);
    // Generate a secure mock Google JWT token
    const mockGoogleHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const mockGooglePayload = btoa(JSON.stringify({
      sub: "1234567890",
      email: email || "google.hero@communityhero.org",
      name: name || "Alex Google Hero",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      email_verified: true
    }));
    const mockCredential = `${mockGoogleHeader}.${mockGooglePayload}.signature`;

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockCredential, role })
      });

      if (res.ok) {
        const data = await res.json();
        window.location.reload();
      } else {
        setError('Google OAuth verification failed in preview container');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate via Google simulated service');
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-natural-border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Aspect: Branding & Impact Stats (Laptops & Desktops) */}
        <div className="lg:col-span-5 bg-natural-sidebar text-natural-cream p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-natural-sage/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full bg-natural-ochre/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-natural-sage text-white shadow-lg mb-6">
              <Shield className="h-6 w-6" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Community Hero
            </h1>
            <p className="text-[11px] font-bold text-natural-sage tracking-widest uppercase font-mono mt-1">
              AI Hyperlocal Solver & GIS Map
            </p>
            
            <p className="mt-6 text-sm text-natural-cream/70 leading-relaxed max-w-sm">
              Empowering citizens, volunteers, and municipal authorities to coordinate, prioritize, and resolve neighborhood infrastructure & environmental issues with predictive AI intelligence.
            </p>
          </div>

          <div className="mt-12 lg:mt-0 relative z-10 space-y-6">
            <div className="border-t border-natural-sidebar-hover pt-6">
              <h3 className="text-xs font-bold text-natural-sage uppercase tracking-wider font-mono">
                Smart City Intel
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-natural-sidebar-hover flex items-center justify-center text-natural-sage shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <p className="text-xs text-natural-cream/80 leading-relaxed">
                    <strong>Gemini AI Integration</strong> triage classifications for category, priority, and automated agency escalation.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-md bg-natural-sidebar-hover flex items-center justify-center text-natural-sage shrink-0 mt-0.5">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <p className="text-xs text-natural-cream/80 leading-relaxed">
                    <strong>GIS Spatial Heatmaps</strong> mapping potholes, streetlight outages, and water leaks in high precision.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-natural-sidebar-hover/40 rounded-2xl p-4 border border-natural-sidebar-hover text-xs flex gap-3 items-center">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
              <span className="text-natural-cream/70">
                Active in Metropolis Ward 4 & surroundings
              </span>
            </div>
          </div>
        </div>

        {/* Right Aspect: Authentication / Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-left">
          
          {/* Navigation Tab toggler */}
          <div className="flex border-b border-natural-border mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`pb-3.5 text-sm font-semibold tracking-tight relative transition-colors mr-6 ${
                activeTab === 'login' ? 'text-natural-sage-dark border-b-2 border-natural-sage-dark' : 'text-natural-muted hover:text-natural-text'
              }`}
              id="auth_login_tab"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`pb-3.5 text-sm font-semibold tracking-tight relative transition-colors ${
                activeTab === 'register' ? 'text-natural-sage-dark border-b-2 border-natural-sage-dark' : 'text-natural-muted hover:text-natural-text'
              }`}
              id="auth_register_tab"
            >
              Create Civic Account
            </button>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
              <span className="font-semibold shrink-0">⚠️ Error:</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {activeTab === 'register' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                    Your Platform Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-white text-natural-text font-medium transition-all"
                  >
                    <option value="citizen">Citizen (Report & Vote)</option>
                    <option value="volunteer">Volunteer (Cleanup Drives & Rep)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={activeTab === 'register'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-natural-muted hover:text-natural-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="border-t border-dashed border-natural-border pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted" />
                      <input
                        type="text"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                      Location / Address (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-natural-muted" />
                      <input
                        type="text"
                        placeholder="Metropolis Ward 4"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-natural-text mb-1 uppercase tracking-wider font-mono">
                    Short Bio (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 h-4 w-4 text-natural-muted" />
                    <textarea
                      placeholder="Tell the neighborhood about your goals..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-natural-border focus:outline-none focus:ring-2 focus:ring-natural-sage/50 bg-natural-bg/30 text-natural-text placeholder-natural-muted/60 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-natural-sidebar hover:bg-natural-sidebar-hover shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleOAuthSimulate}
                className="py-3 px-6 rounded-xl text-sm font-semibold border border-natural-border bg-white text-natural-text hover:bg-natural-sand transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-extrabold text-[#4285F4]">G</span>
                <span>Google Demo Auth</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Grid */}
          <div className="mt-8 pt-6 border-t border-natural-border">
            <div className="flex items-center gap-1.5 mb-4">
              <Sparkles className="h-4 w-4 text-natural-ochre" />
              <h2 className="text-xs font-bold text-natural-text uppercase tracking-wider font-mono">
                Quick-Swapper Demo Accounts (1-Click)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleDemoLogin(user.email, user.role)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${user.color}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold tracking-tight">{user.name}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-current shadow-sm scale-95 origin-right">
                      {user.role === 'authority' ? 'Authority' : user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-natural-text/75 leading-normal mt-1 line-clamp-2">
                    {user.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
