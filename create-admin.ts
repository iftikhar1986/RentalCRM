import 'dotenv/config';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@qmobility.com'));
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists:', existingAdmin[0].email);
      return;
    }

    // Create admin user with base64 encoded password
    const password = 'admin123';
    const hashedPassword = Buffer.from(password).toString('base64');
    
    const [admin] = await db.insert(users).values({
      email: 'admin@qmobility.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: 'true'
    }).returning();

    console.log('Admin user created successfully!');
    console.log('Email: admin@qmobility.com');
    console.log('Password: admin123');
    console.log('User ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser().then(() => {
  console.log('Admin creation process finished');
  process.exit(0);
}).catch(error => {
  console.error('Admin creation failed:', error);
  process.exit(1);
});