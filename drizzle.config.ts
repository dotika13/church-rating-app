import { defineConfig } from 'drizzle-kit';

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url.includes("supabase.co")) {
      const projectRef = url.replace("https://", "").replace(".supabase.co", "");
      return `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD || "password"}@db.${projectRef}.supabase.co:5432/postgres`;
    }
    return url.replace("https://", "postgresql://postgres:") + "/postgres";
  }
  return "postgresql://postgres:postgres@localhost:5432/postgres";
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getConnectionString(),
  },
  verbose: true,
  strict: true,
});
