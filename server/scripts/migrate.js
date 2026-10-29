import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations() {
  const dbUrl = process.env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.log('\n======================================================');
    console.log('NOTICE: SUPABASE_DB_URL is not set in server/.env');
    console.log('======================================================');
    console.log('To set up your database tables without a direct connection:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project and navigate to the "SQL Editor" in the left sidebar.');
    console.log('3. Open file: supabase/migrations/001_initial_schema.sql');
    console.log('4. Copy the entire SQL content, paste it into the SQL Editor, and click "Run".');
    console.log('5. (Optional) To run migrations via this script in the future, copy your');
    console.log('   Connection string from Project Settings > Database and set SUPABASE_DB_URL in server/.env');
    console.log('======================================================\n');
    return;
  }

  const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found at: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No .sql migration files found in supabase/migrations.');
    return;
  }

  console.log(`Connecting to Supabase PostgreSQL database...`);
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected successfully. Starting migration run...\n');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`--> Running migration: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      await client.query(sql);
      console.log(`    [OK] ${file} executed successfully.`);
    }

    console.log('\nAll migrations completed successfully.');
  } catch (err) {
    console.error('\n[ERROR] Migration failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch {
      // ignore close errors
    }
  }
}

runMigrations();

