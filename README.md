# TestCademy - Online Software Testing Academy

A comprehensive online learning platform for software testing, featuring self-paced courses, live sessions, and interactive learning materials.

## 🚀 Features

- **Self-Paced Learning**: Structured modules with progress tracking
- **Live Sessions**: Interactive video sessions with instructors
- **Progress Tracking**: Real-time progress monitoring for students
- **Admin Dashboard**: Complete course and content management
- **Student Dashboard**: Personalized learning experience
- **Quiz System**: Interactive assessments and quizzes
- **Certificate Generation**: Automated certificate creation
- **File Management**: Support for PDFs, videos, and documents
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Query** for data fetching
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** (Supabase/Neon)
- **Session-based authentication**
- **File upload handling**

### Database
- **PostgreSQL** with Drizzle ORM
- **Supabase** (recommended) or Neon
- **Comprehensive schema** for courses, users, progress, etc.

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/testcademy.git
   cd testcademy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database Configuration
   DATABASE_URL=your_database_url
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the database migrations:
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string and update your `.env` file
4. Run migrations: `npm run db:push`

### Using Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to your `.env` file
3. Run migrations: `npm run db:push`

## 🚀 Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Deploy to Render

1. Connect your GitHub repository to Render
2. Set environment variables
3. Deploy as a web service

## 📁 Project Structure

```
testcademy/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express application
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database configuration
│   └── storage.ts          # Database operations
├── shared/                 # Shared code between frontend and backend
│   ├── schema.ts          # Database schema
│   └── relations.ts       # Database relations
├── migrations/             # Database migrations
└── uploads/               # File uploads directory
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema changes

## 🎯 Key Features

### Student Features
- Course enrollment and management
- Progress tracking and analytics
- Interactive learning materials
- Quiz and assessment system
- Certificate generation
- Live session participation

### Admin Features
- Course creation and management
- User management
- Content management
- Analytics and reporting
- System configuration

### Instructor Features
- Live session management
- Student progress monitoring
- Content creation tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@testcademy.com

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible components
- Supabase for the backend-as-a-service platform