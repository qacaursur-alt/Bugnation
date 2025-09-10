import bcrypt from 'bcryptjs';
import { db } from './db-local.ts';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    const adminEmail = 'admin@debugnation.com';
    const adminPassword = 'DebugNation2024!';
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const [admin] = await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }).returning();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', admin.id);
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
