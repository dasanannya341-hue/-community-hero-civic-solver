/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Award, Menu, X, LogOut, User as UserIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onToggleSidebar, activeTab, setActiveTab }) => {
  const { currentUser, login, logout, dbService } = useApp();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleRoleChange = async (role: UserRole) => {
    if (currentUser) {
      await login(currentUser.email, role);
      setShowRoleSelector(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'citizen':
        return { label: 'Citizen', color: 'bg-natural-sand text-natural-text border-natural-border' };
      case 'volunteer':
        return { label: 'Volunteer', color: 'bg-natural-sage-light text-natural-sage-dark border-natural-sage/30' };
      case 'authority':
        return { label: 'Civic Authority', color: 'bg-amber-50 text-natural-ochre border-amber-200' };
      case 'admin':
        return { label: 'System Admin', color: 'bg-rose-50/70 text-natural-coral border-rose-100' };
    }
  };

  const currentRoleInfo = currentUser ? getRoleLabel(currentUser.role) : null;

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-natural-border bg-white/95 backdrop-blur-md transition-all duration-300 ${sidebarOpen ? 'md:pl-72' : 'md:pl-0'}`}>
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-natural-muted hover:bg-natural-sand transition-colors"
            id="toggle_sidebar_btn"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div 
            onClick={() => setActiveTab('map')} 
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-natural-sage text-white shadow-md shadow-natural-sage/10">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-natural-text leading-none">
                Community Hero
              </h1>
              <span className="text-[10px] font-bold text-natural-sage tracking-wider uppercase font-mono">
                AI Hyperlocal Solver
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth / Profile / Rep / Quick Swapper */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Reputation points counter (gamification) */}
              <div 
                onClick={() => setActiveTab('volunteers')}
                className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-natural-ochre/20 bg-natural-sand px-3 py-1 text-xs font-semibold text-natural-ochre hover:bg-natural-sand/80 sm:flex"
                title="Gamified Civic Reputation Points"
              >
                <Award className="h-4 w-4 text-natural-ochre" />
                <span>{currentUser.reputationPoints} Rep</span>
              </div>

              {/* Interactive Role Switcher for instant demonstration */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all ${currentRoleInfo?.color}`}
                  id="role_selector_btn"
                >
                  <RefreshCw className="h-3 w-3 animate-pulse text-natural-sage-dark" />
                  <span>{currentRoleInfo?.label}</span>
                </button>

                {showRoleSelector && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-natural-border bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-natural-muted uppercase tracking-wider">
                      Switch Demo Persona
                    </div>
                    {(['citizen', 'volunteer', 'authority', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                          currentUser.role === r 
                            ? 'bg-natural-sage-light font-semibold text-natural-sage-dark' 
                            : 'text-natural-text hover:bg-natural-sand'
                        }`}
                      >
                        <span className="capitalize">{r === 'authority' ? 'Civic Authority' : r}</span>
                        {currentUser.role === r && <div className="h-1.5 w-1.5 rounded-full bg-natural-sage-dark" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Profile Info (clickable to view Profile & Settings) */}
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 border-l border-natural-border pl-3 cursor-pointer text-left focus:outline-none group hover:opacity-95"
                id="navbar_profile_tab_btn"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-natural-border object-cover group-hover:ring-2 group-hover:ring-natural-sage transition-all"
                />
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-natural-text group-hover:text-natural-sage transition-colors leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-natural-muted truncate max-w-[120px]">{currentUser.email}</p>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleRoleChange('citizen')}
              className="flex items-center gap-2 rounded-xl bg-natural-sidebar px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-natural-sidebar-hover transition-all"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
