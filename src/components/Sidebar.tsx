/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Map, 
  PlusCircle, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Info,
  Calendar,
  LogOut,
  Award,
  AlertOctagon,
  User,
  Bot
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'map',
      label: 'Hyperlocal GIS Map',
      icon: Map,
      description: 'Interact with neighborhood heatmaps and GIS coordinates',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'report',
      label: 'File Incident Report',
      icon: PlusCircle,
      description: 'Report an issue with instant Gemini AI classification',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'assistant',
      label: 'Civic AI Assistant',
      icon: Bot,
      description: 'Ask regulations and track dispatch real-time statuses',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'volunteers',
      label: 'Volunteer Hub',
      icon: Users,
      description: 'Join cleanups, drives, and view reputations',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: User,
      description: 'Manage profile details, safety alerts, & account settings',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'analytics',
      label: 'Smart City Stats',
      icon: BarChart3,
      description: 'Predictive resolution ETA and area health score',
      roles: ['citizen', 'volunteer', 'authority', 'admin']
    },
    {
      id: 'admin',
      label: 'Authority & Admin Hub',
      icon: ShieldAlert,
      description: 'Crews dispatch, notifications, & user safety alerts',
      roles: ['admin', 'authority']
    }
  ];

  const allowedItems = navItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-natural-sidebar-hover bg-natural-sidebar pt-16 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar p-4">
          
          {/* Reputation Highlight for Mobile Sidebar */}
          {currentUser && (
            <div className="mb-4 rounded-xl border border-natural-sage/30 bg-natural-sage/10 p-4 sm:hidden">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-natural-sage" />
                <div>
                  <p className="text-xs font-semibold text-natural-cream/90">Civic Reputation</p>
                  <p className="text-lg font-bold text-natural-sage">{currentUser.reputationPoints} Points</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-natural-sage uppercase tracking-wider">
              Navigation
            </div>
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'bg-natural-sidebar-hover font-semibold text-natural-cream shadow-sm'
                      : 'text-natural-cream/60 hover:bg-natural-sidebar-hover/50 hover:text-natural-cream'
                  }`}
                  id={`nav_tab_${item.id}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-natural-sage' : 'text-natural-cream/40'}`} />
                  <div>
                    <p className="text-sm leading-none">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 leading-none ${isActive ? 'text-natural-cream/80' : 'text-natural-cream/40'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Persona Informative Footer */}
          <div className="mt-auto space-y-4 pt-4 border-t border-natural-sidebar-hover/40">
            <div className="rounded-xl bg-natural-sage/15 p-3.5 text-xs text-natural-cream/80 border border-natural-sage/25">
              <div className="flex gap-2 font-semibold text-natural-cream mb-1.5 items-center">
                <Info className="h-4 w-4 text-natural-sage shrink-0" />
                <span>Simulated Persona Role</span>
              </div>
              <p className="leading-relaxed text-natural-cream/70">
                {currentUser?.role === 'citizen' && 'As a Citizen, you can file issues, track resolution, and earn reputation badges.'}
                {currentUser?.role === 'volunteer' && 'As a Volunteer, you are highlighted to join cleanup drives and coordinate actions.'}
                {currentUser?.role === 'authority' && 'As a Civic Authority, you can update ETAs, dispatch crews, and resolve reports.'}
                {currentUser?.role === 'admin' && 'As an Admin, you can oversee all metrics, reassign tasks, and moderate community issues.'}
              </p>
            </div>

            {currentUser && (
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-rose-300 hover:bg-rose-950/30 transition-all"
              >
                <LogOut className="h-4 w-4 shrink-0 text-rose-400" />
                <span>Sign Out Account</span>
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
