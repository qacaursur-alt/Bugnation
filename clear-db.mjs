import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as schema from './shared/schema.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Clear data in order (respecting foreign key constraints)
    console.log('Clearing module progress...');
    await db.delete(schema.moduleProgress);
    
    console.log('Clearing user progress...');
    await db.delete(schema.userProgress);
    
    console.log('Clearing live sessions...');
    await db.delete(schema.liveSessions);
    
    console.log('Clearing quiz questions...');
    await db.delete(schema.quizQuestions);
    
    console.log('Clearing content items...');
    await db.delete(schema.contentItems);
    
    console.log('Clearing modules...');
    await db.delete(schema.modules);
    
    console.log('Clearing enrollments...');
    await db.delete(schema.enrollments);
    
    console.log('Clearing course groups...');
    await db.delete(schema.courseGroups);
    
    console.log('Clearing testimonials...');
    await db.delete(schema.testimonials);
    
    console.log('Clearing FAQs...');
    await db.delete(schema.faqs);
    
    console.log('Clearing home content...');
    await db.delete(schema.homeContent);
    
    console.log('Clearing learning paths...');
    await db.delete(schema.learningPaths);
    
    console.log('Clearing documents...');
    await db.delete(schema.documents);
    
    // Clear users except admin
    console.log('Clearing non-admin users...');
    await db.delete(schema.users).where(sql`role != 'admin'`);
    
    console.log('Database cleanup completed successfully!');
    
    // Seed some basic data
    console.log('Seeding basic data...');
    
    // Insert course categories
    await db.insert(schema.courseCategories).values([
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
    await pool.end();
  }
}

clearDatabase();
