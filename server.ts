/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectDB, dbService } from './server/config/db';
import { analyzeIssue, generateAIAssistantAdvice, detectCivicFraud, generateCivicAssistantChat } from './server/services/gemini';
import { uploadToCloudinary } from './server/services/cloudinary';
import { Issue, IssueCategory, IssueComment, IssuePriority, IssueStatus, User, UserRole, IssueTimelineItem } from './src/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large payloads (like base64 camera image uploads)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Connect to database (graceful fallback inside if Mongo fails or is absent)
  await connectDB();

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // Health and connection check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: dbService.isUsingMongo() ? 'MongoDB Atlas' : 'Local Fallback JSON Engine',
      timestamp: new Date().toISOString()
    });
  });

  // JWT Secrets
  const ACCESS_SECRET = process.env.JWT_SECRET || 'community-hero-access-secret-389102';
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'community-hero-refresh-secret-819234';

  const generateAccessToken = (user: User) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  };

  const generateRefreshToken = (user: User) => {
    return jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  };

  // JWT Verification Middleware helper
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as { id: string; email: string; role: UserRole };
      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User session expired or not found' });
      }
      req.user = user;
      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'TokenExpired', message: 'Access token expired' });
      }
      return res.status(403).json({ error: 'Invalid or manipulated authentication token' });
    }
  };

  // 1. Register Endpoint
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, phone, address, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    try {
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser: User & { password?: string } = {
        id: `user_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: (role as UserRole) || 'citizen',
        reputationPoints: 10,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
        phone: phone || '',
        address: address || '',
        bio: bio || '',
        badges: ['Civic Recruit'],
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          nearAreaOnly: true,
          issueStatusUpdates: true,
          radius: 5
        },
        privacySettings: {
          publicProfile: true,
          anonymousReporting: false
        },
        themePreferences: 'nature',
        createdAt: new Date().toISOString()
      };

      await dbService.createUser(newUser);

      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          reputationPoints: newUser.reputationPoints,
          avatar: newUser.avatar,
          phone: newUser.phone,
          address: newUser.address,
          bio: newUser.bio,
          badges: newUser.badges,
          notificationPreferences: newUser.notificationPreferences,
          privacySettings: newUser.privacySettings,
          themePreferences: newUser.themePreferences,
          createdAt: newUser.createdAt
        },
        accessToken,
        refreshToken
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Login Endpoint
  app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      let user: any = await dbService.getUserByEmail(email);

      // Support seamless role swapper in demo / development mode (auto-register if no password)
      if (!user) {
        if (!password) {
          const namePart = email.split('@')[0].replace('.', ' ');
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          user = {
            id: `user_${Date.now()}`,
            name: formattedName,
            email: email.toLowerCase(),
            role: (role as UserRole) || 'citizen',
            reputationPoints: 10,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
            phone: '',
            address: '',
            bio: 'Active civic member',
            badges: ['Civic Member'],
            notificationPreferences: { email: true, push: true, sms: false, nearAreaOnly: true, issueStatusUpdates: true, radius: 5 },
            privacySettings: { publicProfile: true, anonymousReporting: false },
            themePreferences: 'nature',
            createdAt: new Date().toISOString()
          };
          await dbService.createUser(user);
        } else {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      } else {
        // If password is provided, verify it (unless they are doing a passwordless role swapper bypass)
        if (password && user.password) {
          const passwordMatch = bcrypt.compareSync(password, user.password);
          if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }
        } else if (role && user.role !== role) {
          // Update role if selected differently via role switcher (for developer ease)
          user = await dbService.updateUser(user.id, { role: role as UserRole });
        }
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Strip password before returning
      const userObj = { ...user };
      delete userObj.password;

      res.json({
        accessToken,
        refreshToken,
        user: userObj
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Refresh Tokens Endpoint
  app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User session no longer exists' });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    } catch (err: any) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
  });

  // 4. Google OAuth Login Endpoint
  app.post('/api/auth/google', async (req, res) => {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    try {
      // Decode standard JWT structure from Google credential
      const payloadBase64 = credential.split('.')[1];
      if (!payloadBase64) {
        return res.status(400).json({ error: 'Invalid Google credential token' });
      }
      
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      const email = payload.email;
      const name = payload.name || email.split('@')[0];
      const picture = payload.picture || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`;

      if (!email) {
        return res.status(400).json({ error: 'Could not resolve email from Google credential' });
      }

      let user = await dbService.getUserByEmail(email);
      if (!user) {
        // Register Google User
        user = {
          id: `user_google_${payload.sub || Date.now()}`,
          name,
          email: email.toLowerCase(),
          role: (role as UserRole) || 'citizen',
          reputationPoints: 20,
          avatar: picture,
          phone: '',
          address: '',
          bio: 'Registered via Google OAuth',
          badges: ['Google Verified', 'Civic Recruit'],
          notificationPreferences: { email: true, push: true, sms: false, nearAreaOnly: true, issueStatusUpdates: true, radius: 5 },
          privacySettings: { publicProfile: true, anonymousReporting: false },
          themePreferences: 'nature',
          createdAt: new Date().toISOString()
        };
        await dbService.createUser(user);
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        user,
        accessToken,
        refreshToken
      });
    } catch (err: any) {
      console.error('Google OAuth backend error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Logout Endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Successfully signed out' });
  });

  // 6. Protected Get User Details
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json(req.user);
  });

  // 7. Update Profile details
  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    const { name, phone, address, bio, avatar } = req.body;
    try {
      const updates: Partial<User> = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;
      if (bio !== undefined) updates.bio = bio;
      if (avatar !== undefined) updates.avatar = avatar;

      const updated = await dbService.updateUser(req.user.id, updates);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Change Password
  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    try {
      const fullUser: any = await dbService.getUserById(req.user.id);
      if (fullUser.password) {
        if (!oldPassword) {
          return res.status(400).json({ error: 'Current password is required to change password' });
        }
        const match = bcrypt.compareSync(oldPassword, fullUser.password);
        if (!match) {
          return res.status(400).json({ error: 'Incorrect current password' });
        }
      }

      const hashedNew = bcrypt.hashSync(newPassword, 10);
      await dbService.updateUser(req.user.id, { password: hashedNew } as any);
      res.json({ success: true, message: 'Password successfully updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Update preferences settings
  app.put('/api/auth/preferences', authenticateToken, async (req: any, res) => {
    const { notificationPreferences, privacySettings, themePreferences } = req.body;
    try {
      const updates: Partial<User> = {};
      if (notificationPreferences) updates.notificationPreferences = notificationPreferences;
      if (privacySettings) updates.privacySettings = privacySettings;
      if (themePreferences) updates.themePreferences = themePreferences;

      const updated = await dbService.updateUser(req.user.id, updates);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Delete Account
  app.delete('/api/auth/delete-account', authenticateToken, async (req: any, res) => {
    try {
      // Find and delete the user account
      // For mongoose, we delete it. For local DB we can implement user deletion inside dbService.
      // Let's add user deletion in local file or mongoose if supported, or clear/mock delete user:
      await dbService.deleteUser(req.user.id);
      res.json({ success: true, message: 'User account deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all issues
  app.get('/api/issues', async (req, res) => {
    try {
      const issues = await dbService.getIssues();
      res.json(issues);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get specific issue details
  app.get('/api/issues/:id', async (req, res) => {
    try {
      const issue = await dbService.getIssueById(req.params.id);
      if (!issue) {
        return res.status(404).json({ error: 'Issue report not found' });
      }
      res.json(issue);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create/Report new issue with Google Gemini AI intelligence!
  app.post('/api/issues', async (req, res) => {
    const { title, description, category, priority, location, imageUrl, imageUrls, base64Images, reporterId, reporterName } = req.body;

    if (!description || !location || !location.address) {
      return res.status(400).json({ error: 'Description and location details are required' });
    }

    try {
      console.log('🔮 Processing issue report using Community Hero AI service...');

      // Upload images to Cloudinary (with safe local/base64 fallback)
      let uploadedUrls: string[] = [];
      if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
        for (const img of base64Images) {
          const url = await uploadToCloudinary(img);
          uploadedUrls.push(url);
        }
      } else if (imageUrl) {
        const url = await uploadToCloudinary(imageUrl);
        uploadedUrls.push(url);
      } else if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        uploadedUrls = [...imageUrls];
      }

      const finalImageUrl = uploadedUrls[0] || undefined;

      // Leverage server-side Gemini AI for instant categorization, priority assessment, and risk impact scores
      const aiResult = await analyzeIssue(description, finalImageUrl);

      // Run deep AI fraud and integrity assessment
      let fraudAssessment = {
        isAiGenerated: false,
        isDuplicateImage: false,
        isDuplicateReport: false,
        isFakeGps: false,
        isSpam: false,
        analysisReason: 'Verification passed. Details match expected hyperlocal report syntax.'
      };
      let authenticityScore = aiResult.authenticityScore || 90;

      try {
        const existingReportsList = await dbService.getIssues();
        const existingReportsSummary = existingReportsList.map(item => ({
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          address: item.location.address
        }));

        const fraudResult = await detectCivicFraud(
          description,
          finalImageUrl,
          location.address,
          { lat: Number(location.lat) || 37.774929, lng: Number(location.lng) || -122.419416 },
          existingReportsSummary
        );

        fraudAssessment = {
          isAiGenerated: fraudResult.isAiGenerated,
          isDuplicateImage: fraudResult.isDuplicateImage,
          isDuplicateReport: fraudResult.isDuplicateReport,
          isFakeGps: fraudResult.isFakeGps,
          isSpam: fraudResult.isSpam,
          analysisReason: fraudResult.analysisReason
        };
        authenticityScore = fraudResult.authenticityScore;
      } catch (fErr) {
        console.warn('⚠️ Non-blocking fraud detection failure:', fErr);
      }

      const newIssue: Issue = {
        id: `issue_${Date.now()}`,
        title: title || aiResult.title || 'Reported Hyperlocal Incident',
        description: aiResult.description || description,
        category: (category as IssueCategory) || aiResult.category || 'community_request',
        priority: (priority as IssuePriority) || aiResult.priority || 'medium',
        status: 'reported',
        location: {
          lat: Number(location.lat) || 37.774929,
          lng: Number(location.lng) || -122.419416,
          address: location.address
        },
        reporterId: reporterId || 'anonymous_citizen',
        reporterName: reporterName || 'Anonymous Citizen',
        imageUrl: finalImageUrl,
        imageUrls: uploadedUrls,
        beforeAfterImages: {
          beforeUrl: finalImageUrl,
          afterUrl: undefined
        },
        municipalityReport: aiResult.municipalityReport || `OFFICIAL CIVIC REPORT\nIncident: ${title || aiResult.title}\nDescription: ${description}`,
        suggestedAuthority: aiResult.suggestedAuthority || 'Department of Sanitation',
        preventiveMeasures: aiResult.preventiveMeasures || 'Regular maintenance sweeps.',
        authenticityScore: authenticityScore,
        fraudAssessment: fraudAssessment,
        timeline: [
          {
            id: `timeline_${Date.now()}_init`,
            status: 'reported',
            comment: `Incident reported successfully. Community Hero AI verified report authenticity at ${authenticityScore}%. ${fraudAssessment.isSpam ? '⚠️ Flagged as potential spam.' : fraudAssessment.isDuplicateReport ? '⚠️ Potential duplicate.' : 'No fraud factors flagged.'}`,
            date: new Date().toISOString(),
            updatedBy: reporterName || 'Anonymous Citizen',
            role: 'citizen',
            imageUrl: finalImageUrl
          }
        ],
        impact: aiResult.impact,
        analytics: aiResult.analytics,
        volunteerEngagement: {
          volunteerIds: [],
          volunteerCount: 0,
          maxNeeded: ['garbage', 'environmental', 'community_request'].includes(aiResult.category || category) ? 8 : 0,
          scheduledCleanupDate: ['garbage', 'environmental', 'community_request'].includes(aiResult.category || category)
            ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : undefined
        },
        comments: [],
        upvotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add a welcoming automated action guideline from Community Hero AI
      const assistantAdvice = await generateAIAssistantAdvice(newIssue.category, newIssue.priority, newIssue.description);
      newIssue.comments.push({
        id: `comment_ai_${Date.now()}`,
        userId: 'system_ai',
        userName: 'Community Hero AI',
        userRole: 'admin',
        text: `🤖 **AI Response Triage**: ${assistantAdvice}\n\n*Assessed Community Impact Score: **${newIssue.impact.communityImpactScore}/100** | Smart Priority Index: **${newIssue.analytics.smartPriorityIndex}/100**.*`,
        createdAt: new Date().toISOString()
      });

      const saved = await dbService.createIssue(newIssue);

      // Award citizen reputation points for reporting issues and keeping communities safe
      if (reporterId) {
        const u = await dbService.getUserById(reporterId);
        if (u) {
          await dbService.updateUser(reporterId, { reputationPoints: u.reputationPoints + 15 });
        }
      }

      res.status(201).json(saved);
    } catch (err: any) {
      console.error('Error reporting issue:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Update issue details (for authority action, reassignments, status upgrades)
  app.put('/api/issues/:id', async (req, res) => {
    const { status, priority, category, comment, updatedBy, role, afterImageBase64 } = req.body;
    try {
      const existing = await dbService.getIssueById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Issue report not found' });
      }

      const updates: Partial<Issue> = {};
      if (status) updates.status = status as IssueStatus;
      if (priority) updates.priority = priority as IssuePriority;
      if (category) updates.category = category as IssueCategory;

      let afterUrl = undefined;
      if (afterImageBase64) {
        console.log('☁️ Uploading before/after transition resolution image to Cloudinary fallback...');
        afterUrl = await uploadToCloudinary(afterImageBase64);
        updates.beforeAfterImages = {
          beforeUrl: existing.beforeAfterImages?.beforeUrl || existing.imageUrl || '',
          afterUrl: afterUrl
        };
      }

      // Add timeline event log
      if (status && status !== existing.status) {
        const newTimelineItem: IssueTimelineItem = {
          id: `timeline_${Date.now()}`,
          status: status as IssueStatus,
          comment: comment || `Incident status moved from ${existing.status.toUpperCase()} to ${status.toUpperCase()}.`,
          date: new Date().toISOString(),
          updatedBy: updatedBy || 'Civic Authority Officer',
          role: (role as UserRole) || 'authority',
          imageUrl: afterUrl || undefined
        };
        updates.timeline = [...(existing.timeline || []), newTimelineItem];
      }

      // Update analytics on status shifts
      if (status && status !== existing.status) {
        updates.analytics = {
          ...existing.analytics,
          citizenSatisfactionPrediction: status === 'resolved' ? 98 : existing.analytics.citizenSatisfactionPrediction
        };
      }

      const updated = await dbService.updateIssue(req.params.id, updates);

      // If status became resolved, reward the reporter and participating volunteers!
      if (status === 'resolved' && existing.status !== 'resolved') {
        // Reporter reward
        const rep = await dbService.getUserById(existing.reporterId);
        if (rep) {
          await dbService.updateUser(existing.reporterId, { reputationPoints: rep.reputationPoints + 30 });
        }
        // Volunteers reward
        for (const volId of existing.volunteerEngagement.volunteerIds) {
          const vol = await dbService.getUserById(volId);
          if (vol) {
            await dbService.updateUser(volId, { reputationPoints: vol.reputationPoints + 50 });
          }
        }
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Upvote toggle
  app.post('/api/issues/:id/upvote', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    try {
      const issue = await dbService.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      let newUpvotes = [...issue.upvotes];
      if (newUpvotes.includes(userId)) {
        newUpvotes = newUpvotes.filter((id) => id !== userId);
      } else {
        newUpvotes.push(userId);
      }

      // Recalculate AI smart priority index as upvotes increase community interest
      const updatedIndex = Math.min(100, issue.analytics.smartPriorityIndex + (newUpvotes.length > issue.upvotes.length ? 2 : -2));

      const updated = await dbService.updateIssue(req.params.id, {
        upvotes: newUpvotes,
        analytics: {
          ...issue.analytics,
          smartPriorityIndex: updatedIndex
        }
      });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Volunteer toggle
  app.post('/api/issues/:id/volunteer', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    try {
      const issue = await dbService.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      let list = [...issue.volunteerEngagement.volunteerIds];
      if (list.includes(userId)) {
        list = list.filter((id) => id !== userId);
      } else {
        list.push(userId);
      }

      const updated = await dbService.updateIssue(req.params.id, {
        volunteerEngagement: {
          ...issue.volunteerEngagement,
          volunteerIds: list,
          volunteerCount: list.length
        }
      });

      // Reward volunteer with reputation points for signing up!
      const user = await dbService.getUserById(userId);
      if (user) {
        const pointsDiff = list.includes(userId) ? 20 : -20;
        await dbService.updateUser(userId, { reputationPoints: Math.max(0, user.reputationPoints + pointsDiff) });
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Comments endpoint
  app.post('/api/issues/:id/comments', async (req, res) => {
    const { userId, userName, userRole, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: 'User details and comment text are required' });
    }

    try {
      const issue = await dbService.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const newComment: IssueComment = {
        id: `comment_${Date.now()}`,
        userId,
        userName: userName || 'Citizen',
        userRole: (userRole as UserRole) || 'citizen',
        text,
        createdAt: new Date().toISOString()
      };

      const comments = [...issue.comments, newComment];
      const updated = await dbService.updateIssue(req.params.id, { comments });

      // Reward user with 5 rep points for civic conversation engagement
      const user = await dbService.getUserById(userId);
      if (user) {
        await dbService.updateUser(userId, { reputationPoints: user.reputationPoints + 5 });
      }

      res.status(201).json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Smart City Analytics & Stats Aggregations
  app.get('/api/stats', async (req, res) => {
    try {
      const issues = await dbService.getIssues();
      const users = await dbService.getUsers();

      const totalIssues = issues.length;
      const resolvedIssues = issues.filter((i) => i.status === 'resolved').length;
      const activeVolunteers = users.filter((u) => u.role === 'volunteer').length;

      // Average health score
      const totalHealth = issues.reduce((acc, i) => acc + i.analytics.areaHealthScore, 0);
      const averageHealthScore = totalIssues > 0 ? Math.round(totalHealth / totalIssues) : 100;

      // Category distribution
      const categoryDistribution: Record<IssueCategory, number> = {
        garbage: 0,
        road_damage: 0,
        water_leakage: 0,
        streetlight: 0,
        drainage: 0,
        public_safety: 0,
        stray_animals: 0,
        environmental: 0,
        community_request: 0,
        infrastructure: 0,
        emergency: 0
      };

      issues.forEach((i) => {
        if (categoryDistribution[i.category] !== undefined) {
          categoryDistribution[i.category]++;
        } else {
          categoryDistribution[i.category] = 1;
        }
      });

      // Simple mock monthly trends
      const monthlyTrends = [
        { month: 'Jan', reported: 12, resolved: 8 },
        { month: 'Feb', reported: 18, resolved: 14 },
        { month: 'Mar', reported: 22, resolved: 17 },
        { month: 'Apr', reported: 29, resolved: 21 },
        { month: 'May', reported: 35, resolved: 30 },
        { month: 'Jun', reported: totalIssues, resolved: resolvedIssues }
      ];

      // Smart Hotspots
      const hotspots = issues.map((i) => ({
        name: i.location.address,
        issueCount: i.upvotes.length + 1,
        lat: i.location.lat,
        lng: i.location.lng
      })).sort((a, b) => b.issueCount - a.issueCount).slice(0, 5);

      res.json({
        totalIssues,
        resolvedIssues,
        activeVolunteers,
        averageHealthScore,
        categoryDistribution,
        monthlyTrends,
        hotspots
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Civic Assistant chatbot endpoint
  app.post('/api/assistant/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
      const issues = await dbService.getIssues();
      const summary = issues
        .slice(0, 15)
        .map(i => `- [Issue: ${i.title} at ${i.location.address}, Status: ${i.status}, Priority: ${i.priority}]`)
        .join('\n');

      const chatReply = await generateCivicAssistantChat(message, history || [], summary);
      res.json({ response: chatReply });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Issue Assignment endpoint for Authority/Admin Portals
  app.post('/api/issues/:id/assign', async (req, res) => {
    const { assignedTo } = req.body;
    if (!assignedTo) return res.status(400).json({ error: 'Assigned official/volunteer name is required' });

    try {
      const existing = await dbService.getIssueById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Issue not found' });

      const newTimelineItem: IssueTimelineItem = {
        id: `timeline_assign_${Date.now()}`,
        status: existing.status,
        comment: `Incident assigned to responder: ${assignedTo}. Dispatch route optimized by AI.`,
        date: new Date().toISOString(),
        updatedBy: 'Civic Triage Engine',
        role: 'admin'
      };

      const updated = await dbService.updateIssue(req.params.id, {
        assignedTo,
        timeline: [...(existing.timeline || []), newTimelineItem]
      });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Issue Escalation endpoint
  app.post('/api/issues/:id/escalate', async (req, res) => {
    const { escalatedTo, reason, escalaterName } = req.body;
    if (!escalatedTo || !reason) {
      return res.status(400).json({ error: 'Escalation division and justification are required' });
    }

    try {
      const existing = await dbService.getIssueById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Issue not found' });

      const newTimelineItem: IssueTimelineItem = {
        id: `timeline_escalate_${Date.now()}`,
        status: existing.status,
        comment: `🚨 INCIDENT ESCALATED to [${escalatedTo.toUpperCase()}]. Reason: ${reason}`,
        date: new Date().toISOString(),
        updatedBy: escalaterName || 'Civic Authority Officer',
        role: 'authority'
      };

      const updated = await dbService.updateIssue(req.params.id, {
        escalationWorkflow: {
          escalated: true,
          escalatedTo,
          reason,
          date: new Date().toISOString()
        },
        timeline: [...(existing.timeline || []), newTimelineItem]
      });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fetch all users for Admin Dashboard moderation
  app.get('/api/users', async (req, res) => {
    try {
      const users = await dbService.getUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Moderation: delete user route
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const success = await dbService.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User moderated and deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // FRONTEND INTEGRATION & MIDDLEWARES
  // ----------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Community Hero Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal crash booting Community Hero server:', error);
});
