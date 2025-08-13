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

## Deployment & Setup

### Local Development Setup
1. **Prerequisites**: Node.js 18+, PostgreSQL, Visual Studio Code
2. **Environment Variables**: DATABASE_URL, SESSION_SECRET, EMAIL credentials
3. **Database Setup**: PostgreSQL database with `npm run db:push` migration
4. **Development Server**: `npm run dev` starts both frontend and backend

### VS Code Configuration
- **Extensions**: React snippets, TypeScript support, Tailwind IntelliSense
- **Settings**: Auto-format on save, TypeScript import preferences
- **Debug Configuration**: Node.js debugging for server development

### Production Deployment Options
1. **Vercel**: Full-stack deployment with serverless functions
2. **Railway**: Container-based deployment with PostgreSQL addon
3. **Heroku**: Traditional PaaS deployment with Heroku Postgres
4. **DigitalOcean**: App Platform with managed database

### GitHub Integration
- **Repository Structure**: Monorepo with client/server separation
- **Build Process**: Vite for frontend, ESBuild for backend bundling
- **CI/CD**: Automatic deployment on git push (platform-dependent)

### Production Considerations
- **Database**: Managed PostgreSQL (Neon, Railway, or cloud provider)
- **Authentication**: Replit OAuth configuration for custom domains
- **Email Service**: Gmail App Password or SendGrid for notifications
- **Environment Security**: Proper secret management and HTTPS enforcement