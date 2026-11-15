import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('https://', 'postgresql://postgres:') +
        '/postgres',
  },
  verbose: true,
  strict: true,
});
