import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export all schema tables and types
export * from "./src/schema";
