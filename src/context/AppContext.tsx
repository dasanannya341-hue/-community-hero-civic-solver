/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Issue, AreaStats, UserRole, IssueStatus, NotificationPreferences, PrivacySettings } from '../types';

interface AppContextType {
  currentUser: User | null;
  issues: Issue[];
  stats: AreaStats | null;
  loading: boolean;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    address?: string;
    bio?: string;
  }) => Promise<boolean>;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
  }) => Promise<boolean>;
  changePassword: (data: {
    oldPassword?: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (data: {
    notificationPreferences?: Partial<NotificationPreferences>;
    privacySettings?: Partial<PrivacySettings>;
    themePreferences?: 'nature' | 'warm' | 'dark';
  }) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  fetchIssues: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createIssue: (data: {
    title?: string;
    description: string;
    category?: string;
    priority?: string;
    location: { lat: number; lng: number; address: string };
    imageUrl?: string;
    base64Images?: string[];
  }) => Promise<Issue>;
  addComment: (issueId: string, text: string) => Promise<void>;
  toggleUpvote: (issueId: string) => Promise<void>;
  toggleVolunteer: (issueId: string) => Promise<void>;
  updateIssueStatus: (
    issueId: string, 
    status: IssueStatus, 
    comment?: string, 
    afterImageBase64?: string
  ) => Promise<void>;
  allUsers: User[];
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<boolean>;
  assignIssue: (issueId: string, assignedTo: string) => Promise<void>;
  escalateIssue: (issueId: string, escalatedTo: string, reason: string) => Promise<void>;
  chatWithAssistant: (message: string, history: { role: 'user' | 'model'; text: string }[]) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<AreaStats | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper: Secure, token-aware API fetcher with auto refresh capabilities!
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('hero_token');
    
    // Set authorization headers
    const headers = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const updatedOptions = {
      ...options,
      headers
    };

    let response = await fetch(url, updatedOptions);

    // If 401 or TokenExpired error is returned, attempt to refresh
    if (response.status === 401) {
      const clone = response.clone();
      try {
        const errorData = await clone.json();
        if (errorData.error === 'TokenExpired') {
          console.log('🔄 Access token expired. Attempting refresh token exchange...');
          const refreshToken = localStorage.getItem('hero_refresh_token');
          if (refreshToken) {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('hero_token', refreshData.accessToken);
              console.log('✨ Access token refreshed successfully. Retrying request...');
              
              // Retry with new token
              const retriedHeaders = {
                ...headers,
                Authorization: `Bearer ${refreshData.accessToken}`
              };
              response = await fetch(url, { ...options, headers: retriedHeaders });
            } else {
              console.warn('⚠️ Refresh token is invalid or expired. Logging out user...');
              logout();
            }
          } else {
            logout();
          }
        }
      } catch (err) {
        // Fallback for simple status check failures
        console.error('Error during API request token handling:', err);
      }
    }

    return response;
  };

  // Check storage on init and load user
  useEffect(() => {
    const initSession = async () => {
      const storedUser = localStorage.getItem('hero_user');
      const token = localStorage.getItem('hero_token');

      if (storedUser && token) {
        try {
          // Verify with backend
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            localStorage.setItem('hero_user', JSON.stringify(user));
          } else {
            // Token is stale or invalid, let's remove it
            localStorage.removeItem('hero_user');
            localStorage.removeItem('hero_token');
            localStorage.removeItem('hero_refresh_token');
          }
        } catch (err) {
          // If offline, trust local storage for preview integrity
          setCurrentUser(JSON.parse(storedUser));
        }
      } else {
        // Require login on start
      }
      setLoading(false);
    };

    initSession();
  }, []);

  // Fetch issues list
  const fetchIssues = async () => {
    try {
      const res = await apiFetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        // Sort by priority and date
        const sorted = data.sort((a: Issue, b: Issue) => {
          const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
          const pA = priorityWeight[a.priority] || 0;
          const pB = priorityWeight[b.priority] || 0;
          if (pA !== pB) return pB - pA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setIssues(sorted);
      }
    } catch (err) {
      console.error('Error fetching civic reports:', err);
    }
  };

  // Fetch smart city analytics
  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching smart city analytics:', err);
    }
  };

  // Load all on change
  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchIssues(), fetchStats()]);
    };
    if (currentUser?.id) {
      loadAll();
    }
  }, [currentUser?.id]);

  // Auth: Register
  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    address?: string;
    bio?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          password: data.password || 'password123' // default for quick bypass
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setCurrentUser(resData.user);
        localStorage.setItem('hero_user', JSON.stringify(resData.user));
        localStorage.setItem('hero_token', resData.accessToken);
        localStorage.setItem('hero_refresh_token', resData.refreshToken);
        setLoading(false);
        return true;
      } else {
        const err = await res.json();
        console.warn('Registration failed:', err.error || 'Failed to register account');
      }
    } catch (err) {
      console.error('Register action failed:', err);
    }
    setLoading(false);
    return false;
  };

  // Auth: Login
  const login = async (email: string, role?: UserRole, password?: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, password })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('hero_user', JSON.stringify(data.user));
        localStorage.setItem('hero_token', data.accessToken);
        localStorage.setItem('hero_refresh_token', data.refreshToken);
        setLoading(false);
        return true;
      } else {
        const errorData = await res.json();
        console.warn('Login failed:', errorData.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login action failed:', err);
    }
    setLoading(false);
    return false;
  };

  // Auth: Logout handler
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hero_user');
    localStorage.removeItem('hero_token');
    localStorage.removeItem('hero_refresh_token');
  };

  // Profile: Update Profile info
  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
  }): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        localStorage.setItem('hero_user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
    return false;
  };

  // Profile: Change Password
  const changePassword = async (data: {
    oldPassword?: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Password change failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Profile: Update Notification / Privacy / Theme settings
  const updatePreferences = async (data: {
    notificationPreferences?: Partial<NotificationPreferences>;
    privacySettings?: Partial<PrivacySettings>;
    themePreferences?: 'nature' | 'warm' | 'dark';
  }): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const payload = {
        notificationPreferences: data.notificationPreferences 
          ? { ...currentUser.notificationPreferences, ...data.notificationPreferences }
          : undefined,
        privacySettings: data.privacySettings 
          ? { ...currentUser.privacySettings, ...data.privacySettings }
          : undefined,
        themePreferences: data.themePreferences || undefined
      };

      const res = await apiFetch('/api/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        localStorage.setItem('hero_user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error('Failed to save user preferences:', err);
    }
    return false;
  };

  // Profile: Delete Account
  const deleteAccount = async (): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/delete-account', {
        method: 'DELETE'
      });
      if (res.ok) {
        logout();
        return true;
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
    return false;
  };

  // Report Issue (supports multiple base64 uploaded files)
  const createIssue = async (data: {
    title?: string;
    description: string;
    category?: string;
    priority?: string;
    location: { lat: number; lng: number; address: string };
    imageUrl?: string;
    base64Images?: string[];
  }): Promise<Issue> => {
    const payload = {
      ...data,
      reporterId: currentUser?.id,
      reporterName: currentUser?.name || 'Anonymous Citizen'
    };

    const res = await apiFetch('/api/issues', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit report');
    }

    const savedIssue = await res.json();
    await Promise.all([fetchIssues(), fetchStats()]);
    
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        reputationPoints: currentUser.reputationPoints + 15
      });
    }
    return savedIssue;
  };

  // Add Comment
  const addComment = async (issueId: string, text: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          text
        })
      });
      if (res.ok) {
        await fetchIssues();
        setCurrentUser({
          ...currentUser,
          reputationPoints: currentUser.reputationPoints + 5
        });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  // Toggle Upvote
  const toggleUpvote = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        await fetchIssues();
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    }
  };

  // Toggle Volunteer Sign Up
  const toggleVolunteer = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/issues/${issueId}/volunteer`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        const prevIssue = issues.find((i) => i.id === issueId);
        const isSigningUp = prevIssue ? !prevIssue.volunteerEngagement.volunteerIds.includes(currentUser.id) : false;
        setCurrentUser({
          ...currentUser,
          reputationPoints: Math.max(0, currentUser.reputationPoints + (isSigningUp ? 20 : -20))
        });
        await fetchIssues();
      }
    } catch (err) {
      console.error('Failed to toggle volunteering:', err);
    }
  };

  // Update Status (with comments and optional resolution / before-after image attachment)
  const updateIssueStatus = async (
    issueId: string, 
    status: IssueStatus, 
    comment?: string, 
    afterImageBase64?: string
  ) => {
    if (!currentUser || !['authority', 'admin'].includes(currentUser.role)) return;
    try {
      const res = await apiFetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          comment,
          updatedBy: currentUser.name,
          role: currentUser.role,
          afterImageBase64
        })
      });
      if (res.ok) {
        await Promise.all([fetchIssues(), fetchStats()]);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Fetch all users for Admin panel
  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Moderation: delete user
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Failed to moderate user:', err);
    }
    return false;
  };

  // Assignment of issues
  const assignIssue = async (issueId: string, assignedTo: string) => {
    try {
      const res = await apiFetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assignedTo })
      });
      if (res.ok) {
        await fetchIssues();
      }
    } catch (err) {
      console.error('Failed to assign issue:', err);
    }
  };

  // Escalation of issues
  const escalateIssue = async (issueId: string, escalatedTo: string, reason: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/issues/${issueId}/escalate`, {
        method: 'POST',
        body: JSON.stringify({
          escalatedTo,
          reason,
          escalaterName: currentUser.name
        })
      });
      if (res.ok) {
        await fetchIssues();
      }
    } catch (err) {
      console.error('Failed to escalate issue:', err);
    }
  };

  // Chat with AI Civic Assistant
  const chatWithAssistant = async (message: string, history: { role: 'user' | 'model'; text: string }[]): Promise<string> => {
    try {
      const res = await apiFetch('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history })
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    } catch (err) {
      console.error('Failed to chat with AI Civic Assistant:', err);
    }
    return 'I am experiencing connection issues. Please try again.';
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        issues,
        stats,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        updatePreferences,
        deleteAccount,
        fetchIssues,
        fetchStats,
        createIssue,
        addComment,
        toggleUpvote,
        toggleVolunteer,
        updateIssueStatus,
        allUsers,
        fetchUsers,
        deleteUser,
        assignIssue,
        escalateIssue,
        chatWithAssistant
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
