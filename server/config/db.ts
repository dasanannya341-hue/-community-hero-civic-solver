/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Issue, User } from '../../src/types';

const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_DB_PATH = path.join(process.cwd(), 'server', 'data', 'localDb.json');

// Ensure parent folder exists for local database fallback
function ensureLocalDbExists() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialData = {
      users: [
        {
          id: 'user_citizen',
          name: 'Ananya Das',
          email: 'citizen@communityhero.org',
          role: 'citizen',
          reputationPoints: 45,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          phone: '+1 (555) 019-2834',
          address: '123 Civic Way, Metropolis',
          bio: 'Passionate about hyperlocal ecological sustainability and clean streets.',
          badges: ['Pothole Patrol', 'Green Guardian', 'Civic Mentor'],
          notificationPreferences: { email: true, push: true, sms: false, nearAreaOnly: true, issueStatusUpdates: true, radius: 5 },
          privacySettings: { publicProfile: true, anonymousReporting: false },
          themePreferences: 'nature',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_volunteer',
          name: 'Marcus Vance',
          email: 'volunteer@communityhero.org',
          role: 'volunteer',
          reputationPoints: 120,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          phone: '+1 (555) 014-9876',
          address: '456 Boulevard of Heroes, Metropolis',
          bio: 'Always ready to grab a shovel and help clean our parks. Squad leader of Metropolis Ward 4.',
          badges: ['Trash Buster', 'Action Squad', 'Super Volunteer'],
          notificationPreferences: { email: true, push: true, sms: true, nearAreaOnly: true, issueStatusUpdates: true, radius: 10 },
          privacySettings: { publicProfile: true, anonymousReporting: false },
          themePreferences: 'nature',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_authority',
          name: 'Director Jane Miller',
          email: 'authority@communityhero.org',
          role: 'authority',
          reputationPoints: 0,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          phone: '+1 (555) 012-3456',
          address: 'City Hall Annex, Room 302',
          bio: 'Director of Municipal Sanitation & Infrastructure Planning. Committed to fast response times.',
          badges: ['City Builder', 'Gold Seal Auditor'],
          notificationPreferences: { email: true, push: true, sms: false, nearAreaOnly: false, issueStatusUpdates: true, radius: 25 },
          privacySettings: { publicProfile: true, anonymousReporting: false },
          themePreferences: 'nature',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_admin',
          name: 'Sarah Connor',
          email: 'admin@communityhero.org',
          role: 'admin',
          reputationPoints: 500,
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          phone: '+1 (555) 011-1111',
          address: 'Core Systems Command, Metropolis',
          bio: 'Lead system administrator for the Community Hero Civic Platform.',
          badges: ['Architect Badge', 'Omniscient Moderator'],
          notificationPreferences: { email: true, push: true, sms: true, nearAreaOnly: false, issueStatusUpdates: true, radius: 50 },
          privacySettings: { publicProfile: true, anonymousReporting: false },
          themePreferences: 'dark',
          createdAt: new Date().toISOString()
        }
      ],
      issues: [
        {
          id: 'issue_1',
          title: 'Uncontrolled Garbage Accumulation near Central Park Entrance',
          description: 'A massive pile of residential waste has been dumped next to the primary pedestrian entry of Central Park. It is attracting rodents and creating a strong foul odor that affects hundreds of daily park visitors and children.',
          category: 'garbage',
          priority: 'medium',
          status: 'reported',
          location: {
            lat: 37.774929,
            lng: -122.419416,
            address: 'Central Park North Entrance, 5th Avenue'
          },
          reporterId: 'user_citizen',
          reporterName: 'Ananya Das',
          imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
          imageUrls: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800'],
          beforeAfterImages: {
            beforeUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800'
          },
          municipalityReport: 'OFFICIAL MUNICIPAL HEALTH & SANITATION COMPLAINT\n\nTarget Location: Central Park North Entrance, 5th Avenue\nReport Category: Garbage Accumulation\nAssessed Severity: Medium Priority\n\nThis is a formal report submitted on behalf of local citizens. A substantial accumulation of uncontrolled municipal solid waste has been detected. The build-up is adjacent to a high-pedestrian park entryway. This issue constitutes an immediate hazard to public health and sanitization (rodent vector attraction, visual pollution, biological risk). Regular garbage trucks are requested for municipal clearance.',
          suggestedAuthority: 'Department of Sanitation',
          preventiveMeasures: '1. Establish permanent high-capacity bins.\n2. Put up fine notification signs for active dumping violations.\n3. Install a municipal community CCTV camera.',
          authenticityScore: 92,
          timeline: [
            {
              id: 't1_1',
              status: 'reported',
              comment: 'Incident registered on platform. Handed over to Google Gemini AI for automatic severity sorting.',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              updatedBy: 'System AI',
              role: 'admin'
            }
          ],
          impact: {
            severity: 'Trash pile blocking pedestrian walking path, biological hazard risk.',
            populationAffected: 250,
            areaRisk: 'medium',
            communityImpactScore: 68
          },
          analytics: {
            resolutionETA: '36 Hours',
            escalationRisk: 'medium',
            areaHealthScore: 78,
            smartPriorityIndex: 72,
            citizenSatisfactionPrediction: 85
          },
          volunteerEngagement: {
            volunteerIds: [],
            volunteerCount: 0,
            maxNeeded: 10,
            scheduledCleanupDate: '2026-06-27'
          },
          comments: [
            {
              id: 'comment_1',
              userId: 'user_volunteer',
              userName: 'Marcus Vance',
              userRole: 'volunteer',
              text: 'I can organize a clean-up squad for this Saturday morning. Need about 5 more volunteers!',
              createdAt: new Date().toISOString()
            }
          ],
          upvotes: ['user_volunteer', 'user_admin'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'issue_2',
          title: 'Dangerous Uncapped Manhole on Busy Intersection',
          description: 'An open manhole is completely exposed right on the crosswalk of 12th Street and Mission. It represents a critical safety hazard for both vehicles and pedestrians, especially at night.',
          category: 'public_safety',
          priority: 'critical',
          status: 'in_progress',
          location: {
            lat: 37.769421,
            lng: -122.422114,
            address: 'Intersection of 12th St & Mission St'
          },
          reporterId: 'user_citizen',
          reporterName: 'Ananya Das',
          imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800',
          imageUrls: ['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800'],
          beforeAfterImages: {
            beforeUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800'
          },
          municipalityReport: 'CRITICAL SAFETY HAZARD EMERGENCY DISPATCH REPORT\n\nTarget Location: Intersection of 12th St & Mission St\nReport Category: Public Safety Hazard\nAssessed Severity: Critical Priority\n\nThis is an emergency public safety complaint. An uncapped sewer manhole is exposed within an active pedestrian crosswalk. This issue poses an immediate threat of catastrophic vehicle tire damage or severe pedestrian injuries. Barricades and immediate physical cover dispatch are requested to prevent life-threatening accidents.',
          suggestedAuthority: 'Bureau of Public Works',
          preventiveMeasures: '1. Fit sewers with modern lockable steel covers.\n2. Conduct routine street safety patrols weekly.\n3. Implement immediate glowing neon safety borders on hazardous covers.',
          authenticityScore: 98,
          timeline: [
            {
              id: 't2_1',
              status: 'reported',
              comment: 'Incident registered. Evaluated as Critical falling hazard.',
              date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              updatedBy: 'System AI',
              role: 'admin'
            },
            {
              id: 't2_2',
              status: 'investigating',
              comment: 'Department of Public Works has flagged the report and scheduled emergency crew dispatch.',
              date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              updatedBy: 'Director Jane Miller',
              role: 'authority'
            }
          ],
          impact: {
            severity: 'Immediate high-risk falling hazard, potential vehicle tire destruction.',
            populationAffected: 1200,
            areaRisk: 'high',
            communityImpactScore: 95
          },
          analytics: {
            resolutionETA: '4 Hours',
            escalationRisk: 'high',
            areaHealthScore: 42,
            smartPriorityIndex: 98,
            citizenSatisfactionPrediction: 94
          },
          volunteerEngagement: {
            volunteerIds: [],
            volunteerCount: 0,
            maxNeeded: 0
          },
          comments: [
            {
              id: 'comment_2',
              userId: 'user_authority',
              userName: 'Director Jane Miller',
              userRole: 'authority',
              text: 'Emergency crew has been dispatched to cover and cordon off the area. Permanent replacement cover scheduled to arrive in 3 hours.',
              createdAt: new Date().toISOString()
            }
          ],
          upvotes: ['user_citizen', 'user_volunteer', 'user_admin'],
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Ensure the local fallback exists
ensureLocalDbExists();

// MongoDB Models Definitions (only if MongoDB URI is available)
let MongoUserSchema: any;
let MongoUser: any;
let MongoIssueSchema: any;
let MongoIssue: any;

let isMongoConnected = false;

export async function connectDB() {
  if (!MONGODB_URI) {
    console.log('⚠️ MONGODB_URI environment variable is missing. Operating in local JSON fallback mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB Atlas successfully.');
    isMongoConnected = true;

    // Initialize Schema lazily
    if (!MongoUser) {
      MongoUserSchema = new mongoose.Schema({
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String }, // support hashing in production
        role: { type: String, enum: ['citizen', 'volunteer', 'authority', 'admin'], default: 'citizen' },
        reputationPoints: { type: Number, default: 0 },
        avatar: String,
        phone: String,
        address: String,
        bio: String,
        badges: [String],
        notificationPreferences: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          nearAreaOnly: { type: Boolean, default: true },
          issueStatusUpdates: { type: Boolean, default: true },
          radius: { type: Number, default: 5 }
        },
        privacySettings: {
          publicProfile: { type: Boolean, default: true },
          anonymousReporting: { type: Boolean, default: false }
        },
        themePreferences: { type: String, default: 'nature' },
        createdAt: { type: Date, default: Date.now }
      });
      MongoUser = mongoose.models.User || mongoose.model('User', MongoUserSchema);
    }

    if (!MongoIssue) {
      MongoIssueSchema = new mongoose.Schema({
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
        status: { type: String, enum: ['reported', 'investigating', 'in_progress', 'resolved', 'archived'], default: 'reported' },
        location: {
          lat: Number,
          lng: Number,
          address: String
        },
        reporterId: String,
        reporterName: String,
        imageUrl: String,
        imageUrls: [String],
        beforeAfterImages: {
          beforeUrl: String,
          afterUrl: String
        },
        municipalityReport: String,
        suggestedAuthority: String,
        preventiveMeasures: String,
        authenticityScore: Number,
        timeline: [{
          id: String,
          status: String,
          comment: String,
          date: String,
          updatedBy: String,
          role: String,
          imageUrl: String
        }],
        impact: {
          severity: String,
          populationAffected: Number,
          areaRisk: String,
          communityImpactScore: Number
        },
        analytics: {
          resolutionETA: String,
          escalationRisk: String,
          areaHealthScore: Number,
          smartPriorityIndex: Number,
          citizenSatisfactionPrediction: Number
        },
        volunteerEngagement: {
          volunteerIds: [String],
          volunteerCount: Number,
          maxNeeded: Number,
          scheduledCleanupDate: String
        },
        comments: [{
          id: String,
          userId: String,
          userName: String,
          userRole: String,
          text: String,
          createdAt: String
        }],
        upvotes: [String],
        createdAt: String,
        updatedAt: String
      });
      MongoIssue = mongoose.models.Issue || mongoose.model('Issue', MongoIssueSchema);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    isMongoConnected = false;
    return false;
  }
}

// Global persistence accessors with transparent fallback
function readLocalDb(): { users: User[]; issues: Issue[] } {
  ensureLocalDbExists();
  const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeLocalDb(data: { users: User[]; issues: Issue[] }) {
  ensureLocalDbExists();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const dbService = {
  isUsingMongo: () => isMongoConnected,

  async getUsers(): Promise<User[]> {
    if (isMongoConnected && MongoUser) {
      const users = await MongoUser.find({});
      return users.map((u: any) => u.toObject());
    }
    return readLocalDb().users;
  },

  async getUserById(id: string): Promise<User | null> {
    if (isMongoConnected && MongoUser) {
      const u = await MongoUser.findOne({ id });
      return u ? u.toObject() : null;
    }
    const users = readLocalDb().users;
    return users.find((u) => u.id === id) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    if (isMongoConnected && MongoUser) {
      const u = await MongoUser.findOne({ email });
      return u ? u.toObject() : null;
    }
    const users = readLocalDb().users;
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user: User): Promise<User> {
    if (isMongoConnected && MongoUser) {
      const nu = new MongoUser(user);
      await nu.save();
      return nu.toObject();
    }
    const db = readLocalDb();
    db.users.push(user);
    writeLocalDb(db);
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (isMongoConnected && MongoUser) {
      const updated = await MongoUser.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      return updated ? updated.toObject() : null;
    }
    const db = readLocalDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      writeLocalDb(db);
      return db.users[idx];
    }
    return null;
  },

  async getIssues(): Promise<Issue[]> {
    if (isMongoConnected && MongoIssue) {
      const issues = await MongoIssue.find({});
      return issues.map((i: any) => i.toObject());
    }
    return readLocalDb().issues;
  },

  async getIssueById(id: string): Promise<Issue | null> {
    if (isMongoConnected && MongoIssue) {
      const i = await MongoIssue.findOne({ id });
      return i ? i.toObject() : null;
    }
    const issues = readLocalDb().issues;
    return issues.find((i) => i.id === id) || null;
  },

  async createIssue(issue: Issue): Promise<Issue> {
    if (isMongoConnected && MongoIssue) {
      const ni = new MongoIssue(issue);
      await ni.save();
      return ni.toObject();
    }
    const db = readLocalDb();
    db.issues.push(issue);
    writeLocalDb(db);
    return issue;
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    if (isMongoConnected && MongoIssue) {
      const updated = await MongoIssue.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      return updated ? updated.toObject() : null;
    }
    const db = readLocalDb();
    const idx = db.issues.findIndex((i) => i.id === id);
    if (idx !== -1) {
      db.issues[idx] = { ...db.issues[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalDb(db);
      return db.issues[idx];
    }
    return null;
  },

  async deleteIssue(id: string): Promise<boolean> {
    if (isMongoConnected && MongoIssue) {
      const res = await MongoIssue.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const db = readLocalDb();
    const initialLen = db.issues.length;
    db.issues = db.issues.filter((i) => i.id !== id);
    writeLocalDb(db);
    return db.issues.length < initialLen;
  },

  async deleteUser(id: string): Promise<boolean> {
    if (isMongoConnected && MongoUser) {
      const res = await MongoUser.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const db = readLocalDb();
    const initialLen = db.users.length;
    db.users = db.users.filter((u) => u.id !== id);
    writeLocalDb(db);
    return db.users.length < initialLen;
  }
};
