/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Award, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  ChevronRight, 
  Compass,
  Briefcase
} from 'lucide-react';

export const VolunteerHub: React.FC = () => {
  const { issues, currentUser, toggleVolunteer } = useApp();

  // Filter issues that require volunteers (e.g. garbage cleanup, environmental drives)
  const activeDrives = issues.filter(
    (i) => i.volunteerEngagement.maxNeeded > 0 && i.status !== 'resolved'
  );

  // High-reputation leaderboard users
  const topHeroes = [
    { name: 'Sarah Connor', role: 'System Admin', rep: 500, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', rank: 1 },
    { name: 'Marcus Vance', role: 'Volunteer Coordinator', rep: 120, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', rank: 2 },
    { name: 'Dr. Aris Thorne', role: 'Environmental Scientist', rep: 95, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', rank: 3 },
    { name: 'Chloe Sterling', role: 'Active Citizen', rep: 75, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rank: 4 }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* Left Column: Active Drives */}
      <div className="flex flex-col gap-4 lg:col-span-8">
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-natural-border pb-3">
            <div>
              <h2 className="text-base font-bold text-natural-text tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 text-natural-sage-dark" />
                <span>Active Neighborhood Cleanups & Drives</span>
              </h2>
              <p className="text-xs text-natural-muted mt-0.5">
                Join active efforts in your block to earn up to +50 Civic Reputation Points upon resolution.
              </p>
            </div>
            
            <span className="rounded-full bg-natural-sage-light px-2.5 py-1 text-[10px] font-mono font-bold text-natural-sage-dark">
              {activeDrives.length} Drives Open
            </span>
          </div>

          {activeDrives.length === 0 ? (
            <div className="py-12 text-center text-natural-muted">
              <Users className="mx-auto h-10 w-10 text-natural-border-dark mb-2.5" />
              <p className="text-sm font-semibold">No active volunteer drives listed.</p>
              <p className="text-xs text-natural-muted mt-1">Check back later or file an issue requiring local action.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activeDrives.map((drive) => {
                const isJoined = currentUser && drive.volunteerEngagement.volunteerIds.includes(currentUser.id);
                return (
                  <div 
                    key={drive.id}
                    className="rounded-xl border border-natural-border bg-natural-sand/30 p-4 hover:border-natural-sage hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-natural-sage-light text-natural-sage-dark px-2 py-0.5 rounded font-bold uppercase">
                          {drive.category.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] rounded px-1.5 py-0.5 font-bold uppercase ${
                          drive.priority === 'critical' ? 'bg-[#FDF1E7] text-[#C45E3A]' : 'bg-natural-sand text-[#A6754B]'
                        }`}>
                          {drive.priority}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-natural-text leading-snug line-clamp-1 mb-1">
                        {drive.title}
                      </h3>

                      <p className="text-xs text-natural-muted line-clamp-2 mb-3">
                        {drive.description}
                      </p>

                      <div className="space-y-1.5 border-t border-natural-border pt-3 text-xs text-natural-muted mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-natural-sage shrink-0" />
                          <span className="truncate">{drive.location.address}</span>
                        </div>
                        {drive.volunteerEngagement.scheduledCleanupDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-natural-sage shrink-0" />
                            <span className="font-semibold text-natural-sage-dark">Scheduled: {drive.volunteerEngagement.scheduledCleanupDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-natural-border">
                      <div>
                        <span className="text-[10px] text-natural-muted block uppercase font-bold">Volunteers Joined</span>
                        <strong className="text-sm font-extrabold text-natural-text">
                          {drive.volunteerEngagement.volunteerCount} / {drive.volunteerEngagement.maxNeeded}
                        </strong>
                      </div>

                      <button
                        onClick={() => toggleVolunteer(drive.id)}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          isJoined
                            ? 'bg-natural-sage-light text-natural-sage-dark hover:bg-natural-sage/20'
                            : 'bg-natural-sage text-white shadow-sm hover:bg-natural-sage-dark'
                        }`}
                      >
                        {isJoined ? 'Signed Up' : 'Join Squad'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informative Civic Guidelines Card */}
        <div className="rounded-2xl border border-natural-sage/20 bg-[#2D362E] p-6 text-white shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-natural-sage mb-2">Volunteer Safety & Impact Directives</h3>
          <p className="text-xs text-natural-cream/80 leading-relaxed mb-4">
            Volunteering with Community Hero is a secure, collaborative framework designed to build strong local bonds. Always inspect reported photos before departing. Ensure proper safety equipment (clean gloves, high-vis vests) is used during cleanups, and synchronize actions with other active neighborhood squads.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-natural-sidebar-hover pt-4 text-xs text-natural-cream/70">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="h-4 w-4 text-natural-sage shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Secure Verification</strong>
                Incidents are vetted and validated before squads deployment.
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <Award className="h-4 w-4 text-natural-ochre shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Reputation Badges</strong>
                Points unlock municipal accolades and certificate badges.
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <Users className="h-4 w-4 text-natural-coral shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Public Engagement</strong>
                Gain direct connections with municipal supervisors.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Leaderboards */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Leaderboard Card */}
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-natural-border pb-3">
            <Award className="h-5 w-5 text-[#A6754B]" />
            <div>
              <h3 className="text-sm font-bold text-natural-text tracking-tight">Civic Leaderboard</h3>
              <p className="text-[10px] text-natural-muted">Recognizing leading neighborhood heroes</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {topHeroes.map((hero) => (
              <div 
                key={hero.rank}
                className="flex items-center justify-between rounded-xl border border-natural-border bg-natural-sand/30 p-2.5 hover:bg-natural-sand/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono ${
                    hero.rank === 1 ? 'bg-[#FDF1E7] text-[#A6754B]' :
                    hero.rank === 2 ? 'bg-natural-sand text-natural-text' :
                    hero.rank === 3 ? 'bg-natural-sage-light text-natural-sage-dark' :
                    'bg-natural-sand text-natural-muted'
                  }`}>
                    #{hero.rank}
                  </span>

                  <img 
                    src={hero.avatar} 
                    alt={hero.name} 
                    className="h-8 w-8 rounded-full border border-natural-border object-cover shrink-0" 
                  />

                  <div className="text-left">
                    <p className="text-xs font-bold text-natural-text leading-none">{hero.name}</p>
                    <p className="text-[10px] text-natural-muted mt-0.5 leading-none">{hero.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-natural-sand px-2 py-0.5 text-[10px] font-bold text-[#A6754B] border border-natural-border">
                    {hero.rep} Rep
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current User Stats summary */}
        {currentUser && (
          <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-natural-sage-dark" />
              <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider">Your Civic Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-natural-border bg-natural-sand/30 p-3">
                <span className="text-[9px] text-natural-muted block uppercase font-bold">Reputation</span>
                <strong className="text-lg font-bold text-natural-sage-dark">{currentUser.reputationPoints} Points</strong>
              </div>
              <div className="rounded-xl border border-natural-border bg-natural-sand/30 p-3">
                <span className="text-[9px] text-natural-muted block uppercase font-bold">Current Role</span>
                <strong className="text-xs font-bold text-natural-text capitalize block mt-1">{currentUser.role}</strong>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
