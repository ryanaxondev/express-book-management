import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // Use "dialect" instead of "driver"
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // PostgreSQL connection URL
  },
  verbose: true,
  strict: true,
});
