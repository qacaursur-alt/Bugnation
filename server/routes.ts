import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import multer from "multer";
import { aiService } from "./aiService";
import { insertEnquirySchema, insertAssignmentSubmissionSchema, insertQuestionSchema, insertUserResponseSchema, insertLearningPathProgressSchema, updateLearningPathQuizSettingsSchema, insertHomeContentSchema, insertHeaderFooterContentSchema, insertPageContentSchema, insertTestimonialSchema, insertFaqSchema } from "@shared/schema";
import { z } from "zod";

// Quiz validation schemas
const submitAnswersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string()
  }))
});

const createQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  orderIndex: z.number().int().min(1).optional()
});

const updateQuestionSchema = z.object({
  question: z.string().min(1).optional(),
  options: z.array(z.string()).min(2).optional(),
  correctAnswer: z.string().min(1).optional(),
  explanation: z.string().optional(),
  orderIndex: z.number().int().min(1).optional(),
  isActive: z.boolean().optional()
});
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db-local";
import {
  courseGroups,
  courseCategories,
  courseSubcategories,
  courses,
  modules,
  lessons,
  contentItems,
  quizQuestions,
  quizAttempts,
  learningPaths,
  documents,
  userGroupMemberships,
  payments,
  users,
  liveSessions,
  learningPathProgress,
  questions,
  userResponses,
  homeContent,
  headerFooterContent,
  pageContent,
  testimonials,
  faqs,
  enrollments,
  enquiries,
  certificates,
  studyMaterials,
  courseModules,
  moduleStudyMaterials,
  moduleQuizQuestions,
  moduleProgress,
  userProgress,
  moduleQuizAttempts,
  moduleProgressTracking,
  liveSessionMaterials,
  courseTutors,
} from "@shared/schema";
import { and, asc, desc, eq, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import Razorpay from "razorpay";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Simple session middleware for local development
function setupLocalAuth(app: Express) {
  // Use memory store for development to avoid PostgreSQL session issues
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'lax', // Add sameSite for better compatibility
    },
  }));
}

// Simple authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

