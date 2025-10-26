import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";
import * as schema from "./schema.js";

// Ensure DATABASE_URL is defined
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in your .env file");
}

// Create PostgreSQL client
// - 'max: 1' is useful in development to avoid connection leaks during hot reload
// - In production, you can adjust or remove this limit
const client: Sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
});

// Initialize Drizzle ORM with schema
export const db = drizzle(client, { schema });

// Export client for optional direct SQL queries
export { client };
