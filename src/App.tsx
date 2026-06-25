/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { DashboardMap } from './components/DashboardMap';
import { ReportIssue } from './components/ReportIssue';
import { VolunteerHub } from './components/VolunteerHub';
import { AnalyticsStats } from './components/AnalyticsStats';
import { Profile } from './components/Profile';
import { CommunityGISMap } from './components/CommunityGISMap';
import { CivicAssistant } from './components/CivicAssistant';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPage } from './components/AuthPage';
import { ShieldAlert, Compass, Sparkles, User, RefreshCw, Award } from 'lucide-react';

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'report' | 'assistant' | 'volunteers' | 'analytics' | 'profile' | 'admin'
  const { currentUser, loading } = useApp();

  // Handle window resizing to adjust sidebar visibility and main content layout dynamically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial layout once on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-natural-bg flex items-center justify-center font-sans text-natural-text">
        <div className="text-center bg-white p-8 rounded-3xl border border-natural-border shadow-xl max-w-sm w-full mx-4">
          <div className="flex justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-natural-sage animate-spin" />
          </div>
          <h3 className="text-base font-bold text-natural-text">Connecting to Community Hero core...</h3>
          <p className="text-xs text-natural-muted mt-2">Downloading public feeds and starting AI predictive modules...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map':
        return <CommunityGISMap />;
      case 'report':
        return <ReportIssue setActiveTab={setActiveTab} />;
      case 'assistant':
        return <CivicAssistant />;
      case 'volunteers':
        return <VolunteerHub />;
      case 'analytics':
        return <AnalyticsStats />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CommunityGISMap />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'map':
        return 'Interactive Spatial GIS Map';
      case 'report':
        return 'Submit Hyperlocal Incident';
      case 'assistant':
        return 'Civic AI Assistant';
      case 'volunteers':
        return 'Civic Action Volunteer Hub';
      case 'analytics':
        return 'Predictive Smart City Metrics';
      case 'profile':
        return 'Civic Profile & Neighborhood Alerts';
      case 'admin':
        return 'Admin Control Hub';
      default:
        return 'Hyperlocal Incident Map';
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col font-sans text-natural-text">
      
      {/* Top Navigation Bar */}
      <Navbar 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1 pt-0">
        
        {/* Left Drawer / Persistent Navigation rail */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Core Main View panel */}
        <main className={`flex-1 px-4 py-6 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'md:pl-80' : 'md:pl-8'}`}>
          <div className="mx-auto max-w-7xl">
            
            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-natural-sage uppercase tracking-widest font-mono">
                {activeTab === 'map' ? 'Hyperlocal Explorer' : 
                 activeTab === 'report' ? 'AI Triage Form' : 
                 activeTab === 'assistant' ? 'Conversational AI' :
                 activeTab === 'volunteers' ? 'Gamified Civic Hub' : 
                 activeTab === 'profile' ? 'Account & Alerts' :
                 activeTab === 'admin' ? 'System Moderation' :
                 'Smart City Predictors'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-natural-text sm:text-2xl">
                {getPageTitle()}
              </h2>
            </div>

            <div className="animate-fade-in duration-300">
              {renderActiveTab()}
            </div>

            {/* Sleek footer section */}
            <div className="mt-12 pt-6 border-t border-natural-border">
              <Footer />
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