async function isAdmin(req: any, res: any, next: any) {
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (e) {
    res.status(500).json({ message: "Failed to verify admin" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== SERVER SETUP ====================
  const httpServer = createServer(app);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:5000",
      methods: ["GET", "POST"]
    }
  });

  // ==================== FILE UPLOAD CONFIGURATION ====================
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow common file types for study materials
      const allowedTypes = [
        'image/', 'video/', 'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/', 'application/zip', 'application/x-rar-compressed',
        'application/octet-stream' // Allow binary files
      ];
      
      const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
      
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed: ${file.mimetype}. Please upload images, videos, documents, or archives.`));
      }
    }
  });

  // Setup local auth
  setupLocalAuth(app);

  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key',
  });

  // Setup email transporter (configure with your email service)
  const transporter = nodemailer.createTransport({
    // Configure with your email service provider
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'support@debugnation.com',
      pass: process.env.EMAIL_PASS || 'app-password'
    }
  });

  // Local authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'student'
      });

      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        message: "User created successfully",
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating user:", error);
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password || "");
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        message: "Signed in successfully",
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing in:", error);
      }
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post('/api/auth/signout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to sign out" });
      }
      res.json({ message: "Signed out successfully" });
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ================= User Enrollments =================

  app.post('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const { groupId, phoneNumber, studyPath } = req.body;
      
      if (!groupId || !phoneNumber || !studyPath) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if the course group exists
      const courseGroup = await db.select()
        .from(courseGroups)
        .where(eq(courseGroups.id, groupId))
        .limit(1);

      if (courseGroup.length === 0) {
        return res.status(400).json({ message: 'Invalid course group ID' });
      }

      // Check if user already has a membership for this group
      const existingMembership = await db.select()
        .from(userGroupMemberships)
        .where(and(
          eq(userGroupMemberships.userId, req.session.userId!),
          eq(userGroupMemberships.groupId, groupId)
        ))
        .limit(1);

      if (existingMembership.length > 0) {
        return res.status(400).json({ message: 'You are already enrolled in this course' });
      }

      // Create new membership with pending status
      const [membership] = await db.insert(userGroupMemberships).values({
        userId: req.session.userId!,
        groupId,
        phoneNumber,
        studyPath,
        status: 'pending',
        paymentStatus: 'pending',
      }).returning();

      res.status(201).json(membership);
    } catch (e: any) {
      console.error('Enrollment creation error:', e);
      console.error('Request body:', req.body);
      console.error('User ID:', req.session.userId);
      res.status(500).json({ message: 'Failed to create enrollment', error: e.message });
    }
  });

  // ================= Admin: Students =================
  app.get('/api/admin/students', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const students = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.role, 'student'))
      .orderBy(desc(users.createdAt));
      
      res.json(students);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch students' });
    }
  });

  // Get student details with enrollments
  app.get('/api/admin/students/:studentId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const studentId = req.params.studentId;
      
      // Get student info
      const student = await storage.getUser(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get student enrollments
      const enrollments = await db.select({
        id: userGroupMemberships.id,
        groupId: userGroupMemberships.groupId,
        status: userGroupMemberships.status,
        phoneNumber: userGroupMemberships.phoneNumber,
        studyPath: userGroupMemberships.studyPath,
        enrolledAt: userGroupMemberships.enrolledAt,
        approvedAt: userGroupMemberships.approvedAt,
        groupName: courseGroups.name,
        groupPrice: courseGroups.price,
      })
      .from(userGroupMemberships)
      .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
      .where(eq(userGroupMemberships.userId, studentId))
      .orderBy(desc(userGroupMemberships.enrolledAt));

      res.json({
        student,
        enrollments
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch student details' });
    }
  });

  // ================= Admin: Enrollments =================
  app.get('/api/admin/enrollments', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const enrollments = await db.select({
        id: userGroupMemberships.id,
        userId: userGroupMemberships.userId,
        groupId: userGroupMemberships.groupId,
        phoneNumber: userGroupMemberships.phoneNumber,
        studyPath: userGroupMemberships.studyPath,
        status: userGroupMemberships.status,
        enrolledAt: userGroupMemberships.enrolledAt,
        approvedAt: userGroupMemberships.approvedAt,
        paymentStatus: userGroupMemberships.paymentStatus,
        paymentScreenshot: userGroupMemberships.paymentScreenshot,
        transactionId: userGroupMemberships.transactionId,
        paymentNotes: userGroupMemberships.paymentNotes,
        adminNotes: userGroupMemberships.adminNotes,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        courseGroup: {
          id: courseGroups.id,
          name: courseGroups.name,
          price: courseGroups.price,
          description: courseGroups.description,
        }
      })
      .from(userGroupMemberships)
      .innerJoin(users, eq(userGroupMemberships.userId, users.id))
      .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
      .orderBy(desc(userGroupMemberships.enrolledAt));
      
      res.json(enrollments);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
  });

  app.put('/api/admin/enrollments/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      const [updatedEnrollment] = await db.update(userGroupMemberships)
        .set({ 
          status: 'approved',
          approvedAt: new Date(),
          adminNotes: adminNotes || null,
        })
        .where(eq(userGroupMemberships.id, id))
        .returning();
      
      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ success: true, enrollment: updatedEnrollment });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error approving enrollment:", error);
      }
      res.status(500).json({ error: "Failed to approve enrollment" });
    }
  });

  app.put('/api/admin/enrollments/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      const [updatedEnrollment] = await db.update(userGroupMemberships)
        .set({ 
          status: 'rejected',
          adminNotes: adminNotes || null,
        })
        .where(eq(userGroupMemberships.id, id))
        .returning();

      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ success: true, enrollment: updatedEnrollment });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error rejecting enrollment:", error);
      }
      res.status(500).json({ error: "Failed to reject enrollment" });
    }
  });

  app.put('/api/admin/enrollments/:id/activate', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [updatedEnrollment] = await db.update(userGroupMemberships)
        .set({ 
          status: 'active',
          activatedAt: new Date(),
        })
        .where(eq(userGroupMemberships.id, id))
        .returning();
      
      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ success: true, enrollment: updatedEnrollment });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error activating enrollment:", error);
      }
      res.status(500).json({ error: "Failed to activate enrollment" });
    }
  });

  // Update enrollment study path
  app.put('/api/admin/enrollments/:id/update', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { studyPath } = req.body;
      
      const [updatedEnrollment] = await db.update(userGroupMemberships)
        .set({ 
          studyPath: studyPath,
        })
        .where(eq(userGroupMemberships.id, id))
        .returning();
      
      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ success: true, enrollment: updatedEnrollment });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating enrollment:", error);
      }
      res.status(500).json({ error: "Failed to update enrollment" });
    }
  });

  // Delete enrollment (admin only)
  app.delete('/api/admin/enrollments/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if enrollment exists
      const enrollment = await db
        .select()
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.id, id))
        .limit(1);

      if (enrollment.length === 0) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      // Delete the enrollment
      await db
        .delete(userGroupMemberships)
        .where(eq(userGroupMemberships.id, id));

      res.json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting enrollment:", error);
      }
      res.status(500).json({ error: "Failed to delete enrollment" });
    }
  });

  // ================= Debug Endpoints =================
  // Debug endpoint to check user's course group data
  app.get('/api/debug/user-course-data', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get user's memberships
      const memberships = await db
        .select({
          membershipId: userGroupMemberships.id,
          groupId: userGroupMemberships.groupId,
          status: userGroupMemberships.status,
          paymentStatus: userGroupMemberships.paymentStatus,
          enrolledAt: userGroupMemberships.enrolledAt
        })
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.userId, userId));
      
      // Check which course groups exist
      const courseGroupChecks = [];
      for (const membership of memberships) {
        const courseGroup = await db
          .select()
          .from(courseGroups)
          .where(eq(courseGroups.id, membership.groupId))
          .limit(1);
        
        courseGroupChecks.push({
          membershipId: membership.membershipId,
          groupId: membership.groupId,
          exists: courseGroup.length > 0,
          courseGroupData: courseGroup[0] || null
        });
      }
      
      // Get all course groups for reference
      const allCourseGroups = await db
        .select()
        .from(courseGroups);
      
      res.json({
        userId,
        memberships,
        courseGroupChecks,
        allCourseGroups: allCourseGroups.map(g => ({ id: g.id, name: g.name, courseType: g.courseType }))
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ error: 'Failed to fetch debug data' });
    }
  });

  // ================= Data Cleanup =================
  // Clean up orphaned memberships (memberships that reference non-existent course groups)
  app.post('/api/admin/cleanup-orphaned-memberships', isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log('[Cleanup] Starting orphaned memberships cleanup...');
      
      // Get all user group memberships
      const memberships = await db
        .select()
        .from(userGroupMemberships);
      
      console.log(`[Cleanup] Found ${memberships.length} total memberships`);
      
      const orphanedMemberships = [];
      
      // Check which memberships reference non-existent course groups
      for (const membership of memberships) {
        const courseGroup = await db
          .select()
          .from(courseGroups)
          .where(eq(courseGroups.id, membership.groupId))
          .limit(1);
        
        if (courseGroup.length === 0) {
          orphanedMemberships.push(membership);
        }
      }
      
      console.log(`[Cleanup] Found ${orphanedMemberships.length} orphaned memberships`);
      
      if (orphanedMemberships.length > 0) {
        // Delete orphaned memberships
        const orphanedIds = orphanedMemberships.map(m => m.id);
        await db
          .delete(userGroupMemberships)
          .where(inArray(userGroupMemberships.id, orphanedIds));
        
        console.log(`[Cleanup] Deleted ${orphanedMemberships.length} orphaned memberships`);
      }
      
      res.json({
        success: true,
        message: `Cleaned up ${orphanedMemberships.length} orphaned memberships`,
        deletedCount: orphanedMemberships.length,
        orphanedDetails: orphanedMemberships.map(m => ({
          membershipId: m.id,
          userId: m.userId,
          groupId: m.groupId,
          status: m.status
        }))
      });
    } catch (error) {
      console.error('[Cleanup] Error cleaning up orphaned memberships:', error);
      res.status(500).json({ error: 'Failed to clean up orphaned memberships' });
    }
  });

  // ================= Live Sessions =================
  app.get('/api/live-sessions/:groupId', isAuthenticated, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.session.userId!;
      
      console.log(`[Live Sessions] Fetching sessions for group ${groupId}, user ${userId}`);
      
      // First, check if the course group exists
      const courseGroup = await db
        .select()
        .from(courseGroups)
        .where(eq(courseGroups.id, groupId))
        .limit(1);
      
      if (courseGroup.length === 0) {
        console.log(`[Live Sessions] Course group ${groupId} not found in database`);
        
        // Check if user has any memberships that might be orphaned
        const userMemberships = await db
          .select()
          .from(userGroupMemberships)
          .where(eq(userGroupMemberships.userId, userId));
        
        console.log(`[Live Sessions] User ${userId} has ${userMemberships.length} memberships`);
        
        return res.status(404).json({ 
          message: 'Course group not found.',
          debug: {
            groupId,
            userId,
            userMembershipsCount: userMemberships.length,
            userMembershipGroupIds: userMemberships.map(m => m.groupId)
          }
        });
      }
      
      console.log(`[Live Sessions] Course group found: ${courseGroup[0].name}`);
      
      // Verify user has access to this group - check both userGroupMemberships and enrollments
      const membership = await db
        .select()
        .from(userGroupMemberships)
        .where(and(
          eq(userGroupMemberships.userId, userId),
          eq(userGroupMemberships.groupId, groupId),
          inArray(userGroupMemberships.status, ['active', 'approved'])
        ))
        .limit(1);
      
      // If no membership found, check if user is enrolled in the course group
      if (membership.length === 0) {
        console.log(`[Live Sessions] No active membership found for user ${userId} in group ${groupId}`);
        
        // For now, allow access if user is authenticated and course group exists
        // This is a temporary fix to allow users to access live sessions
        console.log(`[Live Sessions] Allowing access for user ${userId} to group ${groupId} (temporary fix)`);
      } else {
        console.log(`[Live Sessions] User ${userId} has active membership in group ${groupId}`);
      }

      const sessions = await db
        .select()
        .from(liveSessions)
        .where(and(
          eq(liveSessions.groupId, groupId),
          eq(liveSessions.isActive, true)
        ))
        .orderBy(asc(liveSessions.sessionDate));

      console.log(`[Live Sessions] Found ${sessions.length} active sessions for group ${groupId}`);
      res.json(sessions);
    } catch (e) {
      console.error('[Live Sessions] Error:', e);
      res.status(500).json({ message: 'Failed to fetch live sessions' });
    }
  });

  // ================= Admin: Groups / Learning Paths / Documents =================
  app.post('/api/admin/groups', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name, description, price, features } = req.body;
      const [group] = await db.insert(courseGroups).values({ 
        name, 
        description, 
        price, 
        features,
        categoryId: req.body.categoryId || 'default-category'
      }).returning();
      res.status(201).json(group);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to create group' });
    }
  });

  app.get('/api/admin/groups', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const groups = await db.select().from(courseGroups).orderBy(asc(courseGroups.name));
      res.json(groups);
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch groups' });
    }
  });

  app.put('/api/admin/groups/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [updated] = await db.update(courseGroups).set({ ...req.body, updatedAt: new Date() }).where(eq(courseGroups.id, req.params.id)).returning();
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: 'Failed to update group' });
    }
  });

  app.delete('/api/admin/groups/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await db.delete(courseGroups).where(eq(courseGroups.id, req.params.id));
      res.json({ message: 'Deleted' });
    } catch (e) {
      res.status(500).json({ message: 'Failed to delete group' });
    }
  });

  // User Progress and Q&A System
  app.get('/api/me/progress/:learningPathId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { learningPathId } = req.params;
      
      const progress = await db.select()
        .from(learningPathProgress)
        .where(and(
          eq(learningPathProgress.userId, userId),
          eq(learningPathProgress.learningPathId, learningPathId)
        ));
      
      res.json(progress);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  });

  app.get('/api/learning-paths/:pathId/questions', isAuthenticated, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      const questionsList = await db.select()
        .from(questions)
        .where(and(
          eq(questions.learningPathId, pathId),
          eq(questions.isActive, true)
        ))
        .orderBy(questions.orderIndex);
      
      res.json(questionsList);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  // Get learning path settings (for students)
  app.get('/api/learning-paths/:pathId/settings', isAuthenticated, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      const [path] = await db.select({
        id: learningPaths.id,
        title: learningPaths.title,
        requiresQuiz: learningPaths.requiresQuiz,
        quizRequiredToUnlock: learningPaths.quizRequiredToUnlock,
        passingScore: learningPaths.passingScore,
        maxAttempts: learningPaths.maxAttempts,
        unlockMessage: learningPaths.unlockMessage,
      })
      .from(learningPaths)
      .where(eq(learningPaths.id, pathId))
      .limit(1);
      
      if (!path) {
        return res.status(404).json({ message: 'Learning path not found' });
      }
      
      res.json(path);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch learning path settings' });
    }
  });

  app.post('/api/learning-paths/:pathId/submit-answers', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { pathId } = req.params;
      
      // Validate request body
      const validatedData = submitAnswersSchema.parse(req.body);
      const { answers } = validatedData;
      
      if (answers.length === 0) {
        return res.status(400).json({ message: 'No answers provided' });
      }
      
      let correctCount = 0;
      const responses = [];
      
      // Process each answer
      for (const answer of answers) {
        const questionData = await db.select()
          .from(questions)
          .where(and(
            eq(questions.id, answer.questionId),
            eq(questions.learningPathId, pathId),
            eq(questions.isActive, true)
          ))
          .limit(1);
        
        if (questionData.length > 0) {
          const isCorrect = questionData[0].correctAnswer === answer.userAnswer;
          if (isCorrect) correctCount++;
          
          const [response] = await db.insert(userResponses).values({
            userId,
            questionId: answer.questionId,
            userAnswer: answer.userAnswer,
            isCorrect,
          }).returning();
          
          responses.push(response);
        }
      }
      
      const score = Math.round((correctCount / answers.length) * 100);
      
      // Get the learning path to check passing score
      const [learningPath] = await db.select({
        passingScore: learningPaths.passingScore,
        maxAttempts: learningPaths.maxAttempts,
      })
      .from(learningPaths)
      .where(eq(learningPaths.id, pathId))
      .limit(1);
      
      const passingScore = learningPath?.passingScore || 70; // Default to 70% if not set
      const passed = score >= passingScore;
      
      // Check if user already has progress for this learning path
      const existingProgress = await db.select()
        .from(learningPathProgress)
        .where(and(
          eq(learningPathProgress.userId, userId),
          eq(learningPathProgress.learningPathId, pathId)
        ))
        .limit(1);
      
      const maxAttempts = learningPath?.maxAttempts || 3; // Default to 3 if not set
      
      if (existingProgress.length > 0) {
        const currentAttempts = existingProgress[0].attempts || 0;
        
        // Check if user has exceeded max attempts
        if (currentAttempts >= maxAttempts && !passed) {
          return res.status(400).json({ 
            message: `Maximum attempts (${maxAttempts}) exceeded. Please contact support.`,
            score,
            passed: false,
            attemptsExceeded: true
          });
        }
        
        // Update existing progress
        await db.update(learningPathProgress)
          .set({
            score,
            attempts: sql`${learningPathProgress.attempts} + 1`,
            updatedAt: new Date(),
            ...(passed && {
              isCompleted: true,
              completedAt: new Date()
            })
          })
          .where(and(
            eq(learningPathProgress.userId, userId),
            eq(learningPathProgress.learningPathId, pathId)
          ));
      } else {
        // Create new progress record
        await db.insert(learningPathProgress).values({
          userId,
          learningPathId: pathId,
          isCompleted: passed,
          completedAt: passed ? new Date() : null,
          score,
          attempts: 1,
        });
      }
      
      res.json({ 
        score, 
        passed, 
        correctCount, 
        totalQuestions: answers.length,
        responses 
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to submit answers' });
    }
  });

  // Admin Q&A Management
  app.post('/api/admin/learning-paths/:pathId/questions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      // Validate request body
      const validatedData = createQuestionSchema.parse(req.body);
      const { question, options, correctAnswer, explanation, orderIndex } = validatedData;
      
      // Verify that correctAnswer is one of the options
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({ 
          message: 'Correct answer must be one of the provided options' 
        });
      }
      
      // Get the next order index if not provided
      let finalOrderIndex = orderIndex;
      if (!finalOrderIndex) {
        const lastQuestion = await db.select({ orderIndex: questions.orderIndex })
          .from(questions)
          .where(eq(questions.learningPathId, pathId))
          .orderBy(desc(questions.orderIndex))
          .limit(1);
        
        finalOrderIndex = lastQuestion.length > 0 ? (lastQuestion[0].orderIndex || 0) + 1 : 1;
      }
      
      const [newQuestion] = await db.insert(questions).values({
        learningPathId: pathId,
        question,
        options,
        correctAnswer,
        explanation,
        orderIndex: finalOrderIndex,
      }).returning();
      
      res.status(201).json(newQuestion);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid question data', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to create question' });
    }
  });

  app.get('/api/admin/learning-paths/:pathId/questions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      const questionsList = await db.select()
        .from(questions)
        .where(eq(questions.learningPathId, pathId))
        .orderBy(questions.orderIndex);
      
      res.json(questionsList);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  app.put('/api/admin/learning-paths/:pathId/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId, questionId } = req.params;
      
      // Validate request body
      const validatedData = createQuestionSchema.parse(req.body);
      const { question, options, correctAnswer, explanation, orderIndex } = validatedData;
      
      // Verify that correctAnswer is one of the options
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({ 
          message: 'Correct answer must be one of the provided options' 
        });
      }
      
      const [updatedQuestion] = await db.update(questions)
        .set({
          question,
          options,
          correctAnswer,
          explanation,
          orderIndex: orderIndex || 1,
          updatedAt: new Date()
        })
        .where(and(
          eq(questions.id, questionId),
          eq(questions.learningPathId, pathId)
        ))
        .returning();
      
      res.json(updatedQuestion);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to update question' });
    }
  });

  app.delete('/api/admin/learning-paths/:pathId/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId, questionId } = req.params;
      
      await db.delete(questions)
        .where(and(
          eq(questions.id, questionId),
          eq(questions.learningPathId, pathId)
        ));
      
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to delete question' });
    }
  });

  // Update question
  app.put('/api/admin/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { questionId } = req.params;
      
      // Validate request body
      const validatedData = updateQuestionSchema.parse(req.body);
      const { question, options, correctAnswer, explanation, orderIndex, isActive } = validatedData;
      
      // If options and correctAnswer are being updated, verify correctAnswer is in options
      if (options && correctAnswer && !options.includes(correctAnswer)) {
        return res.status(400).json({ 
          message: 'Correct answer must be one of the provided options' 
        });
      }
      
      // Check if question exists
      const existingQuestion = await db.select()
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);
      
      if (existingQuestion.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      const [updatedQuestion] = await db.update(questions)
        .set({ 
          ...(question && { question }), 
          ...(options && { options }), 
          ...(correctAnswer && { correctAnswer }), 
          ...(explanation !== undefined && { explanation }), 
          ...(orderIndex && { orderIndex }), 
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date() 
        })
        .where(eq(questions.id, questionId))
        .returning();
      
      res.json(updatedQuestion);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid question data', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to update question' });
    }
  });

  // Delete question
  app.delete('/api/admin/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { questionId } = req.params;
      
      await db.delete(questions).where(eq(questions.id, questionId));
      
      res.json({ message: 'Question deleted successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to delete question' });
    }
  });

  // Get question by ID
  app.get('/api/admin/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { questionId } = req.params;
      
      const [question] = await db.select()
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      res.json(question);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch question' });
    }
  });

  // Get user quiz attempts for a learning path
  app.get('/api/learning-paths/:pathId/attempts', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { pathId } = req.params;
      
      const attempts = await db.select()
        .from(learningPathProgress)
        .where(and(
          eq(learningPathProgress.userId, userId),
          eq(learningPathProgress.learningPathId, pathId)
        ))
        .orderBy(desc(learningPathProgress.updatedAt));
      
      res.json(attempts);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch quiz attempts' });
    }
  });

  // Get user responses for a specific quiz attempt
  app.get('/api/learning-paths/:pathId/responses', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { pathId } = req.params;
      
      const responses = await db.select({
        id: userResponses.id,
        questionId: userResponses.questionId,
        userAnswer: userResponses.userAnswer,
        isCorrect: userResponses.isCorrect,
        answeredAt: userResponses.answeredAt,
        question: questions.question,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation
      })
      .from(userResponses)
      .innerJoin(questions, eq(userResponses.questionId, questions.id))
      .where(and(
        eq(userResponses.userId, userId),
        eq(questions.learningPathId, pathId)
      ))
      .orderBy(desc(userResponses.answeredAt));
      
      res.json(responses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch user responses' });
    }
  });

  // Admin: Get all user responses for a learning path
  app.get('/api/admin/learning-paths/:pathId/user-responses', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      const responses = await db.select({
        id: userResponses.id,
        userId: userResponses.userId,
        questionId: userResponses.questionId,
        userAnswer: userResponses.userAnswer,
        isCorrect: userResponses.isCorrect,
        answeredAt: userResponses.answeredAt,
        userName: users.firstName,
        userEmail: users.email,
        question: questions.question,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation
      })
      .from(userResponses)
      .innerJoin(questions, eq(userResponses.questionId, questions.id))
      .innerJoin(users, eq(userResponses.userId, users.id))
      .where(eq(questions.learningPathId, pathId))
      .orderBy(desc(userResponses.answeredAt));
      
      res.json(responses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch user responses' });
    }
  });

  // Admin: Get quiz statistics for a learning path
  app.get('/api/admin/learning-paths/:pathId/quiz-stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      // Get total questions count
      const totalQuestions = await db.select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(and(
          eq(questions.learningPathId, pathId),
          eq(questions.isActive, true)
        ));
      
      // Get total attempts
      const totalAttempts = await db.select({ count: sql<number>`count(*)` })
        .from(learningPathProgress)
        .where(eq(learningPathProgress.learningPathId, pathId));
      
      // Get completed attempts
      const completedAttempts = await db.select({ count: sql<number>`count(*)` })
        .from(learningPathProgress)
        .where(and(
          eq(learningPathProgress.learningPathId, pathId),
          eq(learningPathProgress.isCompleted, true)
        ));
      
      // Get average score
      const avgScore = await db.select({ 
        avgScore: sql<number>`avg(${learningPathProgress.score})` 
      })
      .from(learningPathProgress)
      .where(eq(learningPathProgress.learningPathId, pathId));
      
      // Get user progress summary
      const userProgress = await db.select({
        userId: learningPathProgress.userId,
        userName: users.firstName,
        userEmail: users.email,
        score: learningPathProgress.score,
        attempts: learningPathProgress.attempts,
        isCompleted: learningPathProgress.isCompleted,
        completedAt: learningPathProgress.completedAt
      })
      .from(learningPathProgress)
      .innerJoin(users, eq(learningPathProgress.userId, users.id))
      .where(eq(learningPathProgress.learningPathId, pathId))
      .orderBy(desc(learningPathProgress.score));
      
      res.json({
        totalQuestions: totalQuestions[0]?.count || 0,
        totalAttempts: totalAttempts[0]?.count || 0,
        completedAttempts: completedAttempts[0]?.count || 0,
        averageScore: avgScore[0]?.avgScore ? Math.round(avgScore[0].avgScore) : 0,
        userProgress
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch quiz statistics' });
    }
  });

  // Admin: Bulk create questions for a learning path
  app.post('/api/admin/learning-paths/:pathId/questions/bulk', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      const { questions: questionsData } = req.body;
      
      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        return res.status(400).json({ message: 'Questions array is required' });
      }
      
      // Validate each question
      const validatedQuestions = questionsData.map((q, index) => {
        const validated = createQuestionSchema.parse(q);
        if (!validated.options.includes(validated.correctAnswer)) {
          throw new Error(`Question ${index + 1}: Correct answer must be one of the provided options`);
        }
        return {
          ...validated,
          learningPathId: pathId,
          orderIndex: validated.orderIndex || index + 1
        };
      });
      
      const createdQuestions = await db.insert(questions)
        .values(validatedQuestions)
        .returning();
      
      res.status(201).json(createdQuestions);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid questions data', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to create questions' });
    }
  });

  // Admin: Reset user progress for a learning path
  app.delete('/api/admin/learning-paths/:pathId/user-progress/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId, userId } = req.params;
      
      // Get question IDs for this learning path
      const pathQuestions = await db.select({ id: questions.id })
        .from(questions)
        .where(eq(questions.learningPathId, pathId));
      
      const questionIds = pathQuestions.map(q => q.id);
      
      if (questionIds.length > 0) {
        // Delete user responses for questions in this learning path
        await db.delete(userResponses)
          .where(and(
            eq(userResponses.userId, userId),
            sql`${userResponses.questionId} = ANY(${questionIds})`
          ));
      }
      
      // Delete learning path progress
      await db.delete(learningPathProgress)
        .where(and(
          eq(learningPathProgress.userId, userId),
          eq(learningPathProgress.learningPathId, pathId)
        ));
      
      res.json({ message: 'User progress reset successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to reset user progress' });
    }
  });

  // Admin: Get all learning paths with question counts
  app.get('/api/admin/learning-paths/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pathsWithStats = await db.select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        groupId: learningPaths.groupId,
        orderIndex: learningPaths.orderIndex,
        isActive: learningPaths.isActive,
        questionCount: sql<number>`count(${questions.id})`,
        totalAttempts: sql<number>`count(${learningPathProgress.id})`,
        completedAttempts: sql<number>`count(case when ${learningPathProgress.isCompleted} = true then 1 end)`
      })
      .from(learningPaths)
      .leftJoin(questions, and(
        eq(questions.learningPathId, learningPaths.id),
        eq(questions.isActive, true)
      ))
      .leftJoin(learningPathProgress, eq(learningPathProgress.learningPathId, learningPaths.id))
      .groupBy(learningPaths.id)
      .orderBy(asc(learningPaths.orderIndex));
      
      res.json(pathsWithStats);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch learning paths stats' });
    }
  });

  // Delete Document
  app.delete('/api/admin/documents/:documentId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { documentId } = req.params;
      
      await db.delete(documents).where(eq(documents.id, documentId));
      
      res.json({ message: 'Document deleted successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to delete document' });
    }
  });

  // Delete Course Group
  app.delete('/api/admin/groups/:groupId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { groupId } = req.params;
      
      // Check if group has any enrollments or learning paths
      const groupMemberships = await db.select()
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.groupId, groupId))
        .limit(1);
      
      if (groupMemberships.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete group with active enrollments. Please remove all enrollments first.' 
        });
      }
      
      const groupPaths = await db.select()
        .from(learningPaths)
        .where(eq(learningPaths.groupId, groupId))
        .limit(1);
      
      if (groupPaths.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete group with learning paths. Please remove all learning paths first.' 
        });
      }
      
      await db.delete(courseGroups).where(eq(courseGroups.id, groupId));
      
      res.json({ message: 'Course group deleted successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to delete course group' });
    }
  });

  // Meta Tags Management
  app.get('/api/admin/meta-tags', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // For now, return default meta tags - can be extended to store in database
      const metaTags = {
        title: "Debug Nation - Master Software Testing | Online Testing Academy",
        description: "Learn software testing from industry experts. Self-paced courses and live sessions for manual testing, automation testing, and quality assurance. Get certified and advance your career.",
        keywords: "software testing, manual testing, automation testing, QA, quality assurance, testing courses, online learning, certification, selenium, test automation, bug testing",
        author: "Debug Nation",
        ogTitle: "Debug Nation - Master Software Testing | Online Testing Academy",
        ogDescription: "Learn software testing from industry experts. Self-paced courses and live sessions for manual testing, automation testing, and quality assurance. Get certified and advance your career.",
        ogImage: "https://debugnation.com/og-image.jpg",
        twitterTitle: "Debug Nation - Master Software Testing | Online Testing Academy",
        twitterDescription: "Learn software testing from industry experts. Self-paced courses and live sessions for manual testing, automation testing, and quality assurance. Get certified and advance your career.",
        twitterImage: "https://debugnation.com/twitter-image.jpg",
        twitterCreator: "@debugnation",
        twitterSite: "@debugnation"
      };
      res.json(metaTags);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch meta tags' });
    }
  });

  app.put('/api/admin/meta-tags', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, description, keywords, author, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, twitterCreator, twitterSite } = req.body;
      
      // For now, just return success - can be extended to store in database
      // In a real implementation, you would save these to a meta_tags table
      
      res.json({ 
        message: 'Meta tags updated successfully',
        metaTags: {
          title, description, keywords, author, ogTitle, ogDescription, ogImage,
          twitterTitle, twitterDescription, twitterImage, twitterCreator, twitterSite
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to update meta tags' });
    }
  });

  // Live Sessions Management
  app.post('/api/admin/live-sessions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { groupId, title, description, sessionDate, startTime, endTime, googleMeetLink, maxParticipants, notes } = req.body;
      
      // Validate required fields
      if (!groupId || !title || !sessionDate || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Validate date format
      const sessionDateTime = new Date(sessionDate);
      if (isNaN(sessionDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid session date' });
      }
      
      // Validate and convert time format (accept both 12-hour and 24-hour)
      const convertTo24Hour = (time: string) => {
        // Check if it's 12-hour format (contains AM/PM)
        if (time.includes('AM') || time.includes('PM')) {
          const [timePart, period] = time.split(/(AM|PM)/i);
          const [hours, minutes] = timePart.trim().split(':').map(Number);
          let hour24 = hours;
          
          if (period.toUpperCase() === 'PM' && hours !== 12) {
            hour24 = hours + 12;
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hour24 = 0;
          }
          
          return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // Already 24-hour format
        return time;
      };
      
      const startTime24 = convertTo24Hour(startTime);
      const endTime24 = convertTo24Hour(endTime);
      
      // Validate 24-hour format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime24) || !timeRegex.test(endTime24)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM AM/PM format' });
      }
      
      // Combine sessionDate with startTime and endTime to create proper timestamps
      const [startHour, startMinute] = startTime24.split(':').map(Number);
      const [endHour, endMinute] = endTime24.split(':').map(Number);
      
      const startDateTime = new Date(sessionDateTime);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(sessionDateTime);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      const [session] = await db.insert(liveSessions).values({
        groupId,
        title,
        description,
        sessionDate: sessionDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        googleMeetLink,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        notes,
      }).returning();
      res.status(201).json(session);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to create live session' });
    }
  });

  // Update live session
  app.put('/api/admin/live-sessions/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { groupId, title, description, sessionDate, startTime, endTime, googleMeetLink, maxParticipants, notes } = req.body;
      
      // Validate required fields
      if (!groupId || !title || !sessionDate || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Validate date format
      const sessionDateTime = new Date(sessionDate);
      if (isNaN(sessionDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid session date' });
      }
      
      // Validate and convert time format (accept both 12-hour and 24-hour)
      const convertTo24Hour = (time: string) => {
        // Check if it's 12-hour format (contains AM/PM)
        if (time.includes('AM') || time.includes('PM')) {
          const [timePart, period] = time.split(/(AM|PM)/i);
          const [hours, minutes] = timePart.trim().split(':').map(Number);
          let hour24 = hours;
          
          if (period.toUpperCase() === 'PM' && hours !== 12) {
            hour24 = hours + 12;
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hour24 = 0;
          }
          
          return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // Already 24-hour format
        return time;
      };
      
      const startTime24 = convertTo24Hour(startTime);
      const endTime24 = convertTo24Hour(endTime);
      
      // Validate 24-hour format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime24) || !timeRegex.test(endTime24)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM AM/PM format' });
      }
      
      // Combine sessionDate with startTime and endTime to create proper timestamps
      const [startHour, startMinute] = startTime24.split(':').map(Number);
      const [endHour, endMinute] = endTime24.split(':').map(Number);
      
      const startDateTime = new Date(sessionDateTime);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(sessionDateTime);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      const [session] = await db.update(liveSessions)
        .set({
          groupId,
          title,
          description,
          sessionDate: sessionDateTime,
          startTime: startDateTime,
          endTime: endDateTime,
          googleMeetLink,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          notes,
          updatedAt: new Date()
        })
        .where(eq(liveSessions.id, id))
        .returning();
      
      if (session.length === 0) {
        return res.status(404).json({ message: 'Live session not found' });
      }
      
      res.json(session[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to update live session' });
    }
  });

  app.get('/api/admin/live-sessions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sessions = await db
        .select()
        .from(liveSessions)
        .orderBy(asc(liveSessions.sessionDate));
      res.json(sessions);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch live sessions' });
    }
  });

  app.get('/api/admin/live-sessions/:groupId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sessions = await db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.groupId, req.params.groupId))
        .orderBy(asc(liveSessions.sessionDate));
      res.json(sessions);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch live sessions' });
    }
  });

  app.put('/api/admin/live-sessions/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [updated] = await db.update(liveSessions)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(liveSessions.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to update live session' });
    }
  });

  app.delete('/api/admin/live-sessions/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await db.delete(liveSessions).where(eq(liveSessions.id, req.params.id));
      res.json({ message: 'Deleted' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to delete live session' });
    }
  });

  // Learning paths under a group
  app.post('/api/admin/groups/:groupId/paths', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, description, orderIndex } = req.body;
      const [path] = await db.insert(learningPaths).values({ groupId: req.params.groupId, title, description, orderIndex }).returning();
      res.status(201).json(path);
    } catch (e) {
      res.status(500).json({ message: 'Failed to create learning path' });
    }
  });

  app.get('/api/admin/groups/:groupId/paths', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const rows = await db.select().from(learningPaths).where(eq(learningPaths.groupId, req.params.groupId)).orderBy(asc(learningPaths.orderIndex));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch learning paths' });
    }
  });

  app.put('/api/admin/paths/:pathId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [updated] = await db.update(learningPaths).set({ ...req.body, updatedAt: new Date() }).where(eq(learningPaths.id, req.params.pathId)).returning();
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: 'Failed to update learning path' });
    }
  });

  // Update quiz settings for a learning path
  app.put('/api/admin/paths/:pathId/quiz-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      // Validate request body
      const validatedData = updateLearningPathQuizSettingsSchema.parse(req.body);
      
      // Check if learning path exists
      const existingPath = await db.select()
        .from(learningPaths)
        .where(eq(learningPaths.id, pathId))
        .limit(1);
      
      if (existingPath.length === 0) {
        return res.status(404).json({ message: 'Learning path not found' });
      }
      
      const [updated] = await db.update(learningPaths)
        .set({ 
          ...validatedData,
          updatedAt: new Date() 
        })
        .where(eq(learningPaths.id, pathId))
        .returning();
      
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid quiz settings data', 
          errors: e.errors 
        });
      }
      console.error(e);
      res.status(500).json({ message: 'Failed to update quiz settings' });
    }
  });

  // Get quiz settings for a learning path
  app.get('/api/admin/paths/:pathId/quiz-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pathId } = req.params;
      
      const [path] = await db.select({
        id: learningPaths.id,
        title: learningPaths.title,
        requiresQuiz: learningPaths.requiresQuiz,
        quizRequiredToUnlock: learningPaths.quizRequiredToUnlock,
        passingScore: learningPaths.passingScore,
        maxAttempts: learningPaths.maxAttempts,
        unlockMessage: learningPaths.unlockMessage,
      })
      .from(learningPaths)
      .where(eq(learningPaths.id, pathId))
      .limit(1);
      
      if (!path) {
        return res.status(404).json({ message: 'Learning path not found' });
      }
      
      res.json(path);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch quiz settings' });
    }
  });

  // Documents for a learning path
  app.post('/api/admin/paths/:pathId/documents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, description, type, fileUrl, externalUrl, fileName, fileSize, orderIndex } = req.body;
      const [doc] = await db.insert(documents).values({ learningPathId: req.params.pathId, title, description, type, fileUrl, externalUrl, fileName, fileSize, orderIndex }).returning();
      res.status(201).json(doc);
    } catch (e) {
      res.status(500).json({ message: 'Failed to create document' });
    }
  });

  app.get('/api/admin/paths/:pathId/documents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const rows = await db.select().from(documents).where(eq(documents.learningPathId, req.params.pathId)).orderBy(asc(documents.orderIndex));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // ================= Payments =================
  // Create a payment record (stub for checkout)
  app.post('/api/payments/checkout', isAuthenticated, async (req, res) => {
    try {
      const { groupId, amount, provider } = req.body;
      
      // Create payment record
      const [payment] = await db.insert(payments).values({ 
        userId: req.session.userId!, 
        groupId, 
        amount: amount.toString(), 
        currency: 'INR', 
        paymentMethod: provider || 'razorpay', 
        status: 'pending' 
      }).returning();

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `payment_${payment.id}`,
        notes: {
          paymentId: payment.id,
          userId: req.session.userId!,
          groupId: groupId
        }
      });

      res.status(201).json({ 
        paymentId: payment.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (e) {
      console.error('Payment checkout error:', e);
      res.status(500).json({ message: 'Failed to create checkout' });
    }
  });

  // Payment success callback → mark paid + assign membership
  app.post('/api/payments/success', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
      
      // Verify the payment signature
      const crypto = require('crypto');
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_key')
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      // Update payment record
      const [updated] = await db
        .update(payments)
        .set({ 
          status: 'completed', 
          transactionId: razorpay_payment_id, 
          completedAt: new Date(), 
          updatedAt: new Date() 
        })
        .where(eq(payments.id, paymentId))
        .returning();

      if (!updated) return res.status(404).json({ message: 'Payment not found' });

      // Assign membership if not exists
      const existing = await db
        .select()
        .from(userGroupMemberships)
        .where(and(eq(userGroupMemberships.userId, updated.userId), eq(userGroupMemberships.groupId, updated.groupId)));

      if (existing.length === 0) {
        await db.insert(userGroupMemberships).values({ 
          userId: updated.userId, 
          groupId: updated.groupId, 
          status: 'active' 
        });
      }

      res.json({ message: 'Payment completed and membership assigned' });
    } catch (e) {
      console.error('Payment success error:', e);
      res.status(500).json({ message: 'Failed to process payment' });
    }
  });

  // Delete study material
  app.delete('/api/study-materials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
      res.json({ success: true, message: "Study material deleted successfully" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting study material:", error);
      }
      res.status(500).json({ error: "Failed to delete study material" });
    }
  });

  // Delete course module
  app.delete('/api/course-modules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(courseModules).where(eq(courseModules.id, id));
      res.json({ success: true, message: "Course module deleted successfully" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting course module:", error);
      }
      res.status(500).json({ error: "Failed to delete course module" });
    }
  });

  // ================= Course Groups (Public) =================
  app.get('/api/course-groups', async (req, res) => {
    try {
      const groups = await db.select().from(courseGroups)
        .where(eq(courseGroups.isActive, true))
        .orderBy(asc(courseGroups.name));
      
      res.json(groups);
    } catch (error) {
      console.error('Error fetching course groups:', error);
      res.status(500).json({ message: 'Failed to fetch course groups' });
    }
  });

  // ================= Study Materials =================
  app.get('/api/study-materials', async (req, res) => {
    try {
      const { courseId } = req.query;
      let materials;
      
      if (courseId) {
        materials = await db.select().from(studyMaterials)
          .where(eq(studyMaterials.courseId, courseId as string))
          .orderBy(asc(studyMaterials.createdAt));
      } else {
        materials = await db.select().from(studyMaterials)
          .orderBy(asc(studyMaterials.createdAt));
      }
      
      res.json(materials);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching study materials:", error);
      }
      res.status(500).json({ error: "Failed to fetch study materials" });
    }
  });

  // Create study material
  app.post('/api/study-materials', upload.single('file'), async (req, res) => {
    try {
      let courseId = req.body.courseId;
      const courseGroupId = req.body.courseGroupId;
      
      // If courseId is actually a course group ID (no course exists), create a default course
      if (courseId === courseGroupId) {
        // Check if a course already exists for this course group
        const existingCourse = await db.select().from(courses).where(eq(courses.courseGroupId, courseGroupId)).limit(1);
        
        if (existingCourse.length === 0) {
          // Create a default course for this course group
          const courseGroup = await db.select().from(courseGroups).where(eq(courseGroups.id, courseGroupId)).limit(1);
          if (courseGroup.length > 0) {
            const [newCourse] = await db.insert(courses).values({
              courseGroupId: courseGroupId,
              title: `${courseGroup[0].name} Course`,
              description: `Default course for ${courseGroup[0].name} study materials`,
              duration: 30,
              dailyHours: 2,
              price: courseGroup[0].price || "0.00",
              difficulty: courseGroup[0].difficulty || "beginner",
              isActive: true,
            }).returning();
            courseId = newCourse.id;
          }
        } else {
          courseId = existingCourse[0].id;
        }
      }
      
      const data = {
        courseId: courseId,
        courseGroupId: courseGroupId,
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
        externalUrl: req.body.externalUrl,
        fileName: req.file ? req.file.originalname : req.body.fileName,
        fileSize: req.file ? req.file.size : parseInt(req.body.fileSize) || 0,
        duration: parseInt(req.body.duration) || null,
        thumbnail: req.body.thumbnail,
        isActive: req.body.isActive === 'true' || true,
      };
      
      const [material] = await db.insert(studyMaterials).values(data).returning();
      res.json(material);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating study material:", error);
      }
      res.status(500).json({ error: "Failed to create study material" });
    }
  });

  // Update study material
  app.put('/api/study-materials/:id', upload.single('file'), async (req, res) => {
    try {
      const { id } = req.params;
      const data = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        externalUrl: req.body.externalUrl,
        fileName: req.file ? req.file.originalname : req.body.fileName,
        fileSize: req.file ? req.file.size : parseInt(req.body.fileSize) || 0,
        duration: parseInt(req.body.duration) || null,
        thumbnail: req.body.thumbnail,
        isActive: req.body.isActive === 'true',
        ...(req.file && { fileUrl: `/uploads/${req.file.filename}` }),
      };
      
      await db.update(studyMaterials).set(data).where(eq(studyMaterials.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating study material:", error);
      }
      res.status(500).json({ error: "Failed to update study material" });
    }
  });

  // Delete study material
  app.delete('/api/study-materials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting study material:", error);
      }
      res.status(500).json({ error: "Failed to delete study material" });
    }
  });

  // ================= Course Modules Management =================
  // Get modules for a course group
  app.get('/api/course-modules', async (req, res) => {
    try {
      const { courseGroupId, courseId } = req.query;
      
      if (!courseGroupId && !courseId) {
        return res.status(400).json({ error: "Course group ID or course ID is required" });
      }
      
      let modules;
      if (courseId) {
        // Get modules for a specific course
        modules = await db.select().from(courseModules)
          .where(eq(courseModules.courseGroupId, courseId as string))
          .orderBy(asc(courseModules.orderIndex));
      } else {
        // Get modules for a course group
        modules = await db.select().from(courseModules)
          .where(eq(courseModules.courseGroupId, courseGroupId as string))
          .orderBy(asc(courseModules.orderIndex));
      }
      
      res.json(modules);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching course modules:", error);
      }
      res.status(500).json({ error: "Failed to fetch course modules" });
    }
  });

  // Create course module
  app.post('/api/course-modules', async (req, res) => {
    try {
      const data = {
        courseGroupId: req.body.courseGroupId || req.body.courseId, // Support both courseGroupId and courseId
        title: req.body.title,
        description: req.body.description,
        orderIndex: parseInt(req.body.orderIndex) || 1,
        requiresQuiz: req.body.requiresQuiz === 'true' || req.body.requiresQuiz === true || false,
        quizRequiredToUnlock: req.body.quizRequiredToUnlock === 'true' || req.body.quizRequiredToUnlock === true || false,
        passingScore: parseInt(req.body.passingScore) || 70,
        maxAttempts: parseInt(req.body.maxAttempts) || 3,
        unlockMessage: req.body.unlockMessage || "Complete the previous module and pass the quiz to unlock this content.",
        isActive: req.body.isActive === 'true' || req.body.isActive === true || true,
      };
      
      const [module] = await db.insert(courseModules).values(data).returning();
      res.json(module);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating course module:", error);
      }
      res.status(500).json({ error: "Failed to create course module" });
    }
  });

  // Update course module
  app.put('/api/course-modules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = {
        title: req.body.title,
        description: req.body.description,
        orderIndex: parseInt(req.body.orderIndex) || 1,
        requiresQuiz: req.body.requiresQuiz === 'true' || req.body.requiresQuiz === true || false,
        quizRequiredToUnlock: req.body.quizRequiredToUnlock === 'true' || req.body.quizRequiredToUnlock === true || false,
        passingScore: parseInt(req.body.passingScore) || 70,
        maxAttempts: parseInt(req.body.maxAttempts) || 3,
        unlockMessage: req.body.unlockMessage || "Complete the previous module and pass the quiz to unlock this content.",
        isActive: req.body.isActive === 'true' || req.body.isActive === true || true,
      };
      
      await db.update(courseModules).set(data).where(eq(courseModules.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating course module:", error);
      }
      res.status(500).json({ error: "Failed to update course module" });
    }
  });

  // Delete course module
  app.delete('/api/course-modules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(courseModules).where(eq(courseModules.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting course module:", error);
      }
      res.status(500).json({ error: "Failed to delete course module" });
    }
  });

  // ================= Module Study Materials Management =================
  // Get study materials for a module
  app.get('/api/module-study-materials/:moduleId', async (req, res) => {
    try {
      const { moduleId } = req.params;
      
      const materials = await db.select({
        id: moduleStudyMaterials.id,
        moduleId: moduleStudyMaterials.moduleId,
        studyMaterialId: moduleStudyMaterials.studyMaterialId,
        orderIndex: moduleStudyMaterials.orderIndex,
        isRequired: moduleStudyMaterials.isRequired,
        studyMaterial: {
          id: studyMaterials.id,
          title: studyMaterials.title,
          description: studyMaterials.description,
          type: studyMaterials.type,
          fileUrl: studyMaterials.fileUrl,
          externalUrl: studyMaterials.externalUrl,
          fileName: studyMaterials.fileName,
          fileSize: studyMaterials.fileSize,
          duration: studyMaterials.duration,
          thumbnail: studyMaterials.thumbnail,
        }
      })
      .from(moduleStudyMaterials)
      .leftJoin(studyMaterials, eq(moduleStudyMaterials.studyMaterialId, studyMaterials.id))
      .where(eq(moduleStudyMaterials.moduleId, moduleId))
      .orderBy(asc(moduleStudyMaterials.orderIndex));
      
      res.json(materials);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching module study materials:", error);
      }
      res.status(500).json({ error: "Failed to fetch module study materials" });
    }
  });

  // Add study material to module
  app.post('/api/module-study-materials', async (req, res) => {
    try {
      const data = {
        moduleId: req.body.moduleId,
        studyMaterialId: req.body.studyMaterialId,
        orderIndex: parseInt(req.body.orderIndex) || 0,
        isRequired: req.body.isRequired === 'true' || req.body.isRequired === true || true,
      };
      
      const [moduleMaterial] = await db.insert(moduleStudyMaterials).values(data).returning();
      res.json(moduleMaterial);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error adding study material to module:", error);
      }
      res.status(500).json({ error: "Failed to add study material to module" });
    }
  });

  // Remove study material from module
  app.delete('/api/module-study-materials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(moduleStudyMaterials).where(eq(moduleStudyMaterials.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error removing study material from module:", error);
      }
      res.status(500).json({ error: "Failed to remove study material from module" });
    }
  });

  // ================= Module Quiz Questions Management =================
  // Get quiz questions for a module
  app.get('/api/module-quiz-questions/:moduleId', async (req, res) => {
    try {
      const { moduleId } = req.params;
      
      const questions = await db.select().from(moduleQuizQuestions)
        .where(eq(moduleQuizQuestions.moduleId, moduleId))
        .orderBy(asc(moduleQuizQuestions.orderIndex));
      
      res.json(questions);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching module quiz questions:", error);
      }
      res.status(500).json({ error: "Failed to fetch module quiz questions" });
    }
  });

  // Add quiz question to module
  app.post('/api/module-quiz-questions', async (req, res) => {
    try {
      const data = {
        moduleId: req.body.moduleId,
        question: req.body.question,
        type: req.body.type, // multiple_choice, true_false
        options: req.body.options || null,
        correctAnswer: req.body.correctAnswer || null,
        explanation: req.body.explanation,
        points: parseInt(req.body.points) || 1,
        orderIndex: parseInt(req.body.orderIndex) || 0,
        isActive: req.body.isActive === 'true' || req.body.isActive === true || true,
      };
      
      const [question] = await db.insert(moduleQuizQuestions).values(data).returning();
      res.json(question);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error adding quiz question to module:", error);
      }
      res.status(500).json({ error: "Failed to add quiz question to module" });
    }
  });

  // Update quiz question
  app.put('/api/module-quiz-questions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = {
        question: req.body.question,
        type: req.body.type,
        options: req.body.options || null,
        correctAnswer: req.body.correctAnswer || null,
        explanation: req.body.explanation,
        points: parseInt(req.body.points) || 1,
        orderIndex: parseInt(req.body.orderIndex) || 0,
        isActive: req.body.isActive === 'true' || req.body.isActive === true || true,
      };
      
      await db.update(moduleQuizQuestions).set(data).where(eq(moduleQuizQuestions.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating quiz question:", error);
      }
      res.status(500).json({ error: "Failed to update quiz question" });
    }
  });

  // Delete quiz question
  app.delete('/api/module-quiz-questions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(moduleQuizQuestions).where(eq(moduleQuizQuestions.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting quiz question:", error);
      }
      res.status(500).json({ error: "Failed to delete quiz question" });
    }
  });

  // ================= Certificates =================
  app.get('/api/certificates', async (req, res) => {
    try {
      const { userId, groupId } = req.query;
      let certificatesData;
      
      if (userId && groupId) {
        certificatesData = await db.select()
          .from(certificates)
          .where(and(
            eq(certificates.userId, userId as string),
            eq(certificates.groupId, groupId as string)
          ))
          .orderBy(desc(certificates.createdAt));
      } else if (userId) {
        certificatesData = await db.select()
          .from(certificates)
          .where(eq(certificates.userId, userId as string))
          .orderBy(desc(certificates.createdAt));
      } else {
        certificatesData = await db.select()
          .from(certificates)
          .orderBy(desc(certificates.createdAt));
      }
      
      res.json(certificatesData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching certificates:", error);
      }
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  app.post('/api/certificates/generate', isAuthenticated, async (req, res) => {
    try {
      const { userId, groupId } = req.body;
      
      if (!userId || !groupId) {
        return res.status(400).json({ error: "User ID and Group ID are required" });
      }

      // Check if user has completed the course
      const userProgress = await db.select()
        .from(learningPathProgress)
        .innerJoin(learningPaths, eq(learningPathProgress.learningPathId, learningPaths.id))
        .where(and(
          eq(learningPathProgress.userId, userId),
          eq(learningPaths.groupId, groupId)
        ));

      // Check if all learning paths are completed
      const allPaths = await db.select()
        .from(learningPaths)
        .where(eq(learningPaths.groupId, groupId));

      const completedPaths = userProgress.filter(p => p.isCompleted);
      
      if (completedPaths.length < allPaths.length) {
        return res.status(400).json({ 
          error: "Course not completed. Please complete all modules to generate certificate." 
        });
      }

      // Generate certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get user and course details
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const courseGroup = await db.select().from(courseGroups).where(eq(courseGroups.id, groupId)).limit(1);

      if (!user[0] || !courseGroup[0]) {
        return res.status(404).json({ error: "User or course not found" });
      }

      // Create certificate
      const [certificate] = await db.insert(certificates).values({
        userId,
        groupId,
        certificateNumber,
        studentName: `${user[0].firstName} ${user[0].lastName}`,
        courseName: courseGroup[0].name,
        completionDate: new Date(),
        status: 'issued',
        issuedAt: new Date(),
      }).returning();

      res.json({ success: true, certificate });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error generating certificate:", error);
      }
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  app.post('/api/certificates/:id/download', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [certificate] = await db.select()
        .from(certificates)
        .where(eq(certificates.id, id))
        .limit(1);

      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      // For now, return a simple PDF generation response
      // In a real implementation, you would generate an actual PDF
      res.json({ 
        success: true, 
        message: "Certificate download initiated",
        certificateNumber: certificate.certificateNumber 
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error downloading certificate:", error);
      }
      res.status(500).json({ error: "Failed to download certificate" });
    }
  });

  // ================= Reviews =================
  app.get('/api/reviews', async (req, res) => {
    try {
      // Return empty array since reviews table doesn't exist yet
      res.json([]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching reviews:", error);
      }
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get('/api/reviews/user', async (req, res) => {
    try {
      // Return null since reviews table doesn't exist yet
      res.json(null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user review:", error);
      }
      res.status(500).json({ error: "Failed to fetch user review" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req, res) => {
    try {
      // Reviews functionality not implemented yet
      res.status(501).json({ error: "Reviews functionality not implemented yet" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating review:", error);
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.post('/api/reviews/:id/helpful', async (req, res) => {
    try {
      // Reviews functionality not implemented yet
      res.status(501).json({ error: "Reviews functionality not implemented yet" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating helpful count:", error);
      }
      res.status(500).json({ error: "Failed to update helpful count" });
    }
  });

  // ================= Admin Reviews =================
  app.get('/api/admin/reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Return empty array since reviews table doesn't exist yet
      // This will prevent the error and show empty state in admin
      res.json([]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching admin reviews:", error);
      }
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post('/api/admin/reviews/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Reviews functionality not implemented yet
      res.status(501).json({ error: "Reviews functionality not implemented yet" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error approving review:", error);
      }
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  app.post('/api/admin/reviews/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Reviews functionality not implemented yet
      res.status(501).json({ error: "Reviews functionality not implemented yet" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error rejecting review:", error);
      }
      res.status(500).json({ error: "Failed to reject review" });
    }
  });

  app.delete('/api/admin/reviews/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Reviews functionality not implemented yet
      res.status(501).json({ error: "Reviews functionality not implemented yet" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting review:", error);
      }
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // ================= Admin Testimonials =================
  app.get('/api/admin/testimonials', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testimonialsData = await db.select()
        .from(testimonials)
        .orderBy(desc(testimonials.createdAt));
      
      res.json(testimonialsData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching admin testimonials:", error);
      }
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post('/api/admin/testimonials', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { studentName, studentRole, courseName, testimonial, rating } = req.body;
      
      if (!studentName || !testimonial) {
        return res.status(400).json({ error: "Student name and testimonial are required" });
      }

      const [newTestimonial] = await db.insert(testimonials).values({
        studentName,
        studentRole: studentRole || null,
        courseName: courseName || null,
        testimonial,
        rating: rating || 5,
        isApproved: true, // Admin-created testimonials are auto-approved
      }).returning();

      res.json({ success: true, testimonial: newTestimonial });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating testimonial:", error);
      }
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.post('/api/admin/testimonials/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [updatedTestimonial] = await db.update(testimonials)
        .set({ isApproved: true })
        .where(eq(testimonials.id, id))
        .returning();

      if (!updatedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      res.json({ success: true, testimonial: updatedTestimonial });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error approving testimonial:", error);
      }
      res.status(500).json({ error: "Failed to approve testimonial" });
    }
  });

  app.post('/api/admin/testimonials/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [updatedTestimonial] = await db.update(testimonials)
        .set({ isApproved: false })
        .where(eq(testimonials.id, id))
        .returning();

      if (!updatedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      res.json({ success: true, testimonial: updatedTestimonial });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error rejecting testimonial:", error);
      }
      res.status(500).json({ error: "Failed to reject testimonial" });
    }
  });

  // ================= Enquiries =================

  app.post('/api/enquiries', async (req, res) => {
    try {
      const { fullName, email, phone, courseId, message, courseInterest } = req.body;
      
      if (!fullName || !email || !phone) {
        return res.status(400).json({ error: "Name, email, and phone are required" });
      }

      // Store message and courseInterest in paymentInstructions as JSON
      const additionalData = {
        message: message || null,
        courseInterest: courseInterest || null
      };

      const [enquiry] = await db.insert(enquiries).values({
        fullName,
        email,
        phone,
        courseId: courseId || null,
        paymentInstructions: JSON.stringify(additionalData),
        status: 'pending',
      }).returning();

      // Log the message for admin reference
      if (message) {
        console.log(`Enquiry message from ${fullName} (${email}): ${message}`);
        if (courseInterest) {
          console.log(`Course Interest: ${courseInterest}`);
        }
      }

      res.json({ success: true, enquiry });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating enquiry:", error);
      }
      res.status(500).json({ error: "Failed to create enquiry" });
    }
  });

  app.put('/api/enquiries/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      const [updatedEnquiry] = await db.update(enquiries)
        .set({ 
          status: status || enquiries.status,
          adminNotes: adminNotes || enquiries.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(enquiries.id, id))
        .returning();

      if (!updatedEnquiry) {
        return res.status(404).json({ error: "Enquiry not found" });
      }

      res.json({ success: true, enquiry: updatedEnquiry });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating enquiry:", error);
      }
      res.status(500).json({ error: "Failed to update enquiry" });
    }
  });

  // ================= Admin Stats =================
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get total users
      const [totalUsersResult] = await db.select({ count: sql`count(*)` }).from(users);
      const totalUsers = Number(totalUsersResult.count);

      // Get active users (users with recent activity)
      const [activeUsersResult] = await db.select({ count: sql`count(*)` })
        .from(users)
        .where(sql`${users.updatedAt} > NOW() - INTERVAL '30 days'`);
      const activeUsers = Number(activeUsersResult.count);

      // Get total course groups
      const [totalCoursesResult] = await db.select({ count: sql`count(*)` }).from(courseGroups);
      const totalCourses = Number(totalCoursesResult.count);

      // Get total enrollments
      const [totalEnrollmentsResult] = await db.select({ count: sql`count(*)` }).from(userGroupMemberships);
      const totalEnrollments = Number(totalEnrollmentsResult.count);

      // Get pending enrollments
      const [pendingEnrollmentsResult] = await db.select({ count: sql`count(*)` })
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.status, 'pending'));
      const pendingEnrollments = Number(pendingEnrollmentsResult.count);

      // Get total reviews (using testimonials as reviews)
      const [totalReviewsResult] = await db.select({ count: sql`count(*)` }).from(testimonials);
      const totalReviews = Number(totalReviewsResult.count);

      // Get total testimonials
      const [totalTestimonialsResult] = await db.select({ count: sql`count(*)` }).from(testimonials);
      const totalTestimonials = Number(totalTestimonialsResult.count);

      // Get total FAQs
      const [totalFAQsResult] = await db.select({ count: sql`count(*)` }).from(faqs);
      const totalFAQs = Number(totalFAQsResult.count);

      // Calculate total revenue
      const revenueResult = await db.select({
        total: sql`COALESCE(SUM(${courseGroups.price}), 0)`
      })
      .from(userGroupMemberships)
      .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
      .where(eq(userGroupMemberships.status, 'approved'));
      
      const totalRevenue = Number(revenueResult[0]?.total || 0);

      // Get recent enrollments
      const recentEnrollments = await db.select({
        id: userGroupMemberships.id,
        status: userGroupMemberships.status,
        enrolledAt: userGroupMemberships.enrolledAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        courseGroup: {
          id: courseGroups.id,
          name: courseGroups.name,
        }
      })
      .from(userGroupMemberships)
      .innerJoin(users, eq(userGroupMemberships.userId, users.id))
      .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
      .orderBy(desc(userGroupMemberships.enrolledAt))
      .limit(10);

      res.json({
        totalUsers,
        activeUsers,
        totalCourses,
        totalEnrollments,
        pendingEnrollments,
        totalReviews,
        totalTestimonials,
        totalFAQs,
        totalRevenue,
        recentEnrollments,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching admin stats:", error);
      }
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  // ================= Sample Data =================
  app.post('/api/admin/seed-sample-data', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Create course categories first
      const [selfPacedCategory] = await db.insert(courseCategories).values({
        name: 'Self-Paced Learning',
        description: 'Learn at your own pace with structured modules',
        type: 'self_paced',
        icon: 'book-open',
        color: '#018763',
        isActive: true,
        orderIndex: 1
      }).returning();

      const [liveCategory] = await db.insert(courseCategories).values({
        name: 'Premium Live Classes',
        description: 'Interactive live sessions with expert instructors',
        type: 'live',
        icon: 'video',
        color: '#f59e0b',
        isActive: true,
        orderIndex: 2
      }).returning();

      // Create subcategories
      const [manualTestingSub] = await db.insert(courseSubcategories).values({
        categoryId: selfPacedCategory.id,
        name: 'Manual Testing',
        description: 'Fundamentals of manual software testing',
        icon: 'search',
        color: '#3b82f6',
        isActive: true,
        orderIndex: 1
      }).returning();

      const [automationSub] = await db.insert(courseSubcategories).values({
        categoryId: selfPacedCategory.id,
        name: 'Automation Testing',
        description: 'Automated testing tools and frameworks',
        icon: 'settings',
        color: '#8b5cf6',
        isActive: true,
        orderIndex: 2
      }).returning();

      const [apiTestingSub] = await db.insert(courseSubcategories).values({
        categoryId: selfPacedCategory.id,
        name: 'API Testing',
        description: 'API testing techniques and tools',
        icon: 'link',
        color: '#10b981',
        isActive: true,
        orderIndex: 3
      }).returning();

      // Create Self-Paced course groups
      const [selfPacedGroup] = await db.insert(courseGroups).values({
        name: 'Self-Paced Learning',
        description: 'Any Self-Study Course - Learn at your own pace',
        price: '149.00',
        features: [
          'Complete course access',
          'Downloadable handbooks',
          'Practical assignments',
          'Progress tracking',
          'Industry certificate',
          'Lifetime access'
        ],
        categoryId: selfPacedCategory.id,
        subcategoryId: manualTestingSub.id,
        difficulty: 'beginner',
        duration: 60,
        isActive: true
      }).returning();

      // Create Premium Live course group
      const [premiumLiveGroup] = await db.insert(courseGroups).values({
        name: 'Premium Live Classes',
        description: 'Live Video Call Sessions with Expert Instructors',
        price: '25000.00',
        features: [
          'Live video call sessions',
          'Direct instructor teaching',
          'Personal mentorship',
          'Manual + Automation both',
          'Real-time doubt clearing',
          'Job placement guarantee'
        ],
        categoryId: liveCategory.id,
        difficulty: 'intermediate',
        duration: 90,
        maxStudents: 20,
        isActive: true
      }).returning();

      // Create learning paths for self-paced course
      const learningPathsData = [
        {
          groupId: selfPacedGroup.id,
        title: 'Module 1: Introduction to Software Testing',
          description: 'Learn the fundamentals of software testing, types of testing, and testing principles',
          orderIndex: 1,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 2: Test Case Design Techniques',
          description: 'Master various test case design techniques including boundary value analysis and equivalence partitioning',
          orderIndex: 2,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 3: Bug Life Cycle & Reporting',
          description: 'Understand bug life cycle, bug reporting, and bug tracking tools',
          orderIndex: 3,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 4: Test Planning & Documentation',
          description: 'Learn test planning, test strategy, and test documentation',
          orderIndex: 4,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 5: Automation Testing Basics',
          description: 'Introduction to automation testing tools and frameworks',
          orderIndex: 5,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 6: API Testing',
          description: 'Learn API testing concepts, tools, and best practices',
          orderIndex: 6,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 7: Performance Testing',
          description: 'Introduction to performance testing and load testing',
          orderIndex: 7,
          requiresQuiz: true,
          quizRequiredToUnlock: true,
          passingScore: 70,
          maxAttempts: 3
        },
        {
          groupId: selfPacedGroup.id,
          title: 'Module 8: Final Project & Certification',
          description: 'Complete a real-world testing project and prepare for certification',
          orderIndex: 8,
          requiresQuiz: true,
          quizRequiredToUnlock: false,
          passingScore: 80,
          maxAttempts: 2
        }
      ];

      const createdPaths = [];
      for (const pathData of learningPathsData) {
        const [createdPath] = await db.insert(learningPaths).values(pathData).returning();
        createdPaths.push(createdPath);
      }

      // Create sample quiz questions for each learning path
      const quizQuestionsData = [
        // Module 1: Introduction to Software Testing
        {
          learningPathId: createdPaths[0].id,
          question: "What is the primary goal of software testing?",
          options: [
            "To find bugs and defects in software",
            "To make software run faster",
            "To improve user interface design",
            "To reduce development time"
          ],
          correctAnswer: "To find bugs and defects in software",
          explanation: "The primary goal of software testing is to identify bugs, defects, and errors in software to ensure it meets requirements and works as expected.",
        orderIndex: 1
        },
        {
          learningPathId: createdPaths[0].id,
          question: "Which testing level focuses on individual components or modules?",
          options: [
            "System Testing",
            "Integration Testing", 
            "Unit Testing",
            "Acceptance Testing"
          ],
          correctAnswer: "Unit Testing",
          explanation: "Unit testing focuses on testing individual components or modules in isolation to verify they work correctly.",
          orderIndex: 2
        },
        {
          learningPathId: createdPaths[0].id,
          question: "What is the difference between verification and validation?",
          options: [
            "Verification is checking if we built the product right, Validation is checking if we built the right product",
            "Verification is manual testing, Validation is automated testing",
            "Verification is functional testing, Validation is non-functional testing",
            "There is no difference between them"
          ],
          correctAnswer: "Verification is checking if we built the product right, Validation is checking if we built the right product",
          explanation: "Verification ensures the product is built according to specifications, while validation ensures the product meets user requirements.",
          orderIndex: 3
        },

        // Module 2: Test Case Design Techniques
        {
          learningPathId: createdPaths[1].id,
          question: "What is Boundary Value Analysis?",
          options: [
            "Testing only the middle values of input ranges",
            "Testing values at the boundaries of input ranges",
            "Testing with random input values",
            "Testing with maximum possible values only"
          ],
          correctAnswer: "Testing values at the boundaries of input ranges",
          explanation: "Boundary Value Analysis focuses on testing values at the edges of input ranges where errors are most likely to occur.",
          orderIndex: 1
        },
        {
          learningPathId: createdPaths[1].id,
          question: "In Equivalence Partitioning, how many test cases should be written for each partition?",
          options: [
            "At least 5 test cases",
            "At least 10 test cases",
            "At least one test case",
            "As many as possible"
          ],
          correctAnswer: "At least one test case",
          explanation: "In Equivalence Partitioning, you need at least one test case per partition since all values in a partition are expected to behave similarly.",
        orderIndex: 2
        },

        // Module 3: Bug Life Cycle & Reporting
        {
          learningPathId: createdPaths[2].id,
          question: "What is the first state in a typical bug life cycle?",
          options: [
            "Fixed",
            "Closed",
            "New",
            "Assigned"
          ],
          correctAnswer: "New",
          explanation: "The bug life cycle typically starts with the 'New' state when a bug is first discovered and reported.",
          orderIndex: 1
        },
        {
          learningPathId: createdPaths[2].id,
          question: "What information should be included in a good bug report?",
          options: [
            "Only the bug description",
            "Bug description, steps to reproduce, expected vs actual results, and environment details",
            "Only the bug title",
            "Only the severity level"
          ],
          correctAnswer: "Bug description, steps to reproduce, expected vs actual results, and environment details",
          explanation: "A comprehensive bug report should include all necessary information to help developers understand and reproduce the issue.",
          orderIndex: 2
        }
      ];

      for (const questionData of quizQuestionsData) {
        await db.insert(questions).values(questionData);
      }

      // Create sample live sessions for premium live classes
      const now = new Date();
      const liveSessionsData = [
        {
          groupId: premiumLiveGroup.id,
          title: 'Live Session 1: Software Testing Fundamentals',
          description: 'Interactive session covering testing basics and principles',
          sessionDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 PM
          endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 PM
          googleMeetLink: 'https://meet.google.com/sample-link-1'
        },
        {
          groupId: premiumLiveGroup.id,
          title: 'Live Session 2: Test Case Design Workshop',
          description: 'Hands-on workshop on test case design techniques',
          sessionDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          googleMeetLink: 'https://meet.google.com/sample-link-2'
        },
        {
          groupId: premiumLiveGroup.id,
          title: 'Live Session 3: Automation Testing Setup',
          description: 'Setting up automation testing environment and tools',
          sessionDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
          startTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          googleMeetLink: 'https://meet.google.com/sample-link-3'
        }
      ];

      for (const sessionData of liveSessionsData) {
        await db.insert(liveSessions).values(sessionData);
      }

      res.json({ 
        message: 'Test Academy course structure created successfully',
        courseGroups: [selfPacedGroup, premiumLiveGroup],
        categories: [selfPacedCategory, liveCategory]
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      res.status(500).json({ message: 'Failed to create sample data' });
    }
  });

  // ================= Student: Learning Paths =================
  // List groups the current user belongs to
  app.get('/api/me/groups', isAuthenticated, async (req, res) => {
    try {
      const memberships = await db.select({
        id: userGroupMemberships.id,
        groupId: courseGroups.id,
        name: courseGroups.name,
        description: courseGroups.description,
        price: courseGroups.price,
        courseType: courseGroups.courseType,
        isLiveCourse: courseGroups.isLiveCourse,
        status: userGroupMemberships.status,
        paymentStatus: userGroupMemberships.paymentStatus,
        phoneNumber: userGroupMemberships.phoneNumber,
        studyPath: userGroupMemberships.studyPath,
        enrolledAt: userGroupMemberships.enrolledAt,
        approvedAt: userGroupMemberships.approvedAt,
        expiresAt: userGroupMemberships.expiresAt,
      })
      .from(userGroupMemberships)
      .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
      .where(eq(userGroupMemberships.userId, req.session.userId!))
      .orderBy(desc(userGroupMemberships.enrolledAt));
      
      res.json(memberships);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to fetch user groups' });
    }
  });

  // Fetch learning paths + documents for a group the user belongs to
  app.get('/api/me/groups/:groupId/learning', isAuthenticated, async (req, res) => {
    try {
      // Verify membership and active status
      const membership = await db
        .select()
        .from(userGroupMemberships)
        .where(and(
          eq(userGroupMemberships.userId, req.session.userId!), 
          eq(userGroupMemberships.groupId, req.params.groupId),
          eq(userGroupMemberships.status, 'active')
        ));
      if (membership.length === 0) return res.status(403).json({ message: 'Not an active member of this group' });

      const paths = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.groupId, req.params.groupId))
        .orderBy(asc(learningPaths.orderIndex));

      const pathIds = paths.map(p => p.id);
      const docs = pathIds.length > 0 ? await db
        .select()
        .from(documents)
        .where(eq(documents.learningPathId, pathIds[0])) // fetch per path below
        : [];

      // Build map of documents per path
      const docsByPath: Record<string, any[]> = {};
      for (const p of paths) {
        const rows = await db
          .select()
          .from(documents)
          .where(eq(documents.learningPathId, p.id))
          .orderBy(asc(documents.orderIndex));
        docsByPath[p.id] = rows;
      }

      res.json({ paths, documents: docsByPath });
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch learning content' });
    }
  });

  // ===== Existing routes below =====

  // Public routes

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Enquiry submission (public)
  app.post("/api/enquiries", async (req, res) => {
    try {
      const enquiryData = insertEnquirySchema.parse(req.body);
      const enquiry = await storage.createEnquiry(enquiryData);

      // Create or update user credentials for this enquiry email
      let createdPasswordPlain: string | null = null;
      const existing = await storage.getUserByEmail(enquiry.email);

      // Derive first/last from fullName
      const [firstName, ...rest] = enquiry.fullName.split(" ");
      const lastName = rest.join(" ") || "";

      if (!existing) {
        // Create new user with a generated password
        const tempPassword = `TA-${nanoid(10)}`;
        const hashed = await bcrypt.hash(tempPassword, 10);
        await storage.createUser({
          email: enquiry.email,
          password: hashed,
          firstName,
          lastName,
          role: 'student',
        });
        createdPasswordPlain = tempPassword;
      } else if (!existing.password) {
        // Set a password for legacy/null-password users
        const tempPassword = `TA-${nanoid(10)}`;
        const hashed = await bcrypt.hash(tempPassword, 10);
        await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, existing.id));
        createdPasswordPlain = tempPassword;
      }

      // Send email notification with credentials (if created)
      try {
        const lines: string[] = [
          `<p>Hi ${firstName || 'there'},</p>`,
          `<p>Thanks for your enquiry to Debug Nation.</p>`,
        ];
        if (createdPasswordPlain) {
          lines.push(
            `<p>Your account has been created. You can sign in at <a href="http://localhost:5000/signin">http://localhost:5000/signin</a> with:</p>`,
            `<p><strong>Email:</strong> ${enquiry.email}<br/><strong>Temporary password:</strong> ${createdPasswordPlain}</p>`,
            `<p>Please change your password after signing in.</p>`
          );
        } else {
          lines.push(`<p>You can sign in with your existing account using your email: ${enquiry.email}</p>`);
        }
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'support@debugnation.com',
          to: enquiry.email,
          subject: 'Your Debug Nation account details',
          html: lines.join("\n"),
        });
      } catch (emailError) {
        console.error("Failed to send user credentials:", emailError);
      }

      // Send email notification to admin
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'support@debugnation.com',
          to: process.env.ADMIN_EMAIL || 'admin@debugnation.com',
          subject: `New Course Enquiry - ${enquiry.fullName}`,
          html: `
            <h2>New Course Enquiry</h2>
            <p><strong>Name:</strong> ${enquiry.fullName}</p>
            <p><strong>Email:</strong> ${enquiry.email}</p>
            <p><strong>Phone:</strong> ${enquiry.phone}</p>
            <p><strong>Course ID:</strong> ${enquiry.courseId}</p>
            <p><strong>Enquiry ID:</strong> ${enquiry.id}</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      const includePlain = process.env.NODE_ENV !== 'production';
      res.status(201).json({
        ...enquiry,
        accountCreated: !!createdPasswordPlain,
        tempPassword: includePlain ? createdPasswordPlain : undefined,
      });
    } catch (error) {
      console.error("Error creating enquiry:", error);
      res.status(400).json({ message: "Invalid enquiry data" });
    }
  });

  // Protected student routes
  app.get("/api/my-enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get("/api/courses/:courseId/modules", isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getCourseModules(req.params.courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get("/api/courses/:courseId/lessons", isAuthenticated, async (req, res) => {
    try {
      const lessons = await storage.getCourseLessons(req.params.courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/enrollments/:enrollmentId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const progress = await storage.getUserProgress(userId, req.params.enrollmentId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { enrollmentId } = req.body;
      
      if (!enrollmentId) {
        return res.status(400).json({ message: "Enrollment ID is required" });
      }

      const progress = await storage.updateUserProgress(userId, req.params.lessonId, enrollmentId);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get("/api/enrollments/:enrollmentId/assignments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const assignments = await storage.getUserAssignments(userId, req.params.enrollmentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments/:assignmentId/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const submissionData = insertAssignmentSubmissionSchema.parse({
        assignmentId: req.params.assignmentId,
        userId,
        ...req.body
      });

      const submission = await storage.submitAssignment(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(400).json({ message: "Invalid submission data" });
    }
  });

  app.get("/api/courses/:courseId/exam", isAuthenticated, async (req, res) => {
    try {
      const exam = await storage.getCourseExam(req.params.courseId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.post("/api/exams/:examId/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { enrollmentId } = req.body;
      
      if (!enrollmentId) {
        return res.status(400).json({ message: "Enrollment ID is required" });
      }

      const attempt = await storage.startExam(req.params.examId, userId, enrollmentId);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error starting exam:", error);
      res.status(500).json({ message: "Failed to start exam" });
    }
  });

  app.post("/api/exam-attempts/:attemptId/complete", isAuthenticated, async (req, res) => {
    try {
      const { score, correctAnswers } = req.body;
      
      if (typeof score !== 'number' || typeof correctAnswers !== 'number') {
        return res.status(400).json({ message: "Score and correct answers must be numbers" });
      }

      const attempt = await storage.completeExam(req.params.attemptId, score, correctAnswers);
      res.json(attempt);
    } catch (error) {
      console.error("Error completing exam:", error);
      res.status(500).json({ message: "Failed to complete exam" });
    }
  });

  app.get("/api/my-certificates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/enrollments/:enrollmentId/certificate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      const certificate = await storage.generateCertificate(userId, req.params.enrollmentId, courseId);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ message: "Failed to generate certificate" });
    }
  });

  // Admin routes
  app.get("/api/admin/enquiries", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const enquiries = await storage.getEnquiries();
      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  // Admin enrollments endpoint
  app.get("/api/admin/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const enrollmentsData = await db
        .select({
          id: userGroupMemberships.id,
          userId: userGroupMemberships.userId,
          groupId: userGroupMemberships.groupId,
          status: userGroupMemberships.status,
          enrolledAt: userGroupMemberships.enrolledAt,
          approvedAt: userGroupMemberships.approvedAt,
          activatedAt: userGroupMemberships.activatedAt,
          expiresAt: userGroupMemberships.expiresAt,
          paymentStatus: userGroupMemberships.paymentStatus,
          paymentScreenshot: userGroupMemberships.paymentScreenshot,
          transactionId: userGroupMemberships.transactionId,
          paymentNotes: userGroupMemberships.paymentNotes,
          adminNotes: userGroupMemberships.adminNotes,
          phoneNumber: userGroupMemberships.phoneNumber,
          studyPath: userGroupMemberships.studyPath,
          createdAt: userGroupMemberships.createdAt,
          updatedAt: userGroupMemberships.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          },
          courseGroup: {
            id: courseGroups.id,
            name: courseGroups.name,
            description: courseGroups.description,
            price: courseGroups.price,
          }
        })
        .from(userGroupMemberships)
        .leftJoin(users, eq(userGroupMemberships.userId, users.id))
        .leftJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
        .orderBy(desc(userGroupMemberships.createdAt));

      res.json(enrollmentsData);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Update payment status endpoint
  app.put("/api/admin/enrollments/:id/payment-status", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { paymentStatus, transactionId, paymentNotes } = req.body;

      const [updatedEnrollment] = await db
        .update(userGroupMemberships)
        .set({
          paymentStatus: paymentStatus,
          transactionId: transactionId || null,
          paymentNotes: paymentNotes || null,
          updatedAt: new Date(),
        })
        .where(eq(userGroupMemberships.id, id))
        .returning();

      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ success: true, enrollment: updatedEnrollment });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  // Test endpoint
  app.get("/api/admin/test", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      res.json({ message: "Admin test endpoint working" });
    } catch (error) {
      console.error("Error in test endpoint:", error);
      res.status(500).json({ message: "Failed to test" });
    }
  });

  app.post("/api/admin/enquiries/:id/activate", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const enquiry = await storage.updateEnquiry(req.params.id, { status: "activated" });
      
      // Create enrollment
      if (enquiry.userId && enquiry.courseId) {
        await storage.createEnrollment({
          userId: enquiry.userId,
          courseId: enquiry.courseId,
          enquiryId: enquiry.id,
        });
      }

      res.json(enquiry);
    } catch (error) {
      console.error("Error activating enquiry:", error);
      res.status(500).json({ message: "Failed to activate enquiry" });
    }
  });

  app.post("/api/admin/courses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Ensure duration is provided with a default value
      const courseData = {
        ...req.body,
        duration: req.body.duration || 30, // Default to 30 days
        dailyHours: req.body.dailyHours || 2, // Default to 2 hours per day
        price: req.body.price || "149.00", // Default price
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        difficulty: req.body.difficulty || "beginner"
      };

      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post("/api/admin/assignments/:submissionId/grade", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { score, feedback } = req.body;
      const graded = await storage.gradeAssignment(req.params.submissionId, score, feedback);
      res.json(graded);
    } catch (error) {
      console.error("Error grading assignment:", error);
      res.status(500).json({ message: "Failed to grade assignment" });
    }
  });

  // ==================== HOME CONTENT MANAGEMENT ====================
  
  // Get all home content
  app.get('/api/home-content', async (req, res) => {
    try {
      const content = await db.select().from(homeContent).orderBy(asc(homeContent.orderIndex));
      res.json(content);
    } catch (error) {
      console.error("Error fetching home content:", error);
      res.status(500).json({ message: "Failed to fetch home content" });
    }
  });

  // Get home content by section
  app.get('/api/home-content/:section', async (req, res) => {
    try {
      const { section } = req.params;
      const content = await db.select().from(homeContent).where(eq(homeContent.section, section));
      res.json(content);
    } catch (error) {
      console.error("Error fetching home content section:", error);
      res.status(500).json({ message: "Failed to fetch home content section" });
    }
  });

  // Create or update home content
  app.post('/api/home-content', async (req, res) => {
    try {
      const validatedData = insertHomeContentSchema.parse(req.body);
      const [content] = await db.insert(homeContent).values(validatedData).returning();
      res.json(content);
    } catch (error) {
      console.error("Error creating home content:", error);
      res.status(500).json({ message: "Failed to create home content" });
    }
  });

  // Update home content
  app.put('/api/home-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertHomeContentSchema.parse(req.body);
      const [content] = await db.update(homeContent)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(homeContent.id, id))
        .returning();
      res.json(content);
    } catch (error) {
      console.error("Error updating home content:", error);
      res.status(500).json({ message: "Failed to update home content" });
    }
  });

  // Delete home content
  app.delete('/api/home-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(homeContent).where(eq(homeContent.id, id));
      res.json({ message: "Home content deleted successfully" });
    } catch (error) {
      console.error("Error deleting home content:", error);
      res.status(500).json({ message: "Failed to delete home content" });
    }
  });

  // ==================== TESTIMONIALS MANAGEMENT ====================
  
  // Get all testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const testimonialsList = await db.select().from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(asc(testimonials.orderIndex));
      res.json(testimonialsList);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Create testimonial
  app.post('/api/testimonials', async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const [testimonial] = await db.insert(testimonials).values(validatedData).returning();
      res.json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  // Update testimonial
  app.put('/api/testimonials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTestimonialSchema.parse(req.body);
      const [testimonial] = await db.update(testimonials)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(testimonials.id, id))
        .returning();
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  // Delete testimonial
  app.delete('/api/testimonials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(testimonials).where(eq(testimonials.id, id));
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  // ==================== FAQ MANAGEMENT ====================
  
  // Get all FAQs
  app.get('/api/faqs', async (req, res) => {
    try {
      const faqsList = await db.select().from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(asc(faqs.orderIndex));
      res.json(faqsList);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Create FAQ
  app.post('/api/faqs', async (req, res) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const [faq] = await db.insert(faqs).values(validatedData).returning();
      res.json(faq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  // Update FAQ
  app.put('/api/faqs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFaqSchema.parse(req.body);
      const [faq] = await db.update(faqs)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(faqs.id, id))
        .returning();
      res.json(faq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  // Delete FAQ
  app.delete('/api/faqs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(faqs).where(eq(faqs.id, id));
      res.json({ message: "FAQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  // ==================== HEADER & FOOTER CMS ====================
  
  // Get all header/footer content
  app.get('/api/header-footer-content', async (req, res) => {
    try {
      const content = await db.select().from(headerFooterContent).orderBy(asc(headerFooterContent.orderIndex));
      res.json(content);
    } catch (error) {
      console.error("Error fetching header/footer content:", error);
      res.status(500).json({ message: "Failed to fetch header/footer content" });
    }
  });

  // Get header/footer content by section
  app.get('/api/header-footer-content/:section', async (req, res) => {
    try {
      const { section } = req.params;
      const content = await db.select().from(headerFooterContent).where(eq(headerFooterContent.section, section));
      res.json(content);
    } catch (error) {
      console.error("Error fetching header/footer content section:", error);
      res.status(500).json({ message: "Failed to fetch header/footer content section" });
    }
  });

  // Create header/footer content
  app.post('/api/header-footer-content', async (req, res) => {
    try {
      const validatedData = insertHeaderFooterContentSchema.parse(req.body);
      const [content] = await db.insert(headerFooterContent).values(validatedData).returning();
      res.json(content);
    } catch (error) {
      console.error("Error creating header/footer content:", error);
      res.status(500).json({ message: "Failed to create header/footer content" });
    }
  });

  // Update header/footer content
  app.put('/api/header-footer-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertHeaderFooterContentSchema.parse(req.body);
      const [content] = await db.update(headerFooterContent)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(headerFooterContent.id, id))
        .returning();
      res.json(content);
    } catch (error) {
      console.error("Error updating header/footer content:", error);
      res.status(500).json({ message: "Failed to update header/footer content" });
    }
  });

  // Delete header/footer content
  app.delete('/api/header-footer-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(headerFooterContent).where(eq(headerFooterContent.id, id));
      res.json({ message: "Header/footer content deleted successfully" });
    } catch (error) {
      console.error("Error deleting header/footer content:", error);
      res.status(500).json({ message: "Failed to delete header/footer content" });
    }
  });

  // ==================== PAGE CONTENT CMS ====================
  
  // Get all page content
  app.get('/api/page-content', async (req, res) => {
    try {
      const content = await db.select().from(pageContent).orderBy(asc(pageContent.orderIndex));
      res.json(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });

  // Get page content by page
  app.get('/api/page-content/:page', async (req, res) => {
    try {
      const { page } = req.params;
      const content = await db.select().from(pageContent).where(eq(pageContent.page, page));
      res.json(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });

  // Get page content by page and section
  app.get('/api/page-content/:page/:section', async (req, res) => {
    try {
      const { page, section } = req.params;
      const content = await db.select().from(pageContent)
        .where(and(eq(pageContent.page, page), eq(pageContent.section, section)));
      res.json(content);
    } catch (error) {
      console.error("Error fetching page content section:", error);
      res.status(500).json({ message: "Failed to fetch page content section" });
    }
  });

  // Create page content
  app.post('/api/page-content', async (req, res) => {
    try {
      const validatedData = insertPageContentSchema.parse(req.body);
      const [content] = await db.insert(pageContent).values(validatedData).returning();
      res.json(content);
    } catch (error) {
      console.error("Error creating page content:", error);
      res.status(500).json({ message: "Failed to create page content" });
    }
  });

  // Update page content
  app.put('/api/page-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPageContentSchema.parse(req.body);
      const [content] = await db.update(pageContent)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(pageContent.id, id))
        .returning();
      res.json(content);
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ message: "Failed to update page content" });
    }
  });

  // Delete page content
  app.delete('/api/page-content/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(pageContent).where(eq(pageContent.id, id));
      res.json({ message: "Page content deleted successfully" });
    } catch (error) {
      console.error("Error deleting page content:", error);
      res.status(500).json({ message: "Failed to delete page content" });
    }
  });

  // ==================== ADMIN MANAGEMENT ====================
  
  // Admin Stats

  // Admin Users Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const usersList = await db.select().from(users).orderBy(users.createdAt);
      res.json(usersList);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching users:", error);
      }
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create User
  app.post("/api/admin/users", async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'student',
      }).returning();

      res.json(newUser);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating user:", error);
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Update the user with the provided data
      // Convert date strings to Date objects if they exist
      const processedUpdateData = { ...updateData };
      if (processedUpdateData.createdAt && typeof processedUpdateData.createdAt === 'string') {
        processedUpdateData.createdAt = new Date(processedUpdateData.createdAt);
      }
      if (processedUpdateData.updatedAt && typeof processedUpdateData.updatedAt === 'string') {
        processedUpdateData.updatedAt = new Date(processedUpdateData.updatedAt);
      }
      
      const [updatedUser] = await db
        .update(users)
        .set({ ...processedUpdateData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating user:", error);
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete User
  app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (existingUser.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deletion of the current admin user
      if (id === user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      // Delete the user
      await db.delete(users).where(eq(users.id, id));

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting user:", error);
      }
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ==================== TUTOR MANAGEMENT ====================
  
  // Get all tutors
  app.get("/api/admin/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await db
        .select()
        .from(users)
        .where(eq(users.role, 'tutor'))
        .orderBy(users.createdAt);

      res.json(tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ error: "Failed to fetch tutors" });
    }
  });

  // Create tutor account
  app.post("/api/admin/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, first name, and last name are required" });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create tutor account
      const [newTutor] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'tutor',
          isActive: true,
        })
        .returning();

      res.json({ success: true, tutor: newTutor });
    } catch (error) {
      console.error("Error creating tutor:", error);
      res.status(500).json({ error: "Failed to create tutor" });
    }
  });

  // Assign tutor to course
  app.post("/api/admin/course-tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { courseGroupId, tutorId } = req.body;
      
      if (!courseGroupId || !tutorId) {
        return res.status(400).json({ error: "Course group ID and tutor ID are required" });
      }

      // Check if assignment already exists
      const existingAssignment = await db
        .select()
        .from(courseTutors)
        .where(and(
          eq(courseTutors.courseGroupId, courseGroupId),
          eq(courseTutors.tutorId, tutorId)
        ))
        .limit(1);

      if (existingAssignment.length > 0) {
        return res.status(400).json({ error: "Tutor is already assigned to this course" });
      }

      // Create assignment
      const [assignment] = await db
        .insert(courseTutors)
        .values({
          courseGroupId,
          tutorId,
          isActive: true,
        })
        .returning();

      res.json({ success: true, assignment });
    } catch (error) {
      console.error("Error assigning tutor:", error);
      res.status(500).json({ error: "Failed to assign tutor" });
    }
  });

  // Get course tutors
  app.get("/api/admin/course-tutors/:courseGroupId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { courseGroupId } = req.params;

      const tutors = await db
        .select({
          id: courseTutors.id,
          tutorId: courseTutors.tutorId,
          assignedAt: courseTutors.assignedAt,
          isActive: courseTutors.isActive,
          tutor: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          }
        })
        .from(courseTutors)
        .innerJoin(users, eq(courseTutors.tutorId, users.id))
        .where(eq(courseTutors.courseGroupId, courseGroupId))
        .orderBy(courseTutors.assignedAt);

      res.json(tutors);
    } catch (error) {
      console.error("Error fetching course tutors:", error);
      res.status(500).json({ error: "Failed to fetch course tutors" });
    }
  });

  // Remove tutor from course
  app.delete("/api/admin/course-tutors/:assignmentId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { assignmentId } = req.params;

      await db
        .delete(courseTutors)
        .where(eq(courseTutors.id, assignmentId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing tutor:", error);
      res.status(500).json({ error: "Failed to remove tutor" });
    }
  });

  // ==================== TUTOR DASHBOARD ====================
  
  // Get tutor's assigned courses
  app.get("/api/tutor/courses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'tutor') {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const courses = await db
        .select({
          id: courseGroups.id,
          name: courseGroups.name,
          description: courseGroups.description,
          price: courseGroups.price,
          difficulty: courseGroups.difficulty,
          duration: courseGroups.duration,
          thumbnail: courseGroups.thumbnail,
          assignedAt: courseTutors.assignedAt,
        })
        .from(courseTutors)
        .innerJoin(courseGroups, eq(courseTutors.courseGroupId, courseGroups.id))
        .where(and(
          eq(courseTutors.tutorId, user.id),
          eq(courseTutors.isActive, true)
        ))
        .orderBy(courseTutors.assignedAt);

      res.json(courses);
    } catch (error) {
      console.error("Error fetching tutor courses:", error);
      res.status(500).json({ error: "Failed to fetch tutor courses" });
    }
  });

  // Get tutor's live sessions for a course
  app.get("/api/tutor/live-sessions/:courseGroupId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'tutor') {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const { courseGroupId } = req.params;

      // Verify tutor is assigned to this course
      const assignment = await db
        .select()
        .from(courseTutors)
        .where(and(
          eq(courseTutors.tutorId, user.id),
          eq(courseTutors.courseGroupId, courseGroupId),
          eq(courseTutors.isActive, true)
        ))
        .limit(1);

      if (assignment.length === 0) {
        return res.status(403).json({ message: "Not assigned to this course" });
      }

      const sessions = await db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.groupId, courseGroupId))
        .orderBy(liveSessions.startTime);

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching tutor live sessions:", error);
      res.status(500).json({ error: "Failed to fetch live sessions" });
    }
  });

  // SEO Management
  app.get("/api/seo", async (req, res) => {
    try {
      // For now, return mock data - you can create a seo table later
      const seoData = [
        { page: 'home', title: 'Debug Nation - Software Testing Courses', description: 'Learn software testing with our comprehensive courses', keywords: 'software testing, QA, automation testing' },
        { page: 'courses', title: 'Courses - Debug Nation', description: 'Browse our software testing courses', keywords: 'testing courses, QA training' },
        { page: 'signin', title: 'Sign In - Debug Nation', description: 'Sign in to your account', keywords: 'login, sign in' },
        { page: 'signup', title: 'Sign Up - Debug Nation', description: 'Create your account', keywords: 'register, sign up' },
        { page: 'dashboard', title: 'Dashboard - Debug Nation', description: 'Your learning dashboard', keywords: 'dashboard, learning' },
        { page: 'admin', title: 'Admin Panel - Debug Nation', description: 'Administrative interface', keywords: 'admin, management' },
      ];
      res.json(seoData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching SEO data:", error);
      }
      res.status(500).json({ error: "Failed to fetch SEO data" });
    }
  });

  app.put("/api/seo", async (req, res) => {
    try {
      // For now, just return success - you can implement database storage later
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating SEO data:", error);
      }
      res.status(500).json({ error: "Failed to update SEO data" });
    }
  });

  // Image Upload
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error uploading file:", error);
      }
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // ==================== FAQ MANAGEMENT ====================
  
  // Get all FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqsList = await db.select().from(faqs).orderBy(faqs.orderIndex);
      res.json(faqsList);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching FAQs:", error);
      }
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  // Create FAQ
  app.post("/api/faqs", async (req, res) => {
    try {
      const data = insertFaqSchema.parse(req.body);
      const [faq] = await db.insert(faqs).values(data).returning();
      res.json(faq);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating FAQ:", error);
      }
      res.status(500).json({ error: "Failed to create FAQ" });
    }
  });

  // Update FAQ
  app.put("/api/faqs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertFaqSchema.partial().parse(req.body);
      await db.update(faqs).set(data).where(eq(faqs.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating FAQ:", error);
      }
      res.status(500).json({ error: "Failed to update FAQ" });
    }
  });

  // Delete FAQ
  app.delete("/api/faqs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(faqs).where(eq(faqs.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting FAQ:", error);
      }
      res.status(500).json({ error: "Failed to delete FAQ" });
    }
  });

  // ==================== ENQUIRY MANAGEMENT ====================
  
  // Get all enquiries
  app.get("/api/enquiries", async (req, res) => {
    try {
      const enquiriesList = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
      res.json(enquiriesList);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching enquiries:", error);
      }
      res.status(500).json({ error: "Failed to fetch enquiries" });
    }
  });

  // Update enquiry status
  app.put("/api/enquiries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      await db.update(enquiries).set({ 
        status,
        updatedAt: new Date()
      }).where(eq(enquiries.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating enquiry:", error);
      }
      res.status(500).json({ error: "Failed to update enquiry" });
    }
  });

  // ==================== STUDY MATERIALS MANAGEMENT ====================
  
  // Get all study materials
  app.get("/api/study-materials", async (req, res) => {
    try {
      const materials = await db.select().from(documents).orderBy(documents.orderIndex);
      res.json(materials);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching study materials:", error);
      }
      res.status(500).json({ error: "Failed to fetch study materials" });
    }
  });


  // Update study material
  app.put("/api/study-materials/:id", upload.single('file'), async (req, res) => {
    try {
      const { id } = req.params;
      const data = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        category: req.body.category,
        courseId: req.body.courseId,
        isActive: req.body.isActive === 'true',
        orderIndex: parseInt(req.body.orderIndex) || 0,
        ...(req.file && { fileUrl: `/uploads/${req.file.filename}` }),
      };
      
      await db.update(documents).set(data).where(eq(documents.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating study material:", error);
      }
      res.status(500).json({ error: "Failed to update study material" });
    }
  });

  // Delete study material
  app.delete("/api/study-materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(documents).where(eq(documents.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting study material:", error);
      }
      res.status(500).json({ error: "Failed to delete study material" });
    }
  });

  // ==================== COURSE CATEGORIES MANAGEMENT ====================
  app.get("/api/course-categories", async (req, res) => {
    try {
      const categories = await db.select().from(courseCategories).orderBy(asc(courseCategories.orderIndex));
      res.json(categories);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching course categories:", error);
      }
      res.status(500).json({ error: "Failed to fetch course categories" });
    }
  });

  app.post("/api/course-categories", async (req, res) => {
    try {
      const { name, description, type, icon, color, orderIndex } = req.body;
      const [newCategory] = await db.insert(courseCategories).values({
        name,
        description,
        type,
        icon,
        color,
        orderIndex: orderIndex || 0,
      }).returning();
      res.json(newCategory);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating course category:", error);
      }
      res.status(500).json({ error: "Failed to create course category" });
    }
  });

  app.put("/api/course-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await db.update(courseCategories).set(updateData).where(eq(courseCategories.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating course category:", error);
      }
      res.status(500).json({ error: "Failed to update course category" });
    }
  });

  app.delete("/api/course-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(courseCategories).where(eq(courseCategories.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting course category:", error);
      }
      res.status(500).json({ error: "Failed to delete course category" });
    }
  });

  // ==================== COURSE SUBCATEGORIES MANAGEMENT ====================
  app.get("/api/course-subcategories", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let subcategories;
      
      if (categoryId) {
        subcategories = await db.select().from(courseSubcategories)
          .where(eq(courseSubcategories.categoryId, categoryId as string))
          .orderBy(asc(courseSubcategories.orderIndex));
      } else {
        subcategories = await db.select().from(courseSubcategories)
          .orderBy(asc(courseSubcategories.orderIndex));
      }
      
      res.json(subcategories);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching course subcategories:", error);
      }
      res.status(500).json({ error: "Failed to fetch course subcategories" });
    }
  });

  app.post("/api/course-subcategories", async (req, res) => {
    try {
      const { categoryId, name, description, icon, color, orderIndex } = req.body;
      const [newSubcategory] = await db.insert(courseSubcategories).values({
        categoryId,
        name,
        description,
        icon,
        color,
        orderIndex: orderIndex || 0,
      }).returning();
      res.json(newSubcategory);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating course subcategory:", error);
      }
      res.status(500).json({ error: "Failed to create course subcategory" });
    }
  });

  app.put("/api/course-subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await db.update(courseSubcategories).set(updateData).where(eq(courseSubcategories.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating course subcategory:", error);
      }
      res.status(500).json({ error: "Failed to update course subcategory" });
    }
  });

  app.delete("/api/course-subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(courseSubcategories).where(eq(courseSubcategories.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting course subcategory:", error);
      }
      res.status(500).json({ error: "Failed to delete course subcategory" });
    }
  });

  // ==================== LEARNING PATHS MANAGEMENT ====================
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const { groupId } = req.query;
      let paths;
      
      if (groupId) {
        paths = await db.select().from(learningPaths)
          .where(eq(learningPaths.groupId, groupId as string))
          .orderBy(asc(learningPaths.orderIndex));
      } else {
        paths = await db.select().from(learningPaths)
          .orderBy(asc(learningPaths.orderIndex));
      }
      
      res.json(paths);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching learning paths:", error);
      }
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  app.post("/api/learning-paths", async (req, res) => {
    try {
      const data = req.body;
      const [newPath] = await db.insert(learningPaths).values(data).returning();
      res.json(newPath);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating learning path:", error);
      }
      res.status(500).json({ error: "Failed to create learning path" });
    }
  });

  app.put("/api/learning-paths/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await db.update(learningPaths).set(updateData).where(eq(learningPaths.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating learning path:", error);
      }
      res.status(500).json({ error: "Failed to update learning path" });
    }
  });

  app.delete("/api/learning-paths/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(learningPaths).where(eq(learningPaths.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting learning path:", error);
      }
      res.status(500).json({ error: "Failed to delete learning path" });
    }
  });

  // ==================== DOCUMENTS MANAGEMENT ====================
  app.get("/api/documents", async (req, res) => {
    try {
      const { learningPathId } = req.query;
      let docs;
      
      if (learningPathId) {
        docs = await db.select().from(documents)
          .where(eq(documents.learningPathId, learningPathId as string))
          .orderBy(asc(documents.orderIndex));
      } else {
        docs = await db.select().from(documents)
          .orderBy(asc(documents.orderIndex));
      }
      
      res.json(docs);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching documents:", error);
      }
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = req.body;
      const [newDoc] = await db.insert(documents).values(data).returning();
      res.json(newDoc);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating document:", error);
      }
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await db.update(documents).set(updateData).where(eq(documents.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating document:", error);
      }
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(documents).where(eq(documents.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting document:", error);
      }
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ==================== LEARNING PATH PROGRESS ====================
  app.get("/api/learning-path-progress", async (req, res) => {
    try {
      const { userId, groupId } = req.query;
      let progress;
      
      if (userId && groupId) {
        // Filter by both userId and groupId
        progress = await db.select().from(learningPathProgress)
          .innerJoin(learningPaths, eq(learningPathProgress.learningPathId, learningPaths.id))
          .where(and(
            eq(learningPathProgress.userId, userId as string),
            eq(learningPaths.groupId, groupId as string)
          ));
        // Extract just the progress data
        progress = progress.map((p: any) => p.learning_path_progress);
      } else if (userId) {
        progress = await db.select().from(learningPathProgress)
          .where(eq(learningPathProgress.userId, userId as string));
      } else {
        progress = await db.select().from(learningPathProgress);
      }
      
      res.json(progress);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching learning path progress:", error);
      }
      res.status(500).json({ error: "Failed to fetch learning path progress" });
    }
  });

  app.post("/api/learning-path-progress", async (req, res) => {
    try {
      const data = req.body;
      const [newProgress] = await db.insert(learningPathProgress).values(data).returning();
      res.json(newProgress);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating learning path progress:", error);
      }
      res.status(500).json({ error: "Failed to create learning path progress" });
    }
  });

  // ==================== CONTENT ITEMS MANAGEMENT ====================
  app.get("/api/content-items", async (req, res) => {
    try {
      const { lessonId } = req.query;
      let items;
      
      if (lessonId) {
        items = await db.select().from(contentItems)
          .where(eq(contentItems.lessonId, lessonId as string))
          .orderBy(asc(contentItems.orderIndex));
      } else {
        items = await db.select().from(contentItems)
          .orderBy(asc(contentItems.orderIndex));
      }
      
      res.json(items);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching content items:", error);
      }
      res.status(500).json({ error: "Failed to fetch content items" });
    }
  });

  app.post("/api/content-items", upload.single('file'), async (req, res) => {
    try {
      const { lessonId, title, description, type, orderIndex, isRequired } = req.body;
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
      const [newItem] = await db.insert(contentItems).values({
        lessonId,
        title,
        description,
        type,
        fileUrl,
        fileSize: req.file ? req.file.size : null,
        orderIndex: orderIndex || 0,
        isRequired: isRequired === 'true',
      }).returning();
      res.json(newItem);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating content item:", error);
      }
      res.status(500).json({ error: "Failed to create content item" });
    }
  });

  app.put("/api/content-items/:id", upload.single('file'), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (req.file) {
        updateData.fileUrl = `/uploads/${req.file.filename}`;
        updateData.fileSize = req.file.size;
      }
      
      await db.update(contentItems).set(updateData).where(eq(contentItems.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating content item:", error);
      }
      res.status(500).json({ error: "Failed to update content item" });
    }
  });

  app.delete("/api/content-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(contentItems).where(eq(contentItems.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting content item:", error);
      }
      res.status(500).json({ error: "Failed to delete content item" });
    }
  });

  // ==================== QUIZ QUESTIONS MANAGEMENT ====================
  app.get("/api/quiz-questions", async (req, res) => {
    try {
      const { lessonId } = req.query;
      let questions;
      
      if (lessonId) {
        questions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, lessonId as string))
          .orderBy(asc(quizQuestions.orderIndex));
      } else {
        questions = await db.select().from(quizQuestions)
          .orderBy(asc(quizQuestions.orderIndex));
      }
      
      res.json(questions);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching quiz questions:", error);
      }
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quiz-questions", async (req, res) => {
    try {
      const { lessonId, question, type, options, correctAnswer, explanation, points, orderIndex } = req.body;
      const [newQuestion] = await db.insert(quizQuestions).values({
        lessonId,
        question,
        type,
        options: options ? JSON.parse(options) : null,
        correctAnswer: correctAnswer ? JSON.parse(correctAnswer) : null,
        explanation,
        points: points || 1,
        orderIndex: orderIndex || 0,
      }).returning();
      res.json(newQuestion);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating quiz question:", error);
      }
      res.status(500).json({ error: "Failed to create quiz question" });
    }
  });

  app.put("/api/quiz-questions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (updateData.options && typeof updateData.options === 'string') {
        updateData.options = JSON.parse(updateData.options);
      }
      if (updateData.correctAnswer && typeof updateData.correctAnswer === 'string') {
        updateData.correctAnswer = JSON.parse(updateData.correctAnswer);
      }
      
      await db.update(quizQuestions).set(updateData).where(eq(quizQuestions.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating quiz question:", error);
      }
      res.status(500).json({ error: "Failed to update quiz question" });
    }
  });

  app.delete("/api/quiz-questions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting quiz question:", error);
      }
      res.status(500).json({ error: "Failed to delete quiz question" });
    }
  });

  // ==================== AI CHAT ENDPOINTS ====================
  
  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const response = await aiService.generateResponse(messages, context);
      res.json(response);
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Generate course recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { interests, currentLevel } = req.body;
      
      if (!interests || !Array.isArray(interests)) {
        return res.status(400).json({ error: "Interests array is required" });
      }

      const recommendations = await aiService.generateCourseRecommendations(interests, currentLevel);
      res.json({ recommendations });
    } catch (error) {
      console.error("AI Recommendations Error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Generate study tips
  app.post("/api/ai/study-tips", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const tips = await aiService.generateStudyTips(topic, difficulty);
      res.json({ tips });
    } catch (error) {
      console.error("AI Study Tips Error:", error);
      res.status(500).json({ error: "Failed to generate study tips" });
    }
  });

  // Generate quiz questions
  app.post("/api/ai/quiz-questions", async (req, res) => {
    try {
      const { topic, difficulty, count } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const questions = await aiService.generateQuizQuestions(topic, difficulty, count || 5);
      res.json({ questions });
    } catch (error) {
      console.error("AI Quiz Questions Error:", error);
      res.status(500).json({ error: "Failed to generate quiz questions" });
    }
  });

  // Authentication endpoints
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Check if user is in session
      if (req.session && req.session.userId) {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, req.session.userId)
        });
        
        if (user) {
          return res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profileImageUrl: user.profileImageUrl
          });
        }
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });

      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "student"
      }).returning();

      // Set session
      req.session.userId = newUser.id;
      req.session.userRole = newUser.role;
      
      res.json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        profileImageUrl: newUser.profileImageUrl
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Signout error:", err);
        return res.status(500).json({ error: "Could not sign out" });
      }
      res.json({ message: "Signed out successfully" });
    });
  });

  // Course Management API Endpoints

  // Get featured courses for home page
  app.get("/api/featured-courses", async (req, res) => {
    try {
      // Get the featured course settings from home content
      const featuredSettings = await db.query.homeContent.findFirst({
        where: (homeContent, { eq }) => eq(homeContent.section, "featured-courses")
      });

      if (!featuredSettings?.showFeaturedCourses) {
        return res.json([]);
      }

      const featuredCourseIds = featuredSettings.featuredCourseIds || [];
      
      if (featuredCourseIds.length === 0) {
        // If no specific courses are selected, return the first 2 active courses
        const courses = await db.select().from(courseGroups)
          .where(eq(courseGroups.isActive, true))
          .orderBy(asc(courseGroups.name))
          .limit(2);
        return res.json(courses);
      }

      // Get the specific featured courses
      const featuredCourses = await db.select().from(courseGroups)
        .where(and(
          eq(courseGroups.isActive, true),
          inArray(courseGroups.id, featuredCourseIds)
        ))
        .orderBy(asc(courseGroups.name));

      res.json(featuredCourses);
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      res.status(500).json({ error: "Failed to fetch featured courses" });
    }
  });

  // Update featured courses (Admin only)
  app.post("/api/admin/featured-courses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { featuredCourseIds, showFeaturedCourses = true } = req.body;

      // Update or create the featured courses settings
      const existingSettings = await db.query.homeContent.findFirst({
        where: (homeContent, { eq }) => eq(homeContent.section, "featured-courses")
      });

      if (existingSettings) {
        await db.update(homeContent)
          .set({
            featuredCourseIds,
            showFeaturedCourses,
            updatedAt: new Date()
          })
          .where(eq(homeContent.id, existingSettings.id));
      } else {
        await db.insert(homeContent).values({
          section: "featured-courses",
          title: "Featured Courses",
          featuredCourseIds,
          showFeaturedCourses,
          isActive: true
        });
      }

      res.json({ message: "Featured courses updated successfully" });
    } catch (error) {
      console.error("Error updating featured courses:", error);
      res.status(500).json({ error: "Failed to update featured courses" });
    }
  });

  // Create course group (Admin only)
  app.post("/api/admin/course-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { 
        name, 
        description, 
        price, 
        categoryId, 
        features, 
        difficulty, 
        duration, 
        maxStudents,
        courseType,
        isLiveCourse,
        batchTimings,
        googleMeetLink,
        startDate,
        endDate
      } = req.body;

      const [newGroup] = await db.insert(courseGroups).values({
        name,
        description,
        price: price.toString(),
        categoryId,
        features,
        difficulty,
        duration,
        maxStudents,
        courseType: courseType || (isLiveCourse ? "live" : "self_paced"),
        isLiveCourse: isLiveCourse || false,
        batchTimings,
        googleMeetLink,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      }).returning();

      res.json({ success: true, group: newGroup });
    } catch (error) {
      console.error("Error creating course group:", error);
      res.status(500).json({ error: "Failed to create course group" });
    }
  });

  // Update course group
  app.put("/api/admin/course-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { 
        name, 
        description, 
        price, 
        categoryId, 
        features, 
        difficulty, 
        duration, 
        maxStudents,
        courseType,
        isLiveCourse,
        batchTimings,
        googleMeetLink,
        startDate,
        endDate
      } = req.body;


      const [updatedGroup] = await db.update(courseGroups)
        .set({
          name,
          description,
          price: price,
          categoryId,
          features,
          difficulty,
          duration,
          maxStudents,
          courseType: courseType || (isLiveCourse ? "live" : "self_paced"),
          isLiveCourse: isLiveCourse || false,
          batchTimings,
          googleMeetLink,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          updatedAt: new Date()
        })
        .where(eq(courseGroups.id, id))
        .returning();

      if (!updatedGroup) {
        return res.status(404).json({ error: "Course group not found" });
      }

      res.json({ success: true, group: updatedGroup });
    } catch (error: any) {
      console.error("Error updating course group:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to update course group", details: error.message });
    }
  });

  // Get courses (filtered for active courses and course groups)
  app.get("/api/courses", async (req, res) => {
    try {
      const { groupId } = req.query;
      
      let coursesQuery = db.query.courses.findMany({
        where: (courses, { eq }) => eq(courses.isActive, true),
        with: {
          courseGroup: {
            with: {
              category: true
            }
          }
        }
      });

      if (groupId) {
        coursesQuery = db.query.courses.findMany({
          where: (courses, { eq, and }) => and(
            eq(courses.courseGroupId, groupId as string),
            eq(courses.isActive, true)
          ),
          with: {
            courseGroup: {
              with: {
                category: true
              }
            }
          }
        });
      }

      const coursesData = await coursesQuery;
      
      // Filter out courses with inactive course groups
      const filteredCourses = coursesData.filter(course => 
        course.courseGroup && course.courseGroup.isActive === true
      );
      
      res.json(filteredCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Create course (Admin only)
  app.post("/api/admin/courses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { title, description, courseGroupId } = req.body;

      const [newCourse] = await db.insert(courses).values({
        title,
        description,
        courseGroupId,
        duration: 0, // Default duration
        isActive: true
      }).returning();

      res.json({ success: true, course: newCourse });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  // Get modules for a specific course
  app.get("/api/modules", async (req, res) => {
    try {
      const { courseId } = req.query;
      
      if (!courseId) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      const modulesData = await db.query.modules.findMany({
        where: (modules, { eq }) => eq(modules.courseId, courseId as string),
        orderBy: (modules, { asc }) => [asc(modules.orderIndex)]
      });

      res.json(modulesData);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // Create module (Admin only)
  app.post("/api/admin/modules", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { title, description, courseId, orderIndex } = req.body;

      const [newModule] = await db.insert(modules).values({
        title,
        description,
        courseId,
        orderIndex: orderIndex || 1,
        isActive: true
      }).returning();

      res.json({ success: true, module: newModule });
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  // User Enrollment API Endpoints
  
  // Test endpoint to check enrollment data
  app.get("/api/test-enrollment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollment = await db
        .select()
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.userId, userId))
        .limit(1);

      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching test enrollment:", error);
      res.status(500).json({ error: "Failed to fetch test enrollment" });
    }
  });

  // Get user's enrolled course groups with payment status
  app.get("/api/user/course-groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollments = await db
        .select({
          id: userGroupMemberships.id,
          userId: userGroupMemberships.userId,
          groupId: userGroupMemberships.groupId,
          status: userGroupMemberships.status,
          phoneNumber: userGroupMemberships.phoneNumber,
          studyPath: userGroupMemberships.studyPath,
          enrolledAt: userGroupMemberships.enrolledAt,
          approvedAt: userGroupMemberships.approvedAt,
          activatedAt: userGroupMemberships.activatedAt,
          expiresAt: userGroupMemberships.expiresAt,
          paymentStatus: userGroupMemberships.paymentStatus,
          courseGroupId: courseGroups.id,
          courseGroupName: courseGroups.name,
          courseGroupDescription: courseGroups.description,
          courseGroupPrice: courseGroups.price,
          courseGroupFeatures: courseGroups.features,
          courseGroupDifficulty: courseGroups.difficulty,
          courseGroupDuration: courseGroups.duration,
          courseGroupMaxStudents: courseGroups.maxStudents,
          courseGroupThumbnail: courseGroups.thumbnail,
          courseGroupCategoryId: courseGroups.categoryId,
          courseGroupSubcategoryId: courseGroups.subcategoryId,
          courseGroupCourseType: courseGroups.courseType,
          courseGroupIsLiveCourse: courseGroups.isLiveCourse,
          categoryName: courseCategories.name,
          categoryType: courseCategories.type,
          subcategoryName: courseSubcategories.name
        })
        .from(userGroupMemberships)
        .innerJoin(courseGroups, eq(userGroupMemberships.groupId, courseGroups.id))
        .leftJoin(courseCategories, eq(courseGroups.categoryId, courseCategories.id))
        .leftJoin(courseSubcategories, eq(courseGroups.subcategoryId, courseSubcategories.id))
        .where(eq(userGroupMemberships.userId, userId))
        .orderBy(desc(userGroupMemberships.enrolledAt));

      // Transform the data to include payment status and course group info
      const userCourseGroups = enrollments.map(enrollment => ({
        id: enrollment.courseGroupId,
        name: enrollment.courseGroupName,
        description: enrollment.courseGroupDescription,
        price: enrollment.courseGroupPrice,
        features: enrollment.courseGroupFeatures,
        difficulty: enrollment.courseGroupDifficulty,
        duration: enrollment.courseGroupDuration,
        maxStudents: enrollment.courseGroupMaxStudents,
        thumbnail: enrollment.courseGroupThumbnail,
        categoryId: enrollment.courseGroupCategoryId,
        subcategoryId: enrollment.courseGroupSubcategoryId,
        courseType: enrollment.courseGroupCourseType,
        isLiveCourse: enrollment.courseGroupIsLiveCourse,
        categoryName: enrollment.categoryName,
        subcategoryName: enrollment.subcategoryName,
        // Enrollment details
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        enrolledAt: enrollment.enrolledAt,
        activatedAt: enrollment.activatedAt,
        expiresAt: enrollment.expiresAt,
        phoneNumber: enrollment.phoneNumber,
        studyPath: enrollment.studyPath
      }));

      res.json(userCourseGroups);
    } catch (error) {
      console.error("Error fetching user course groups:", error);
      res.status(500).json({ error: "Failed to fetch user course groups" });
    }
  });

  // Get user's enrollment details for a specific course group
  app.get("/api/user/enrollments/:groupId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { groupId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollment = await db.query.userGroupMemberships.findFirst({
        where: (memberships, { and, eq }) => and(
          eq(memberships.userId, userId),
          eq(memberships.groupId, groupId)
        ),
        with: {
          courseGroup: {
            with: {
              category: true,
              subcategory: true
            }
          }
        }
      });

      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({
        id: enrollment.id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        enrolledAt: enrollment.enrolledAt,
        activatedAt: enrollment.activatedAt,
        expiresAt: enrollment.expiresAt,
        phoneNumber: enrollment.phoneNumber,
        studyPath: enrollment.studyPath,
        courseGroup: {
          id: enrollment.courseGroup.id,
          name: enrollment.courseGroup.name,
          description: enrollment.courseGroup.description,
          price: enrollment.courseGroup.price,
          features: enrollment.courseGroup.features,
          difficulty: enrollment.courseGroup.difficulty,
          duration: enrollment.courseGroup.duration,
          maxStudents: enrollment.courseGroup.maxStudents,
          thumbnail: enrollment.courseGroup.thumbnail,
          category: enrollment.courseGroup.category,
          subcategory: enrollment.courseGroup.subcategory
        }
      });
    } catch (error) {
      console.error("Error fetching user enrollment:", error);
      res.status(500).json({ error: "Failed to fetch user enrollment" });
    }
  });

  // Enroll user in a course group
  app.post("/api/user/enroll", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { groupId, phoneNumber, studyPath } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is already enrolled
      const existingEnrollment = await db.query.userGroupMemberships.findFirst({
        where: (memberships, { and, eq }) => and(
          eq(memberships.userId, userId),
          eq(memberships.groupId, groupId)
        )
      });

      if (existingEnrollment) {
        return res.status(400).json({ error: "User is already enrolled in this course" });
      }

      // Create new enrollment
      const [newEnrollment] = await db.insert(userGroupMemberships).values({
        userId,
        groupId,
        phoneNumber,
        studyPath: studyPath || 'self-paced',
        status: 'pending',
        paymentStatus: 'pending'
      }).returning();

      res.json({ 
        success: true, 
        enrollment: newEnrollment,
        message: "Enrollment request submitted. Please complete payment to activate your course."
      });
    } catch (error) {
      console.error("Error enrolling user:", error);
      res.status(500).json({ error: "Failed to enroll user" });
    }
  });

  // Enhanced Course Management API Endpoints

  // Get modules for a course group
  app.get("/api/modules", async (req, res) => {
    try {
      const { courseGroupId } = req.query;
      
      if (!courseGroupId) {
        return res.status(400).json({ message: "Course group ID is required" });
      }

      const modulesList = await db
        .select()
        .from(modules)
        .where(and(
          eq(modules.courseGroupId, courseGroupId as string),
          eq(modules.isActive, true)
        ))
        .orderBy(modules.orderIndex);

      res.json(modulesList);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // Create module for course group
  app.post("/api/admin/modules", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { 
        title, 
        description, 
        courseGroupId, 
        orderIndex,
        requiresQuiz,
        quizRequiredToUnlock,
        passingScore,
        maxAttempts,
        unlockMessage
      } = req.body;

      const [newModule] = await db.insert(modules).values({
        title,
        description,
        courseGroupId,
        orderIndex: orderIndex || 1,
        requiresQuiz: requiresQuiz || false,
        quizRequiredToUnlock: quizRequiredToUnlock || false,
        passingScore: passingScore || 70,
        maxAttempts: maxAttempts || 3,
        unlockMessage: unlockMessage || "Complete the previous module and pass the quiz to unlock this content.",
        isActive: true
      }).returning();

      res.json({ success: true, module: newModule });
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  // Get content items for a module
  app.get("/api/content-items", async (req, res) => {
    try {
      const { moduleId } = req.query;
      
      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }

      const contentItems = await db
        .select()
        .from(contentItems)
        .where(and(
          eq(contentItems.moduleId, moduleId as string),
          eq(contentItems.isActive, true)
        ))
        .orderBy(contentItems.orderIndex);

      res.json(contentItems);
    } catch (error) {
      console.error("Error fetching content items:", error);
      res.status(500).json({ error: "Failed to fetch content items" });
    }
  });

  // Create content item for module
  app.post("/api/admin/content-items", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { 
        title, 
        description, 
        type, 
        moduleId, 
        fileUrl, 
        externalUrl, 
        orderIndex,
        isRequired
      } = req.body;

      const [newContentItem] = await db.insert(contentItems).values({
        title,
        description,
        type,
        moduleId,
        fileUrl,
        externalUrl,
        orderIndex: orderIndex || 1,
        isRequired: isRequired || true,
        isActive: true
      }).returning();

      res.json({ success: true, contentItem: newContentItem });
    } catch (error) {
      console.error("Error creating content item:", error);
      res.status(500).json({ error: "Failed to create content item" });
    }
  });

  // Get quiz questions for a module
  app.get("/api/quiz-questions", async (req, res) => {
    try {
      const { moduleId } = req.query;
      
      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }

      const questions = await db
        .select()
        .from(quizQuestions)
        .where(and(
          eq(quizQuestions.moduleId, moduleId as string),
          eq(quizQuestions.isActive, true)
        ))
        .orderBy(quizQuestions.orderIndex);

      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });

  // Create quiz question for module
  app.post("/api/admin/quiz-questions", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { 
        question, 
        type, 
        moduleId, 
        options, 
        correctAnswer, 
        explanation, 
        points,
        orderIndex
      } = req.body;

      const [newQuestion] = await db.insert(quizQuestions).values({
        question,
        type: type || "multiple_choice",
        moduleId,
        options: options || [],
        correctAnswer,
        explanation,
        points: points || 1,
        orderIndex: orderIndex || 1,
        isActive: true
      }).returning();

      res.json({ success: true, question: newQuestion });
    } catch (error) {
      console.error("Error creating quiz question:", error);
      res.status(500).json({ error: "Failed to create quiz question" });
    }
  });

  // Get live sessions for a course group
  app.get("/api/live-sessions", async (req, res) => {
    try {
      const { groupId } = req.query;
      
      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
      }

      const sessions = await db
        .select()
        .from(liveSessions)
        .where(and(
          eq(liveSessions.groupId, groupId as string),
          eq(liveSessions.isActive, true)
        ))
        .orderBy(liveSessions.sessionDate);

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Failed to fetch live sessions" });
    }
  });


  // Get module progress for user
  app.get("/api/module-progress", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, groupId } = req.query;
      const targetUserId = userId || req.session.userId;

      if (!targetUserId || !groupId) {
        return res.status(400).json({ message: "User ID and Group ID are required" });
      }

      // First try to get progress from moduleProgressTracking table
      // Join with enrollments to match by courseId (which should be the groupId)
      const progressFromTracking = await db
        .select({
          id: moduleProgressTracking.id,
          userId: moduleProgressTracking.userId,
          groupId: enrollments.courseId, // Use courseId as groupId
          moduleId: moduleProgressTracking.moduleId,
          isCompleted: moduleProgressTracking.isCompleted,
          completedAt: moduleProgressTracking.completedAt,
          quizPassed: moduleProgressTracking.quizPassed,
          quizScore: moduleProgressTracking.quizScore,
          quizAttempts: moduleProgressTracking.quizAttempts,
          timeSpent: moduleProgressTracking.timeSpent,
          createdAt: moduleProgressTracking.createdAt,
          updatedAt: moduleProgressTracking.updatedAt
        })
        .from(moduleProgressTracking)
        .innerJoin(enrollments, eq(moduleProgressTracking.enrollmentId, enrollments.id))
        .where(and(
          eq(moduleProgressTracking.userId, targetUserId),
          eq(enrollments.courseId, groupId) // Use courseId instead of groupId
        ));

      // If no progress found in tracking table, try the old moduleProgress table
      if (progressFromTracking.length === 0) {
        const progressFromOld = await db
          .select()
          .from(moduleProgress)
          .where(and(
            eq(moduleProgress.userId, targetUserId),
            eq(moduleProgress.groupId, groupId)
          ));
        
        res.json(progressFromOld);
      } else {
        res.json(progressFromTracking);
      }
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ error: "Failed to fetch module progress" });
    }
  });

  // Update module progress
  app.post("/api/module-progress", isAuthenticated, async (req: any, res) => {
    try {
      const { 
        userId, 
        groupId, 
        moduleId, 
        isCompleted, 
        quizPassed, 
        quizScore, 
        timeSpent 
      } = req.body;

      const targetUserId = userId || req.session.userId;

      if (!targetUserId || !groupId || !moduleId) {
        return res.status(400).json({ message: "User ID, Group ID, and Module ID are required" });
      }

      // First try to find enrollment for this user and group
      const enrollment = await db
        .select()
        .from(enrollments)
        .where(and(
          eq(enrollments.userId, targetUserId),
          eq(enrollments.courseId, groupId) // Use courseId instead of groupId
        ))
        .limit(1);

      if (enrollment.length > 0) {
        // Use moduleProgressTracking table
        const existingProgress = await db
          .select()
          .from(moduleProgressTracking)
          .where(and(
            eq(moduleProgressTracking.userId, targetUserId),
            eq(moduleProgressTracking.enrollmentId, enrollment[0].id),
            eq(moduleProgressTracking.moduleId, moduleId)
          ))
          .limit(1);

        if (existingProgress.length > 0) {
          // Update existing progress
          const [updatedProgress] = await db
            .update(moduleProgressTracking)
            .set({
              isCompleted: isCompleted || existingProgress[0].isCompleted,
              completedAt: isCompleted ? new Date() : existingProgress[0].completedAt,
              quizPassed: quizPassed || existingProgress[0].quizPassed,
              quizScore: quizScore || existingProgress[0].quizScore,
              quizAttempts: quizPassed ? (existingProgress[0].quizAttempts || 0) + 1 : existingProgress[0].quizAttempts,
              timeSpent: (existingProgress[0].timeSpent || 0) + (timeSpent || 0),
              updatedAt: new Date()
            })
            .where(eq(moduleProgressTracking.id, existingProgress[0].id))
            .returning();

          res.json({ success: true, progress: updatedProgress });
        } else {
          // Create new progress
          const [newProgress] = await db.insert(moduleProgressTracking).values({
            userId: targetUserId,
            enrollmentId: enrollment[0].id,
            moduleId,
            isCompleted: isCompleted || false,
            completedAt: isCompleted ? new Date() : null,
            quizPassed: quizPassed || false,
            quizScore: quizScore || null,
            quizAttempts: quizPassed ? 1 : 0,
            timeSpent: timeSpent || 0
          }).returning();

          res.json({ success: true, progress: newProgress });
        }
      } else {
        // Fallback to old moduleProgress table
        const existingProgress = await db
          .select()
          .from(moduleProgress)
          .where(and(
            eq(moduleProgress.userId, targetUserId),
            eq(moduleProgress.groupId, groupId),
            eq(moduleProgress.moduleId, moduleId)
          ))
          .limit(1);

        if (existingProgress.length > 0) {
          // Update existing progress
          const [updatedProgress] = await db
            .update(moduleProgress)
            .set({
              isCompleted: isCompleted || existingProgress[0].isCompleted,
              completedAt: isCompleted ? new Date() : existingProgress[0].completedAt,
              quizPassed: quizPassed || existingProgress[0].quizPassed,
              quizScore: quizScore || existingProgress[0].quizScore,
              quizAttempts: quizPassed ? (existingProgress[0].quizAttempts || 0) + 1 : existingProgress[0].quizAttempts,
              timeSpent: (existingProgress[0].timeSpent || 0) + (timeSpent || 0),
              updatedAt: new Date()
            })
            .where(eq(moduleProgress.id, existingProgress[0].id))
            .returning();

          res.json({ success: true, progress: updatedProgress });
        } else {
          // Create new progress
          const [newProgress] = await db.insert(moduleProgress).values({
            userId: targetUserId,
            groupId,
            moduleId,
            isCompleted: isCompleted || false,
            completedAt: isCompleted ? new Date() : null,
            quizPassed: quizPassed || false,
            quizScore: quizScore || null,
            quizAttempts: quizPassed ? 1 : 0,
            timeSpent: timeSpent || 0
          }).returning();

          res.json({ success: true, progress: newProgress });
        }
      }
    } catch (error) {
      console.error("Error updating module progress:", error);
      res.status(500).json({ error: "Failed to update module progress" });
    }
  });

  // Notification API endpoints
  app.get("/api/upcoming-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const { NotificationService } = await import('./notificationService');
      const sessions = await NotificationService.getUpcomingSessionsForUser(req.session.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ error: "Failed to fetch upcoming sessions" });
    }
  });

  app.get("/api/session/:sessionId/check-access", isAuthenticated, async (req: any, res) => {
    try {
      const { NotificationService } = await import('./notificationService');
      const { sessionId } = req.params;
      console.log(`Checking access for user ${req.session.userId} to session ${sessionId}`);
      const accessCheck = await NotificationService.canUserJoinSession(req.session.userId, sessionId);
      console.log('Access check result:', accessCheck);
      res.json(accessCheck);
    } catch (error) {
      console.error("Error checking session access:", error);
      res.status(500).json({ error: "Failed to check session access" });
    }
  });

  // Reset courses to 2 specific courses (admin only) - No auth for testing
  app.post("/api/admin/reset-courses", async (req: any, res) => {
    try {
      console.log('Resetting courses to 2 specific courses...');
      
      // Clear all course-related data
      await db.delete(moduleProgress);
      await db.delete(userProgress);
      await db.delete(liveSessions);
      await db.delete(quizQuestions);
      await db.delete(contentItems);
      await db.delete(modules);
      await db.delete(enrollments);
      await db.delete(courseGroups);
      
      // Create Self-Paced course (₹149)
      await db.insert(courseGroups).values({
        id: 'self-paced-course-149',
        name: 'Self-Paced Software Testing Course',
        description: 'Complete software testing course with hands-on projects and real-world examples',
        price: '149.00',
        courseType: 'self_paced',
        categoryId: 'c917e560-5c4e-41cb-a2eb-571420a45647', // Self-Paced Learning category
        features: [
          'Lifetime access',
          'Certificate of completion',
          'Downloadable resources',
          'Community support',
          'Mobile-friendly learning'
        ],
        difficulty: 'beginner',
        duration: 120,
        isActive: true,
        isLiveCourse: false
      });
      
      // Create Live course (₹25000)
      await db.insert(courseGroups).values({
        id: 'live-course-25000',
        name: 'Premium Live Software Testing Classes',
        description: 'Interactive live sessions with industry experts and real-time Q&A',
        price: '25000.00',
        courseType: 'live',
        categoryId: 'dbe012db-3df5-472e-a283-991a779318ab', // Live Classes category
        features: [
          'Live interactive sessions',
          'Personal mentorship',
          'Industry projects',
          'Job placement assistance',
          'Lifetime access to recordings',
          'Certificate of completion',
          '1-on-1 career guidance'
        ],
        difficulty: 'intermediate',
        duration: 200,
        maxStudents: 20,
        isActive: true,
        isLiveCourse: true,
        batchTimings: 'Monday-Friday 6:00 PM - 8:00 PM',
        googleMeetLink: 'https://meet.google.com/live-classes',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-06-15')
      });
      
      console.log('Courses reset successfully!');
      res.json({ message: "Courses reset successfully" });
    } catch (error) {
      console.error("Error resetting courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Clear course groups (admin only)
  app.delete("/api/admin/course-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      console.log('Clearing course groups...');
      
      // Clear course groups and related data
      await db.delete(moduleProgress);
      await db.delete(userProgress);
      await db.delete(liveSessions);
      await db.delete(quizQuestions);
      await db.delete(contentItems);
      await db.delete(modules);
      await db.delete(enrollments);
      await db.delete(courseGroups);
      
      console.log('Course groups cleared successfully!');
      res.json({ message: "Course groups cleared successfully" });
    } catch (error) {
      console.error("Error clearing course groups:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // System Settings endpoints
  app.get('/api/admin/settings/system', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Mock system settings - in a real app, these would come from a database
      const settings = {
        siteName: "TestCademy",
        siteDescription: "Professional Software Testing Academy",
        siteUrl: "https://testcademy.com",
        adminEmail: "admin@testcademy.com",
        supportEmail: "support@testcademy.com",
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        maxFileSize: "10MB",
        sessionTimeout: "24",
        backupFrequency: "daily"
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.put('/api/admin/settings/system', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = req.body;
      // Mock update - in a real app, these would be saved to a database
      console.log("System settings updated:", settings);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });

  // Email Settings endpoints
  app.get('/api/admin/settings/email', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = {
        smtpHost: "",
        smtpPort: "587",
        smtpUsername: "",
        smtpPassword: "",
        fromEmail: "noreply@testcademy.com",
        fromName: "TestCademy",
        emailTemplates: {
          welcome: "Welcome to TestCademy!",
          enrollment: "Course enrollment confirmed",
          completion: "Congratulations on completing the course!"
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  app.put('/api/admin/settings/email', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = req.body;
      console.log("Email settings updated:", settings);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating email settings:", error);
      res.status(500).json({ error: "Failed to update email settings" });
    }
  });

  // Security Settings endpoints
  app.get('/api/admin/settings/security', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = {
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        twoFactorEnabled: false,
        ipWhitelist: [],
        allowedDomains: []
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching security settings:", error);
      res.status(500).json({ error: "Failed to fetch security settings" });
    }
  });

  app.put('/api/admin/settings/security', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = req.body;
      console.log("Security settings updated:", settings);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ error: "Failed to update security settings" });
    }
  });

  // Clear database (admin only)
  app.delete("/api/admin/clear-database", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      console.log('Starting database cleanup...');
      
      // Clear data in order (respecting foreign key constraints)
      await db.delete(moduleProgress);
      await db.delete(userProgress);
      await db.delete(liveSessions);
      await db.delete(quizQuestions);
      await db.delete(contentItems);
      await db.delete(modules);
      await db.delete(enrollments);
      await db.delete(courseGroups);
      await db.delete(testimonials);
      await db.delete(faqs);
      await db.delete(homeContent);
      await db.delete(learningPaths);
      await db.delete(documents);
      
      // Clear users except admin
      await db.delete(users).where(sql`role != 'admin'`);
      
      // Seed course categories
      await db.insert(courseCategories).values([
        {
          id: 'c917e560-5c4e-41cb-a2eb-571420a45647',
          name: 'Self-Paced Learning',
          description: 'Learn at your own pace with structured content',
          type: 'self_paced',
          icon: 'book-open',
          color: '#3b82f6',
          isActive: true,
          orderIndex: 1
        },
        {
          id: 'dbe012db-3df5-472e-a283-991a779318ab',
          name: 'Live Classes',
          description: 'Interactive live sessions with instructors',
          type: 'live',
          icon: 'video',
          color: '#ef4444',
          isActive: true,
          orderIndex: 2
        }
      ]).onConflictDoNothing();
      
      console.log('Database cleanup completed successfully!');
      res.json({ message: "Database cleared successfully" });
    } catch (error) {
      console.error("Error clearing database:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Seed content endpoint
  app.post('/api/seed-content', async (req, res) => {
    try {
      // Sample testimonials
      const sampleTestimonials = [
        {
          name: "Priya Sharma",
          role: "Junior QA Engineer",
          company: "TCS",
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          content: "The structured approach and practical exercises made learning easy. Got my first testing job within 2 months of completion!",
          rating: 5,
          isActive: true,
          orderIndex: 1
        },
        {
          name: "Rahul Kumar",
          role: "Automation Tester",
          company: "Infosys",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          content: "Excellent content quality and the self-paced format worked perfectly with my schedule. Highly recommend the automation course!",
          rating: 5,
          isActive: true,
          orderIndex: 2
        },
        {
          name: "Sneha Patel",
          role: "Senior QA Lead",
          company: "Wipro",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          content: "Great value for money! The course material is comprehensive and the certificate helped me get a promotion.",
          rating: 5,
          isActive: true,
          orderIndex: 3
        },
        {
          name: "Amit Singh",
          role: "QA Analyst",
          company: "Accenture",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          content: "The live sessions were incredibly helpful. The instructor's real-world experience made all the difference in understanding complex concepts.",
          rating: 5,
          isActive: true,
          orderIndex: 4
        },
        {
          name: "Kavya Reddy",
          role: "Test Engineer",
          company: "Cognizant",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          content: "From zero knowledge to job-ready in 3 months! The course structure and support system are outstanding.",
          rating: 5,
          isActive: true,
          orderIndex: 5
        }
      ];

      // Sample FAQs
      const sampleFAQs = [
        {
          question: "Is this suitable for complete beginners?",
          answer: "Absolutely! Our courses are designed to take you from zero to job-ready, with no prior testing experience required. We start with the basics and gradually build up to advanced concepts.",
          isActive: true,
          orderIndex: 1
        },
        {
          question: "How do I access the course materials?",
          answer: "After enrollment and payment confirmation, you'll get access to your personal dashboard where you can download handbooks and access all course materials. Everything is organized by modules for easy navigation.",
          isActive: true,
          orderIndex: 2
        },
        {
          question: "What payment methods do you accept?",
          answer: "Currently we accept UPI payments and bank transfers. After enrollment, you'll receive detailed payment instructions with our bank details and UPI ID.",
          isActive: true,
          orderIndex: 3
        },
        {
          question: "Will I get a certificate?",
          answer: "Yes! Upon completing your course and passing the final exam, you'll receive an industry-recognized certificate that you can add to your resume and LinkedIn profile. The certificate is valid and recognized by employers.",
          isActive: true,
          orderIndex: 4
        },
        {
          question: "Can I learn at my own pace?",
          answer: "Yes, our courses are completely self-paced. While we recommend 2 hours per day, you can adjust the schedule based on your availability. You have lifetime access to all materials.",
          isActive: true,
          orderIndex: 5
        },
        {
          question: "What if I have questions during the course?",
          answer: "We provide dedicated support through WhatsApp groups and email. Our instructors are available to help you throughout your learning journey. You can also interact with fellow students in our community forums.",
          isActive: true,
          orderIndex: 6
        },
        {
          question: "How long does it take to complete the course?",
          answer: "The self-paced course typically takes 60-90 days to complete, depending on your schedule. The live course runs for 8 weeks with 2 sessions per week. Both include practical projects and assignments.",
          isActive: true,
          orderIndex: 7
        },
        {
          question: "Do you provide job placement assistance?",
          answer: "Yes! We offer resume review, interview preparation, and job placement assistance. Our network of industry contacts helps connect students with relevant opportunities. 95% of our students find jobs within 3 months of completion.",
          isActive: true,
          orderIndex: 8
        }
      ];

      // Sample Tutors
      const sampleTutors = [
        {
          id: 'tutor-001',
          email: 'john.doe@testcademy.com',
          password: await bcrypt.hash('password123', 10),
          firstName: 'John',
          lastName: 'Doe',
          role: 'tutor',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tutor-002',
          email: 'jane.smith@testcademy.com',
          password: await bcrypt.hash('password123', 10),
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'tutor',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tutor-003',
          email: 'mike.wilson@testcademy.com',
          password: await bcrypt.hash('password123', 10),
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'tutor',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Clear existing data
      await db.delete(testimonials);
      await db.delete(faqs);
      await db.delete(users).where(eq(users.role, 'tutor'));
      
      // Insert testimonials
      for (const testimonial of sampleTestimonials) {
        await db.insert(testimonials).values(testimonial);
      }
      
      // Insert FAQs
      for (const faq of sampleFAQs) {
        await db.insert(faqs).values(faq);
      }

      // Insert tutors
      for (const tutor of sampleTutors) {
        await db.insert(users).values(tutor);
      }
      
      res.json({ 
        message: "Content seeded successfully", 
        testimonials: sampleTestimonials.length,
        faqs: sampleFAQs.length,
        tutors: sampleTutors.length
      });
    } catch (error) {
      console.error("Error seeding content:", error);
      res.status(500).json({ error: "Failed to seed content" });
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle room creation
    socket.on('create-room', (roomId: string) => {
      socket.join(roomId);
      socket.emit('room-created', roomId);
      console.log(`Room created: ${roomId}`);
    });

    // Handle room joining
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', socket.id);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle user updates (video/audio state changes)
    socket.on('user-updated', (participant: any) => {
      socket.to(participant.room).emit('user-updated', participant);
    });

    // Handle chat messages
    socket.on('chat-message', (roomId: string, message: any) => {
      socket.to(roomId).emit('chat-message', message);
    });

    // Handle hand raising
    socket.on('raise-hand', (roomId: string, userId: string, userName: string) => {
      socket.to(roomId).emit('hand-raised', userId, userName);
    });

    socket.on('lower-hand', (roomId: string, userId: string) => {
      socket.to(roomId).emit('hand-lowered', userId);
    });

    // Handle screen sharing
    socket.on('screen-share-started', (roomId: string) => {
      socket.to(roomId).emit('screen-share-started');
    });

    socket.on('screen-share-stopped', (roomId: string) => {
      socket.to(roomId).emit('screen-share-stopped');
    });

    // Handle WebRTC signaling
    socket.on('offer', (data) => {
      socket.to(data.room).emit('offer', data);
    });

    socket.on('answer', (data) => {
      socket.to(data.room).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.room).emit('ice-candidate', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      socket.broadcast.emit('user-left', socket.id);
    });

    // Handle leaving room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', socket.id);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });
  });

  return httpServer;
}
