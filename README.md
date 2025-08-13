# TestAcademy Pro 🎓

A comprehensive self-paced interactive online software testing academy with structured learning paths, manual payment processing, and certification system.

## 🚀 Features

- **7 Course Options**: Complete Testing (90 days), Fast-track (60 days), Automation, Manual, SQL, JMeter, and Premium Live Sessions
- **Two Learning Formats**: Self-study courses (₹149) and Premium live video sessions (₹25,000)
- **Authentication**: Secure login with Replit OAuth
- **Manual Payment Processing**: Enquiry-based enrollment with admin approval
- **Progress Tracking**: Interactive dashboard with module completion tracking
- **Admin Panel**: Comprehensive enquiry management and student activation
- **Email Notifications**: Automated enquiry alerts and course communications
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth with session management
- **Email**: Nodemailer for notifications
- **Build Tools**: Vite, ESBuild

## 📁 Project Structure

```
testacademy-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
└── SETUP.md             # Detailed setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Visual Studio Code (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/testacademy-pro.git
   cd testacademy-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and email credentials
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see the application.

## 📚 Detailed Setup

For comprehensive setup instructions including VS Code configuration, deployment options, and troubleshooting, see [SETUP.md](./SETUP.md).

## 🌐 Deployment

This application can be deployed on various platforms:

- **Vercel** (Recommended): Full-stack deployment with serverless functions
- **Railway**: Container-based deployment with managed PostgreSQL
- **Heroku**: Traditional PaaS with Heroku Postgres
- **DigitalOcean**: App Platform with managed database

See [SETUP.md](./SETUP.md) for platform-specific deployment guides.

## 🎯 Course Offerings

### Self-Study Courses (₹149 each)
- **Complete Software Testing Mastery** (90 days)
- **Fast-Track Testing Bootcamp** (60 days)
- **Automation Testing Specialist** (30 days)
- **Manual Testing Expert** (45 days)
- **SQL Testing Pro** (25 days)
- **JMeter Performance Testing** (20 days)

### Premium Live Training (₹25,000)
- **Live Video Call Sessions** with direct instructor teaching
- **Personal Mentorship** and real-time doubt clearing
- **Manual + Automation** comprehensive training
- **Job Placement Guarantee** and enhanced career support

## 🔐 Authentication

The platform uses Replit OAuth for secure authentication with session-based user management. Students and admins have different access levels.

## 💰 Payment Process

1. Students browse courses and submit enquiries
2. Admin receives email notifications for new enquiries
3. Students make payments via UPI/bank transfer
4. Admin manually activates students after payment verification
5. Students gain access to their selected courses

## 🛡️ Security Features

- Session-based authentication with secure cookies
- PostgreSQL-backed session storage
- Environment variable protection
- CSRF protection and secure headers
- Input validation with Zod schemas

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [SETUP.md](./SETUP.md) troubleshooting section
- Review the documentation in the `/docs` folder

---

Built with ❤️ for the software testing community