import { relations } from "drizzle-orm";
import {
  users,
  courseCategories,
  courseSubcategories,
  courseGroups,
  courses,
  courseModules,
  studyMaterials,
  moduleStudyMaterials,
  moduleQuizQuestions,
  liveSessions,
  liveSessionMaterials,
  homeContent,
  testimonials,
  faqs,
  userGroupMemberships,
  learningPaths,
  documents,
  payments,
  userLearningProgress,
  courseTutors,
  enquiries,
  enrollments,
  modules,
  lessons,
  contentItems,
  quizQuestions,
  quizAttempts,
  userProgress,
  moduleProgress,
  assignments,
  assignmentSubmissions,
  exams,
  examAttempts,
  certificates,
  learningPathProgress,
  questions,
  userResponses,
  moduleQuizAttempts,
  moduleProgressTracking,
} from "./schema";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  groupMemberships: many(userGroupMemberships),
  courseTutors: many(courseTutors),
  payments: many(payments),
  learningProgress: many(userLearningProgress),
  enquiries: many(enquiries),
  enrollments: many(enrollments),
  userProgress: many(userProgress),
  moduleProgress: many(moduleProgress),
  assignmentSubmissions: many(assignmentSubmissions),
  examAttempts: many(examAttempts),
  certificates: many(certificates),
  userResponses: many(userResponses),
  moduleQuizAttempts: many(moduleQuizAttempts),
  moduleProgressTracking: many(moduleProgressTracking),
}));

// Course Category relations
export const courseCategoriesRelations = relations(courseCategories, ({ many }) => ({
  subcategories: many(courseSubcategories),
  courseGroups: many(courseGroups),
}));

// Course Subcategory relations
export const courseSubcategoriesRelations = relations(courseSubcategories, ({ one, many }) => ({
  category: one(courseCategories, {
    fields: [courseSubcategories.categoryId],
    references: [courseCategories.id],
  }),
  courseGroups: many(courseGroups),
}));

// Course Group relations
export const courseGroupsRelations = relations(courseGroups, ({ one, many }) => ({
  category: one(courseCategories, {
    fields: [courseGroups.categoryId],
    references: [courseCategories.id],
  }),
  subcategory: one(courseSubcategories, {
    fields: [courseGroups.subcategoryId],
    references: [courseSubcategories.id],
  }),
  courses: many(courses),
  courseModules: many(courseModules),
  studyMaterials: many(studyMaterials),
  liveSessions: many(liveSessions),
  userGroupMemberships: many(userGroupMemberships),
  courseTutors: many(courseTutors),
  payments: many(payments),
  learningProgress: many(userLearningProgress),
  userProgress: many(userProgress),
  moduleProgress: many(moduleProgress),
}));

// Course-Tutor Assignment relations
export const courseTutorsRelations = relations(courseTutors, ({ one }) => ({
  courseGroup: one(courseGroups, {
    fields: [courseTutors.courseGroupId],
    references: [courseGroups.id],
  }),
  tutor: one(users, {
    fields: [courseTutors.tutorId],
    references: [users.id],
  }),
}));

// Course relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  courseGroup: one(courseGroups, {
    fields: [courses.courseGroupId],
    references: [courseGroups.id],
  }),
  modules: many(modules),
  enquiries: many(enquiries),
  enrollments: many(enrollments),
  exams: many(exams),
  certificates: many(certificates),
}));

// Course Module relations
export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  courseGroup: one(courseGroups, {
    fields: [courseModules.courseGroupId],
    references: [courseGroups.id],
  }),
  studyMaterials: many(moduleStudyMaterials),
  quizQuestions: many(moduleQuizQuestions),
  liveSessions: many(liveSessions),
  moduleProgressTracking: many(moduleProgressTracking),
}));

