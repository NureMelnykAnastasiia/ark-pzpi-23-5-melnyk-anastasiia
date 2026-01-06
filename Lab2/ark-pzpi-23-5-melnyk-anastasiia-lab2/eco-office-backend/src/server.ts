import app from './app';
import { env } from './shared/utils/env';
import { db } from './db'; // Переконайтеся, що шлях до файлу з підключенням правильний (зазвичай src/db/index.ts)
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';

async function startServer() {
  try {
    console.log('🔍 Checking database status...');
    const checkResult = await db.execute(sql`
      SELECT to_regclass('public.users') as table_exists
    `);
  
    const isDbInitialized = checkResult.rows[0]?.table_exists;

    if (!isDbInitialized) {
      console.log(' Database appears empty. Running migrations...');
      
      // Запускаємо міграції з папки 'drizzle'
      await migrate(db, { migrationsFolder: './drizzle' });
      
      console.log(' Migrations completed successfully');
    } else {
      console.log(' Database already initialized. Skipping migrations.');
    }

    // 2. ЗАПУСК СЕРВЕРА
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${env.PORT}`);
    });

  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

startServer();