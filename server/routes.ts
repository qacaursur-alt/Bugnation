import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEnquirySchema, insertAssignmentSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Setup email transporter (configure with your email service)
  const transporter = nodemailer.createTransport({
    // Configure with your email service provider
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'support@testacademypro.com',
      pass: process.env.EMAIL_PASS || 'app-password'
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

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

      // Send email notification to admin
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || 'support@testacademypro.com',
          to: process.env.ADMIN_EMAIL || 'admin@testacademypro.com',
          subject: `New Course Enquiry - ${enquiry.fullName}`,
          html: `
            <h2>New Course Enquiry</h2>
            <p><strong>Name:</strong> ${enquiry.fullName}</p>
            <p><strong>Email:</strong> ${enquiry.email}</p>
            <p><strong>Phone:</strong> ${enquiry.phone}</p>
            <p><strong>Course ID:</strong> ${enquiry.courseId}</p>
            <p><strong>Enquiry ID:</strong> ${enquiry.id}</p>
            <p>Please send payment instructions to the student.</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      res.status(201).json(enquiry);
    } catch (error) {
      console.error("Error creating enquiry:", error);
      res.status(400).json({ message: "Invalid enquiry data" });
    }
  });

  // Protected student routes
  app.get("/api/my-enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId, req.params.enrollmentId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/lessons/:lessonId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const assignments = await storage.getUserAssignments(userId, req.params.enrollmentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments/:assignmentId/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/enrollments/:enrollmentId/certificate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const user = await storage.getUser(req.user.claims.sub);
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

  app.post("/api/admin/enquiries/:id/activate", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const course = await storage.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post("/api/admin/assignments/:submissionId/grade", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
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

  const httpServer = createServer(app);
  return httpServer;
}