// Study Material relations
export const studyMaterialsRelations = relations(studyMaterials, ({ one, many }) => ({
  course: one(courses, {
    fields: [studyMaterials.courseId],
    references: [courses.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [studyMaterials.courseGroupId],
    references: [courseGroups.id],
  }),
  moduleStudyMaterials: many(moduleStudyMaterials),
  liveSessionMaterials: many(liveSessionMaterials),
}));

// Module Study Material relations
export const moduleStudyMaterialsRelations = relations(moduleStudyMaterials, ({ one }) => ({
  module: one(courseModules, {
    fields: [moduleStudyMaterials.moduleId],
    references: [courseModules.id],
  }),
  studyMaterial: one(studyMaterials, {
    fields: [moduleStudyMaterials.studyMaterialId],
    references: [studyMaterials.id],
  }),
}));

// Module Quiz Question relations
export const moduleQuizQuestionsRelations = relations(moduleQuizQuestions, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [moduleQuizQuestions.moduleId],
    references: [courseModules.id],
  }),
  attempts: many(moduleQuizAttempts),
}));

// Module Quiz Attempt relations
export const moduleQuizAttemptsRelations = relations(moduleQuizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [moduleQuizAttempts.userId],
    references: [users.id],
  }),
  module: one(courseModules, {
    fields: [moduleQuizAttempts.moduleId],
    references: [courseModules.id],
  }),
  enrollment: one(enrollments, {
    fields: [moduleQuizAttempts.enrollmentId],
    references: [enrollments.id],
  }),
}));

// Live Session relations
export const liveSessionsRelations = relations(liveSessions, ({ one, many }) => ({
  courseGroup: one(courseGroups, {
    fields: [liveSessions.groupId],
    references: [courseGroups.id],
  }),
  module: one(courseModules, {
    fields: [liveSessions.moduleId],
    references: [courseModules.id],
  }),
  materials: many(liveSessionMaterials),
}));

// Live Session Material relations
export const liveSessionMaterialsRelations = relations(liveSessionMaterials, ({ one }) => ({
  session: one(liveSessions, {
    fields: [liveSessionMaterials.sessionId],
    references: [liveSessions.id],
  }),
  studyMaterial: one(studyMaterials, {
    fields: [liveSessionMaterials.studyMaterialId],
    references: [studyMaterials.id],
  }),
}));

// User Group Membership relations
export const userGroupMembershipsRelations = relations(userGroupMemberships, ({ one }) => ({
  user: one(users, {
    fields: [userGroupMemberships.userId],
    references: [users.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [userGroupMemberships.groupId],
    references: [courseGroups.id],
  }),
}));

// Learning Path relations
export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  courseGroup: one(courseGroups, {
    fields: [learningPaths.groupId],
    references: [courseGroups.id],
  }),
  documents: many(documents),
  questions: many(questions),
  progress: many(learningPathProgress),
}));

// Document relations
export const documentsRelations = relations(documents, ({ one, many }) => ({
  learningPath: one(learningPaths, {
    fields: [documents.learningPathId],
    references: [learningPaths.id],
  }),
  progress: many(learningPathProgress),
}));

// Payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [payments.groupId],
    references: [courseGroups.id],
  }),
}));

// User Learning Progress relations
export const userLearningProgressRelations = relations(userLearningProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLearningProgress.userId],
    references: [users.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [userLearningProgress.groupId],
    references: [courseGroups.id],
  }),
  learningPath: one(learningPaths, {
    fields: [userLearningProgress.learningPathId],
    references: [learningPaths.id],
  }),
  document: one(documents, {
    fields: [userLearningProgress.documentId],
    references: [documents.id],
  }),
}));

// Enquiry relations
export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  user: one(users, {
    fields: [enquiries.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enquiries.courseId],
    references: [courses.id],
  }),
}));

// Enrollment relations
export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  enquiry: one(enquiries, {
    fields: [enrollments.enquiryId],
    references: [enquiries.id],
  }),
  userProgress: many(userProgress),
  moduleProgress: many(moduleProgress),
  assignmentSubmissions: many(assignmentSubmissions),
  examAttempts: many(examAttempts),
  certificates: many(certificates),
  moduleQuizAttempts: many(moduleQuizAttempts),
  moduleProgressTracking: many(moduleProgressTracking),
}));

