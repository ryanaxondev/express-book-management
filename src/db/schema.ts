import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Define the "books" table schema
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: text("author").notNull(),
});

// Type helpers for controllers and routes
export type Book = InferSelectModel<typeof books>;   // Returned data type from DB
export type NewBook = InferInsertModel<typeof books>; // Input data type for new records
