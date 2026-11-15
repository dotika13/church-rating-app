import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // During build, we may not have the full Supabase URL format
    // Supabase URL: https://<project>.supabase.co -> postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url.includes("supabase.co")) {
      const projectRef = url.replace("https://", "").replace(".supabase.co", "");
      return `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD || "password"}@db.${projectRef}.supabase.co:5432/postgres`;
    }
    return url.replace("https://", "postgresql://postgres:") + "/postgres";
  }
  // Fallback for build time
  return "postgresql://postgres:postgres@localhost:5432/postgres";
}

const conn = globalForDb.conn ?? postgres(getConnectionString(), {
  prepare: false
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, logger: process.env.NODE_ENV === "development" });
export { schema };