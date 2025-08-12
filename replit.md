# Software Testing Academy

## Overview

This is a comprehensive online software testing academy platform that provides self-paced, interactive learning experiences. The platform offers structured learning paths for different testing specializations (manual testing, automation, SQL testing, JMeter performance testing) with handbook-based content and practical exercises. Students can enroll in courses, track their progress, submit assignments, and earn certificates upon completion. The system includes both student dashboards and admin panels for course management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with session-based authentication using express-session
- **Email**: Nodemailer for sending notifications and course communications
- **File Structure**: Monorepo structure with shared schema between client and server

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definition in `/shared/schema.ts`
- **Key Tables**: Users, courses, enquiries, enrollments, modules, lessons, user progress, assignments, submissions, exams, certificates
- **Session Storage**: PostgreSQL-backed session store for authentication

### Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Role-Based Access**: Student and admin roles with different permission levels
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

### Course Management System
- **Learning Paths**: Multiple course types (90-day complete, 60-day fast-track, specialized tracks)
- **Progress Tracking**: Daily lesson unlocking and completion tracking
- **Assignment System**: File upload and submission capabilities
- **Examination**: MCQ and scenario-based online exams
- **Certification**: Automated certificate generation upon course completion

### Content Delivery
- **Handbooks**: Downloadable PDF/HTML lesson content
- **Progressive Unlocking**: Time-based content release to prevent skipping ahead
- **Assignment Uploads**: File submission system for practical exercises
- **Progress Visualization**: Weekly and daily progress tracking components

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless)
- **Replit Platform**: Development and hosting environment with integrated authentication

### UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### Communication
- **Nodemailer**: Email service for enquiry notifications and course communications
- **Custom Email Templates**: Automated email workflows for student onboarding

### Form & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Schema validation for both client and server-side validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod