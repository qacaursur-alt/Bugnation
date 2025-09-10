const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');
const { 
  users, 
  courseGroups, 
  modules, 
  contentItems, 
  quizQuestions, 
  liveSessions, 
  userProgress, 
  moduleProgress,
  enrollments,
  testimonials,
  faqs,
  homeContent,
  learningPaths,
  documents,
  courseCategories
} = require('./shared/schema.ts');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/testcademy';
const client = postgres(connectionString);
const db = drizzle(client);

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Clear data in order (respecting foreign key constraints)
    console.log('Clearing module progress...');
    await db.delete(moduleProgress);
    
    console.log('Clearing user progress...');
    await db.delete(userProgress);
    
    console.log('Clearing live sessions...');
    await db.delete(liveSessions);
    
    console.log('Clearing quiz questions...');
    await db.delete(quizQuestions);
    
    console.log('Clearing content items...');
    await db.delete(contentItems);
    
    console.log('Clearing modules...');
    await db.delete(modules);
    
    console.log('Clearing enrollments...');
    await db.delete(enrollments);
    
    console.log('Clearing course groups...');
    await db.delete(courseGroups);
    
    console.log('Clearing testimonials...');
    await db.delete(testimonials);
    
    console.log('Clearing FAQs...');
    await db.delete(faqs);
    
    console.log('Clearing home content...');
    await db.delete(homeContent);
    
    console.log('Clearing learning paths...');
    await db.delete(learningPaths);
    
    console.log('Clearing documents...');
    await db.delete(documents);
    
    // Clear users except admin
    console.log('Clearing non-admin users...');
    await db.delete(users).where(sql`role != 'admin'`);
    
    console.log('Database cleanup completed successfully!');
    
    // Seed some basic data
    console.log('Seeding basic data...');
    
    // Insert course categories
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
    
    console.log('Basic data seeded successfully!');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await client.end();
  }
}

clearDatabase();