// Module relations
export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [modules.courseGroupId],
    references: [courseGroups.id],
  }),
  lessons: many(lessons),
}));

// Lesson relations
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  contentItems: many(contentItems),
  quizQuestions: many(quizQuestions),
  quizAttempts: many(quizAttempts),
  assignments: many(assignments),
}));

// Content Item relations
export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  lesson: one(lessons, {
    fields: [contentItems.lessonId],
    references: [lessons.id],
  }),
  module: one(modules, {
    fields: [contentItems.moduleId],
    references: [modules.id],
  }),
}));

// Quiz Question relations
export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizQuestions.lessonId],
    references: [lessons.id],
  }),
  module: one(modules, {
    fields: [quizQuestions.moduleId],
    references: [modules.id],
  }),
  attempts: many(quizAttempts),
}));

// Quiz Attempt relations
export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [quizAttempts.lessonId],
    references: [lessons.id],
  }),
  enrollment: one(enrollments, {
    fields: [quizAttempts.enrollmentId],
    references: [enrollments.id],
  }),
}));

// User Progress relations
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [userProgress.enrollmentId],
    references: [enrollments.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [userProgress.groupId],
    references: [courseGroups.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
  module: one(modules, {
    fields: [userProgress.moduleId],
    references: [modules.id],
  }),
  contentItem: one(contentItems, {
    fields: [userProgress.contentItemId],
    references: [contentItems.id],
  }),
}));

// Module Progress relations
export const moduleProgressRelations = relations(moduleProgress, ({ one }) => ({
  user: one(users, {
    fields: [moduleProgress.userId],
    references: [users.id],
  }),
  courseGroup: one(courseGroups, {
    fields: [moduleProgress.groupId],
    references: [courseGroups.id],
  }),
  module: one(modules, {
    fields: [moduleProgress.moduleId],
    references: [modules.id],
  }),
}));

// Assignment relations
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [assignments.lessonId],
    references: [lessons.id],
  }),
  submissions: many(assignmentSubmissions),
}));

// Assignment Submission relations
export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  user: one(users, {
    fields: [assignmentSubmissions.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [assignmentSubmissions.enrollmentId],
    references: [enrollments.id],
  }),
}));

// Exam relations
export const examsRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id],
  }),
  attempts: many(examAttempts),
}));

// Exam Attempt relations
export const examAttemptsRelations = relations(examAttempts, ({ one }) => ({
  exam: one(exams, {
    fields: [examAttempts.examId],
    references: [exams.id],
  }),
  user: one(users, {
    fields: [examAttempts.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [examAttempts.enrollmentId],
    references: [enrollments.id],
  }),
}));

// Certificate relations
export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [certificates.enrollmentId],
    references: [enrollments.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// Learning Path Progress relations
export const learningPathProgressRelations = relations(learningPathProgress, ({ one }) => ({
  user: one(users, {
    fields: [learningPathProgress.userId],
    references: [users.id],
  }),
  learningPath: one(learningPaths, {
    fields: [learningPathProgress.learningPathId],
    references: [learningPaths.id],
  }),
  document: one(documents, {
    fields: [learningPathProgress.documentId],
    references: [documents.id],
  }),
}));

// Question relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
  learningPath: one(learningPaths, {
    fields: [questions.learningPathId],
    references: [learningPaths.id],
  }),
  document: one(documents, {
    fields: [questions.documentId],
    references: [documents.id],
  }),
  userResponses: many(userResponses),
}));

// User Response relations
export const userResponsesRelations = relations(userResponses, ({ one }) => ({
  user: one(users, {
    fields: [userResponses.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [userResponses.questionId],
    references: [questions.id],
  }),
}));

// Module Progress Tracking relations
export const moduleProgressTrackingRelations = relations(moduleProgressTracking, ({ one }) => ({
  user: one(users, {
    fields: [moduleProgressTracking.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [moduleProgressTracking.enrollmentId],
    references: [enrollments.id],
  }),
  module: one(courseModules, {
    fields: [moduleProgressTracking.moduleId],
    references: [courseModules.id],
  }),
}));
