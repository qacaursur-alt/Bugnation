#!/usr/bin/env node

// Simple script to create admin user
// Run with: node create-admin-user.js

const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'DebugNation2024!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('🔐 Admin User Credentials:');
    console.log('========================');
    console.log('📧 Email: admin@debugnation.com');
    console.log('🔑 Password: DebugNation2024!');
    console.log('========================');
    console.log('');
    console.log('📝 SQL Query to create admin user:');
    console.log('==================================');
    console.log('');
    console.log(`INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)`);
    console.log(`VALUES (`);
    console.log(`  'admin@debugnation.com',`);
    console.log(`  '${hashedPassword}',`);
    console.log(`  'Admin',`);
    console.log(`  'User',`);
    console.log(`  'admin',`);
    console.log(`  NOW(),`);
    console.log(`  NOW()`);
    console.log(`)`);
    console.log(`ON CONFLICT (email) DO UPDATE SET`);
    console.log(`  role = 'admin',`);
    console.log(`  updated_at = NOW();`);
    console.log('');
    console.log('🚀 Instructions:');
    console.log('1. Start your database');
    console.log('2. Run the SQL query above in your PostgreSQL database');
    console.log('3. Or use the create-admin.sql file');
    console.log('4. Start the application: npm run dev');
    console.log('5. Go to http://localhost:5000/signin');
    console.log('6. Login with the credentials above');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
