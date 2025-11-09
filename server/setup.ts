import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

async function createAdminUser() {
  const password = 'admin123'; // Default admin password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const adminUser = {
    id: randomUUID(),
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    suspended: false,
    suspendedUntil: null,
    suspensionReason: null
  };

  const dataDir = path.join(process.cwd(), 'server', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const usersPath = path.join(dataDir, 'users.json');
  await fs.writeFile(usersPath, JSON.stringify([adminUser], null, 2));
  
  console.log('Admin user created successfully');
  console.log('Username:', adminUser.username);
  console.log('Password:', password);
}

createAdminUser().catch(console.error);