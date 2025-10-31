import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// -------------------------
//  Categories Table
// -------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});

// -------------------------
//  Books Table
// -------------------------
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: text("author").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
});

// -------------------------
//  Type Inference Helpers
// -------------------------
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
