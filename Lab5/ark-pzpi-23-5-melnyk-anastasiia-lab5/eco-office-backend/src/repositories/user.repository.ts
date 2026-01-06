import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { RegisterDto } from '../schemas/auth.schema';

export class UserRepository {
  // Знайти користувача за email
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  // Створити користувача
  async create(data: RegisterDto, passwordHash: string) {
    const [newUser] = await db.insert(users).values({
      email: data.email,
      fullName: data.fullName,
      passwordHash: passwordHash,
      role: data.role || 'CLEANER',
    }).returning();
    
    return newUser;
  }
}