import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("student"), // student, admin, tutor
  isActive: boolean("is_active").default(true), // user account status
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Categories (Self-Paced, Live Classes)
export const courseCategories = pgTable("course_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Self-Paced", "Live Classes"
  description: text("description"),
  type: varchar("type").notNull(), // "self_paced", "live"
  icon: varchar("icon"),
  color: varchar("color"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Subcategories
export const courseSubcategories = pgTable("course_subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => courseCategories.id).notNull(),
  name: varchar("name").notNull(), // "Fundamentals", "Advanced", "Automation", etc.
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Groups/Plans table (Enhanced)
export const courseGroups: any = pgTable("course_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => courseCategories.id).notNull(),
  subcategoryId: varchar("subcategory_id").references(() => courseSubcategories.id),
  name: varchar("name").notNull(), // e.g., "SELF-PACED – Fundamentals"
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // e.g., 149.00
  isActive: boolean("is_active").default(true),
  features: text("features").array(),
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  duration: integer("duration").default(30), // in days
  maxStudents: integer("max_students"), // for live classes
  startDate: timestamp("start_date"), // for live classes
  endDate: timestamp("end_date"), // for live classes
  batchTimings: text("batch_timings"), // for live classes
  thumbnail: varchar("thumbnail"),
  // Course type specific fields
  courseType: varchar("course_type").default("self_paced"), // self_paced, live
  isLiveCourse: boolean("is_live_course").default(false),
  googleMeetLink: varchar("google_meet_link"), // for live classes
  // Enhanced live course fields
  enrollmentStatus: varchar("enrollment_status").default("open"), // open, closed, full
  enrollmentCutoffDate: timestamp("enrollment_cutoff_date"), // when to stop accepting enrollments
  isEnrollmentActive: boolean("is_enrollment_active").default(true), // manual enrollment control
  currentEnrollments: integer("current_enrollments").default(0), // current number of enrolled students
  // Duplication support
  parentCourseId: varchar("parent_course_id"), // for duplicated courses - will be set after table creation
  isDuplicate: boolean("is_duplicate").default(false),
  duplicateOf: varchar("duplicate_of"), // original course name for reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Home Page Content Management
export const homeContent = pgTable("home_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: varchar("section").notNull(), // hero, courses, howItWorks, pricing, reviews, faq, footer
  title: varchar("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  // Course showcase settings
  featuredCourseIds: text("featured_course_ids").array(), // Array of course group IDs to showcase
  showFeaturedCourses: boolean("show_featured_courses").default(true),
  content: jsonb("content"), // Flexible JSON content for complex sections
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Header & Footer CMS
export const headerFooterContent = pgTable("header_footer_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: varchar("section").notNull(), // header, footer, navigation
  type: varchar("type").notNull(), // link, text, logo, social
  title: varchar("title"),
  url: varchar("url"),
  content: text("content"),
  icon: varchar("icon"),
  target: varchar("target").default("_self"), // _self, _blank
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Page Management CMS
export const pageContent = pgTable("page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  page: varchar("page").notNull(), // offers, popups, about, contact, etc.
  section: varchar("section").notNull(), // hero, content, sidebar, etc.
  title: varchar("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  content: jsonb("content"),
  image: varchar("image"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Testimonials/Reviews
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(),
  company: varchar("company"),
  image: varchar("image"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ Items
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Group Memberships table
export const userGroupMemberships = pgTable("user_group_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  status: varchar("status").default("pending"), // pending, approved, active, expired, suspended
  phoneNumber: varchar("phone_number"), // Phone number for contact
  studyPath: varchar("study_path"), // self-paced, premium-live
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  activatedAt: timestamp("activated_at"), // When the enrollment was activated
  expiresAt: timestamp("expires_at"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, failed, refunded
  paymentScreenshot: varchar("payment_screenshot"), // URL to payment screenshot
  transactionId: varchar("transaction_id"), // Payment transaction ID
  paymentNotes: text("payment_notes"), // Payment-related notes
  adminNotes: text("admin_notes"), // Admin notes about the enrollment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning Paths table
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  title: varchar("title").notNull(), // e.g., "Module 1: Intro to Software Testing"
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  // Quiz settings
  requiresQuiz: boolean("requires_quiz").default(false),
  quizRequiredToUnlock: boolean("quiz_required_to_unlock").default(false),
  passingScore: integer("passing_score").default(70), // Percentage required to pass
  maxAttempts: integer("max_attempts").default(3), // Maximum quiz attempts allowed
  unlockMessage: text("unlock_message").default("Complete the previous session and pass the quiz to unlock this content."),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learningPathId: varchar("learning_path_id").references(() => learningPaths.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // pdf, word, video, external_link
  fileUrl: varchar("file_url"), // For uploaded files
  externalUrl: varchar("external_url"), // For external links
  fileName: varchar("file_name"), // Original filename
  fileSize: integer("file_size"), // File size in bytes
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment History table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("INR"),
  paymentMethod: varchar("payment_method"), // razorpay, stripe, etc.
  transactionId: varchar("transaction_id").unique(),
  status: varchar("status").default("pending"), // pending, completed, failed, refunded
  paymentData: jsonb("payment_data"), // Store payment gateway response
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Progress tracking for learning paths
export const userLearningProgress = pgTable("user_learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  learningPathId: varchar("learning_path_id").references(() => learningPaths.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course-Tutor Assignment table
export const courseTutors = pgTable("course_tutors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseGroupId: varchar("course_group_id").references(() => courseGroups.id).notNull(),
  tutorId: varchar("tutor_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table (Enhanced)
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseGroupId: varchar("course_group_id").references(() => courseGroups.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in days
  dailyHours: integer("daily_hours").default(2),
  price: decimal("price", { precision: 10, scale: 2 }).default("149.00"),
  isActive: boolean("is_active").default(true),
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  thumbnail: varchar("thumbnail"),
  prerequisites: text("prerequisites").array(),
  learningOutcomes: text("learning_outcomes").array(),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enquiries table (for manual payment processing)
export const enquiries = pgTable("enquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  status: varchar("status").default("pending"), // pending, payment_sent, paid, activated
  paymentInstructions: text("payment_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  enquiryId: varchar("enquiry_id").references(() => enquiries.id),
  status: varchar("status").default("active"), // active, completed, suspended
  progress: integer("progress").default(0), // percentage
  currentDay: integer("current_day").default(1),
  startDate: timestamp("start_date").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course modules table
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  courseGroupId: varchar("course_group_id").references(() => courseGroups.id), // Direct reference to course group
  title: varchar("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  totalLessons: integer("total_lessons").default(0),
  isActive: boolean("is_active").default(true),
  // Quiz requirements
  requiresQuiz: boolean("requires_quiz").default(false),
  quizRequiredToUnlock: boolean("quiz_required_to_unlock").default(false),
  passingScore: integer("passing_score").default(70), // Percentage required to pass
  maxAttempts: integer("max_attempts").default(3), // Maximum quiz attempts allowed
  unlockMessage: text("unlock_message").default("Complete the previous module and pass the quiz to unlock this content."),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons table (Enhanced)
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => modules.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  dayNumber: integer("day_number").notNull(),
  orderIndex: integer("order_index").notNull(),
  estimatedDuration: integer("estimated_duration").default(30), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Items (Videos, Documents, PDFs, PPTs, etc.)
export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  moduleId: varchar("module_id").references(() => modules.id), // Direct module content
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // video, document, pdf, ppt, quiz, assignment
  content: jsonb("content"), // Flexible content storage
  fileUrl: varchar("file_url"),
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // for videos, in seconds
  orderIndex: integer("order_index").default(0),
  isRequired: boolean("is_required").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => lessons.id),
  moduleId: varchar("module_id").references(() => modules.id), // Direct module quiz questions
  question: text("question").notNull(),
  type: varchar("type").notNull(), // multiple_choice, true_false, fill_blank, essay
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation"),
  points: integer("points").default(1),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz Attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  answers: jsonb("answers"), // User's answers
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").default(0),
  passed: boolean("passed").default(false),
  timeSpent: integer("time_spent").default(0), // in seconds
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id),
  groupId: varchar("group_id").references(() => courseGroups.id), // Direct group reference
  lessonId: varchar("lesson_id").references(() => lessons.id),
  moduleId: varchar("module_id").references(() => modules.id), // Module progress
  contentItemId: varchar("content_item_id").references(() => contentItems.id), // Content progress
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module progress tracking
export const moduleProgress = pgTable("module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  moduleId: varchar("module_id").references(() => modules.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  quizPassed: boolean("quiz_passed").default(false),
  quizScore: integer("quiz_score"),
  quizAttempts: integer("quiz_attempts").default(0),
  timeSpent: integer("time_spent").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  templateUrl: varchar("template_url"),
  dueAfterDays: integer("due_after_days").default(1),
  maxScore: integer("max_score").default(100),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignment submissions table
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").references(() => assignments.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  submissionUrl: varchar("submission_url"),
  submissionText: text("submission_text"),
  status: varchar("status").default("submitted"), // submitted, reviewed, graded
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exams table
export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  totalQuestions: integer("total_questions").default(50),
  passingScore: integer("passing_score").default(70),
  timeLimit: integer("time_limit").default(90), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exam attempts table
export const examAttempts = pgTable("exam_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  status: varchar("status").default("in_progress"), // in_progress, completed, passed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  studentName: varchar("student_name").notNull(),
  courseName: varchar("course_name").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  certificateUrl: varchar("certificate_url"),
  status: varchar("status").default("pending"), // pending, generated, issued
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live Sessions table for premium live classes
export const liveSessions = pgTable("live_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").references(() => courseGroups.id).notNull(),
  moduleId: varchar("module_id").references(() => modules.id), // Which module this session covers
  title: varchar("title").notNull(),
  description: text("description"),
  sessionDate: timestamp("session_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  googleMeetLink: varchar("google_meet_link"),
  isActive: boolean("is_active").default(true),
  // Enhanced session management
  sessionStatus: varchar("session_status").default("scheduled"), // scheduled, live, completed, cancelled
  tutorId: varchar("tutor_id").references(() => users.id), // assigned tutor
  maxParticipants: integer("max_participants"), // session-specific limit
  currentParticipants: integer("current_participants").default(0), // current participants
  sessionLink: varchar("session_link"), // custom video call link
  sessionPassword: varchar("session_password"), // optional password for session
  recordingUrl: varchar("recording_url"), // recording after session
  notes: text("notes"), // tutor notes for the session
  // Notification settings
  notificationSent1Day: boolean("notification_sent_1_day").default(false),
  notificationSent1Hour: boolean("notification_sent_1_hour").default(false),
  notificationSent15Min: boolean("notification_sent_15_min").default(false),
  // Video call session management
  isVideoCallActive: boolean("is_video_call_active").default(false),
  videoCallRoomId: varchar("video_call_room_id"), // unique room ID for video calls
  canStartClass: boolean("can_start_class").default(false), // only true at exact class time
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning Path Progress Tracking table
export const learningPathProgress = pgTable("learning_path_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  learningPathId: varchar("learning_path_id").references(() => learningPaths.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  score: integer("score"), // For Q&A scores
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Q&A Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learningPathId: varchar("learning_path_id").references(() => learningPaths.id).notNull(),
  documentId: varchar("document_id").references(() => documents.id),
  question: text("question").notNull(),
  options: text("options").array(), // For multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  orderIndex: integer("order_index").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Q&A Responses table
export const userResponses = pgTable("user_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  userAnswer: text("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study Materials table (Enhanced)
export const studyMaterials = pgTable("study_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  courseGroupId: varchar("course_group_id").references(() => courseGroups.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // video, document, pdf, ppt, image, external_link
  fileUrl: varchar("file_url"), // For uploaded files
  externalUrl: varchar("external_url"), // For external links
  fileName: varchar("file_name"), // Original filename
  fileSize: integer("file_size"), // File size in bytes
  duration: integer("duration"), // For videos, in seconds
  thumbnail: varchar("thumbnail"), // For videos
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Modules table (Enhanced)
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseGroupId: varchar("course_group_id").references(() => courseGroups.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
  // Quiz requirements
  requiresQuiz: boolean("requires_quiz").default(false),
  quizRequiredToUnlock: boolean("quiz_required_to_unlock").default(false),
  passingScore: integer("passing_score").default(70), // Percentage required to pass
  maxAttempts: integer("max_attempts").default(3), // Maximum quiz attempts allowed
  unlockMessage: text("unlock_message").default("Complete the previous module and pass the quiz to unlock this content."),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module Study Materials (Many-to-Many relationship)
export const moduleStudyMaterials = pgTable("module_study_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  studyMaterialId: varchar("study_material_id").references(() => studyMaterials.id).notNull(),
  orderIndex: integer("order_index").default(0),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module Quiz Questions
export const moduleQuizQuestions = pgTable("module_quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  question: text("question").notNull(),
  type: varchar("type").notNull(), // multiple_choice, true_false
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation"),
  points: integer("points").default(1),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module Quiz Attempts
export const moduleQuizAttempts = pgTable("module_quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  answers: jsonb("answers"), // User's answers
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").default(0),
  passed: boolean("passed").default(false),
  timeSpent: integer("time_spent").default(0), // in seconds
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module Progress Tracking
export const moduleProgressTracking = pgTable("module_progress_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  quizPassed: boolean("quiz_passed").default(false),
  quizScore: integer("quiz_score"),
  quizAttempts: integer("quiz_attempts").default(0),
  timeSpent: integer("time_spent").default(0), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live Session Study Materials
export const liveSessionMaterials = pgTable("live_session_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => liveSessions.id).notNull(),
  studyMaterialId: varchar("study_material_id").references(() => studyMaterials.id).notNull(),
  orderIndex: integer("order_index").default(0),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Live Session Participants
export const liveSessionParticipants = pgTable("live_session_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => liveSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enrollmentId: varchar("enrollment_id").references(() => enrollments.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  duration: integer("duration").default(0), // in minutes
  attendanceStatus: varchar("attendance_status").default("present"), // present, absent, late
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video Call Participants (for real-time video call management)
export const videoCallParticipants = pgTable("video_call_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => liveSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roomId: varchar("room_id").notNull(), // video call room ID
  participantType: varchar("participant_type").notNull(), // host, student, tutor
  isVideoEnabled: boolean("is_video_enabled").default(true),
  isAudioEnabled: boolean("is_audio_enabled").default(true),
  isScreenSharing: boolean("is_screen_sharing").default(false),
  hasRaisedHand: boolean("has_raised_hand").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports for validation
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertEnquirySchema = createInsertSchema(enquiries).omit({
  id: true,
  userId: true,
  status: true,
  paymentInstructions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  status: true,
  progress: true,
  currentDay: true,
  startDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  status: true,
  score: true,
  feedback: true,
  submittedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseGroupSchema = createInsertSchema(courseGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLearningPathQuizSettingsSchema = createInsertSchema(learningPaths).pick({
  requiresQuiz: true,
  quizRequiredToUnlock: true,
  passingScore: true,
  maxAttempts: true,
  unlockMessage: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGroupMembershipSchema = createInsertSchema(userGroupMemberships).omit({
  id: true,
  status: true,
  enrolledAt: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserResponseSchema = createInsertSchema(userResponses).omit({
  id: true,
  answeredAt: true,
  createdAt: true,
});

export const insertLearningPathProgressSchema = createInsertSchema(learningPathProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Home Content Validation Schemas
export const insertHomeContentSchema = createInsertSchema(homeContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeaderFooterContentSchema = createInsertSchema(headerFooterContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageContentSchema = createInsertSchema(pageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New Course Management Validation Schemas
export const insertCourseCategorySchema = createInsertSchema(courseCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSubcategorySchema = createInsertSchema(courseSubcategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleProgressSchema = createInsertSchema(moduleProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Study Materials Validation Schemas
export const insertStudyMaterialSchema = createInsertSchema(studyMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleStudyMaterialSchema = createInsertSchema(moduleStudyMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertModuleQuizQuestionSchema = createInsertSchema(moduleQuizQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleQuizAttemptSchema = createInsertSchema(moduleQuizAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleProgressTrackingSchema = createInsertSchema(moduleProgressTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLiveSessionMaterialSchema = createInsertSchema(liveSessionMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertLiveSessionParticipantSchema = createInsertSchema(liveSessionParticipants).omit({
  id: true,
  joinedAt: true,
  createdAt: true,
});

export const insertVideoCallParticipantSchema = createInsertSchema(videoCallParticipants).omit({
  id: true,
  joinedAt: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type CourseGroup = typeof courseGroups.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type Exam = typeof exams.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UserGroupMembership = typeof userGroupMemberships.$inferSelect;
export type InsertUserGroupMembership = z.infer<typeof insertUserGroupMembershipSchema>;
export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserResponse = typeof userResponses.$inferSelect;
export type InsertUserResponse = z.infer<typeof insertUserResponseSchema>;
export type LearningPathProgress = typeof learningPathProgress.$inferSelect;
export type InsertLearningPathProgress = z.infer<typeof insertLearningPathProgressSchema>;
export type UpdateLearningPathQuizSettings = z.infer<typeof updateLearningPathQuizSettingsSchema>;
export type HeaderFooterContent = typeof headerFooterContent.$inferSelect;
export type InsertHeaderFooterContent = z.infer<typeof insertHeaderFooterContentSchema>;
export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;

// New Course Management Types
export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;
export type CourseSubcategory = typeof courseSubcategories.$inferSelect;
export type InsertCourseSubcategory = z.infer<typeof insertCourseSubcategorySchema>;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type InsertModuleProgress = z.infer<typeof insertModuleProgressSchema>;

// Study Materials Types
export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type ModuleStudyMaterial = typeof moduleStudyMaterials.$inferSelect;
export type InsertModuleStudyMaterial = z.infer<typeof insertModuleStudyMaterialSchema>;
export type ModuleQuizQuestion = typeof moduleQuizQuestions.$inferSelect;
export type InsertModuleQuizQuestion = z.infer<typeof insertModuleQuizQuestionSchema>;
export type ModuleQuizAttempt = typeof moduleQuizAttempts.$inferSelect;
export type InsertModuleQuizAttempt = z.infer<typeof insertModuleQuizAttemptSchema>;
export type ModuleProgressTracking = typeof moduleProgressTracking.$inferSelect;
export type InsertModuleProgressTracking = z.infer<typeof insertModuleProgressTrackingSchema>;
export type LiveSessionMaterial = typeof liveSessionMaterials.$inferSelect;
export type InsertLiveSessionMaterial = z.infer<typeof insertLiveSessionMaterialSchema>;
export type LiveSessionParticipant = typeof liveSessionParticipants.$inferSelect;
export type InsertLiveSessionParticipant = z.infer<typeof insertLiveSessionParticipantSchema>;
export type VideoCallParticipant = typeof videoCallParticipants.$inferSelect;
export type InsertVideoCallParticipant = z.infer<typeof insertVideoCallParticipantSchema>;
