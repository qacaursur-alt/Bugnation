import {
  users,
  courses,
  enquiries,
  enrollments,
  modules,
  lessons,
  userProgress,
  assignments,
  assignmentSubmissions,
  exams,
  examAttempts,
  certificates,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enquiry,
  type InsertEnquiry,
  type Enrollment,
  type InsertEnrollment,
  type Module,
  type Lesson,
  type UserProgress,
  type Assignment,
  type AssignmentSubmission,
  type InsertAssignmentSubmission,
  type Exam,
  type ExamAttempt,
  type Certificate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  
  // Enquiry operations
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: string): Promise<Enquiry | undefined>;
  updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry>;
  
  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment>;
  
  // Module and Lesson operations
  getCourseModules(courseId: string): Promise<Module[]>;
  getModuleLessons(moduleId: string): Promise<Lesson[]>;
  getCourseLessons(courseId: string): Promise<Lesson[]>;
  
  // Progress operations
  getUserProgress(userId: string, enrollmentId: string): Promise<UserProgress[]>;
  updateUserProgress(userId: string, lessonId: string, enrollmentId: string): Promise<UserProgress>;
  
  // Assignment operations
  getLessonAssignments(lessonId: string): Promise<Assignment[]>;
  submitAssignment(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  getUserAssignments(userId: string, enrollmentId: string): Promise<(AssignmentSubmission & { assignment: Assignment })[]>;
  gradeAssignment(submissionId: string, score: number, feedback: string): Promise<AssignmentSubmission>;
  
  // Exam operations
  getCourseExam(courseId: string): Promise<Exam | undefined>;
  startExam(examId: string, userId: string, enrollmentId: string): Promise<ExamAttempt>;
  completeExam(attemptId: string, score: number, correctAnswers: number): Promise<ExamAttempt>;
  
  // Certificate operations
  generateCertificate(userId: string, enrollmentId: string, courseId: string): Promise<Certificate>;
  getUserCertificates(userId: string): Promise<Certificate[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true)).orderBy(asc(courses.title));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Enquiry operations
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const [newEnquiry] = await db.insert(enquiries).values(enquiry).returning();
    return newEnquiry;
  }

  async getEnquiries(): Promise<Enquiry[]> {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  }

  async getEnquiry(id: string): Promise<Enquiry | undefined> {
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    return enquiry;
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const [updatedEnquiry] = await db
      .update(enquiries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(enquiries.id, id))
      .returning();
    return updatedEnquiry;
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        enquiryId: enrollments.enquiryId,
        status: enrollments.status,
        progress: enrollments.progress,
        currentDay: enrollments.currentDay,
        startDate: enrollments.startDate,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.createdAt));
  }

  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }

  async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Module and Lesson operations
  async getCourseModules(courseId: string): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(and(eq(modules.courseId, courseId), eq(modules.isActive, true)))
      .orderBy(asc(modules.orderIndex));
  }

  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isActive, true)))
      .orderBy(asc(lessons.orderIndex));
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    return await db
      .select({
        id: lessons.id,
        moduleId: lessons.moduleId,
        title: lessons.title,
        content: lessons.content,
        dayNumber: lessons.dayNumber,
        orderIndex: lessons.orderIndex,
        handbookUrl: lessons.handbookUrl,
        videoUrl: lessons.videoUrl,
        isActive: lessons.isActive,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(and(eq(modules.courseId, courseId), eq(lessons.isActive, true)))
      .orderBy(asc(lessons.dayNumber), asc(lessons.orderIndex));
  }

  // Progress operations
  async getUserProgress(userId: string, enrollmentId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.enrollmentId, enrollmentId)));
  }

  async updateUserProgress(userId: string, lessonId: string, enrollmentId: string): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.lessonId, lessonId),
          eq(userProgress.enrollmentId, enrollmentId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({ isCompleted: true, completedAt: new Date(), updatedAt: new Date() })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values({
          userId,
          lessonId,
          enrollmentId,
          isCompleted: true,
          completedAt: new Date(),
        })
        .returning();
      return newProgress;
    }
  }

  // Assignment operations
  async getLessonAssignments(lessonId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.lessonId, lessonId), eq(assignments.isActive, true)));
  }

  async submitAssignment(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    const [newSubmission] = await db.insert(assignmentSubmissions).values(submission).returning();
    return newSubmission;
  }

  async getUserAssignments(userId: string, enrollmentId: string): Promise<(AssignmentSubmission & { assignment: Assignment })[]> {
    return await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        userId: assignmentSubmissions.userId,
        enrollmentId: assignmentSubmissions.enrollmentId,
        submissionUrl: assignmentSubmissions.submissionUrl,
        submissionText: assignmentSubmissions.submissionText,
        status: assignmentSubmissions.status,
        score: assignmentSubmissions.score,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        reviewedAt: assignmentSubmissions.reviewedAt,
        createdAt: assignmentSubmissions.createdAt,
        updatedAt: assignmentSubmissions.updatedAt,
        assignment: assignments,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .where(
        and(
          eq(assignmentSubmissions.userId, userId),
          eq(assignmentSubmissions.enrollmentId, enrollmentId)
        )
      )
      .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  async gradeAssignment(submissionId: string, score: number, feedback: string): Promise<AssignmentSubmission> {
    const [graded] = await db
      .update(assignmentSubmissions)
      .set({
        score,
        feedback,
        status: "graded",
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();
    return graded;
  }

  // Exam operations
  async getCourseExam(courseId: string): Promise<Exam | undefined> {
    const [exam] = await db
      .select()
      .from(exams)
      .where(and(eq(exams.courseId, courseId), eq(exams.isActive, true)));
    return exam;
  }

  async startExam(examId: string, userId: string, enrollmentId: string): Promise<ExamAttempt> {
    const [attempt] = await db
      .insert(examAttempts)
      .values({
        examId,
        userId,
        enrollmentId,
        status: "in_progress",
      })
      .returning();
    return attempt;
  }

  async completeExam(attemptId: string, score: number, correctAnswers: number): Promise<ExamAttempt> {
    const [completed] = await db
      .update(examAttempts)
      .set({
        score,
        correctAnswers,
        status: score >= 70 ? "passed" : "failed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();
    return completed;
  }

  // Certificate operations
  async generateCertificate(userId: string, enrollmentId: string, courseId: string): Promise<Certificate> {
    const user = await this.getUser(userId);
    const course = await this.getCourse(courseId);
    
    if (!user || !course) {
      throw new Error("User or course not found");
    }

    const certificateNumber = `TA-${Date.now()}-${userId.substring(0, 8)}`;
    
    const [certificate] = await db
      .insert(certificates)
      .values({
        userId,
        enrollmentId,
        courseId,
        certificateNumber,
        studentName: `${user.firstName} ${user.lastName}`,
        courseName: course.title,
        completionDate: new Date(),
        status: "pending",
      })
      .returning();
    return certificate;
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.completionDate));
  }
}

export const storage = new DatabaseStorage();
