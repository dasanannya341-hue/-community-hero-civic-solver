/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'citizen' | 'volunteer' | 'authority' | 'admin';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  nearAreaOnly: boolean;
  issueStatusUpdates: boolean;
  radius: number; // in km
}

export interface PrivacySettings {
  publicProfile: boolean;
  anonymousReporting: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  reputationPoints: number;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  badges?: string[];
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  themePreferences?: 'light' | 'dark' | 'nature';
  createdAt: string;
}

export type IssueCategory =
  | 'garbage'
  | 'road_damage'
  | 'water_leakage'
  | 'streetlight'
  | 'drainage'
  | 'public_safety'
  | 'stray_animals'
  | 'environmental'
  | 'community_request'
  | 'infrastructure'
  | 'emergency';

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';

export type IssueStatus = 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'archived';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface ImpactAssessment {
  severity: string;
  populationAffected: number;
  areaRisk: 'high' | 'medium' | 'low';
  communityImpactScore: number; // 1-100
}

export interface SmartCityAnalytics {
  resolutionETA: string; // e.g. "48 Hours", "5 Days"
  escalationRisk: 'high' | 'medium' | 'low';
  areaHealthScore: number; // 1-100
  smartPriorityIndex: number; // 1-100 calculated by AI
  citizenSatisfactionPrediction: number; // 1-100
}

export interface IssueComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface VolunteerEngagement {
  volunteerIds: string[];
  volunteerCount: number;
  maxNeeded: number;
  scheduledCleanupDate?: string;
}

export interface IssueTimelineItem {
  id: string;
  status: IssueStatus;
  comment: string;
  date: string;
  updatedBy: string;
  role: UserRole;
  imageUrl?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: GeoLocation;
  reporterId: string;
  reporterName: string;
  imageUrl?: string;
  imageUrls?: string[];
  beforeAfterImages?: {
    beforeUrl?: string;
    afterUrl?: string;
  };
  municipalityReport?: string;
  suggestedAuthority?: string;
  preventiveMeasures?: string;
  authenticityScore?: number;
  timeline?: IssueTimelineItem[];
  impact: ImpactAssessment;
  analytics: SmartCityAnalytics;
  volunteerEngagement: VolunteerEngagement;
  comments: IssueComment[];
  upvotes: string[]; // User IDs who upvoted
  assignedTo?: string; // ID or name of the assigned authority
  escalationWorkflow?: {
    escalated: boolean;
    escalatedTo: string;
    reason: string;
    date?: string;
  };
  fraudAssessment?: {
    isAiGenerated: boolean;
    isDuplicateImage: boolean;
    isDuplicateReport: boolean;
    isFakeGps: boolean;
    isSpam: boolean;
    analysisReason: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AreaStats {
  totalIssues: number;
  resolvedIssues: number;
  activeVolunteers: number;
  averageHealthScore: number;
  categoryDistribution: Record<IssueCategory, number>;
  monthlyTrends: { month: string; reported: number; resolved: number }[];
  hotspots: { name: string; issueCount: number; lat: number; lng: number }[];
}
