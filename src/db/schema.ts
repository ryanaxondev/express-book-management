import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
// Books Table
// -------------------------
export const books = pgTable(
  "books",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    author: text("author").notNull(),
    description: text("description"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    // Basic B-tree indexes for quick lookups
    titleIdx: index("idx_books_title").on(table.title),
    authorIdx: index("idx_books_author").on(table.author),

    // Full-text index (optional, for PostgreSQL)
    // You can enable this later using pg_trgm or tsvector
    fullTextIdx: index("idx_books_fulltext").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.author} || ' ' || coalesce(${table.description}, ''))`
    ),
  })
);

// -------------------------
//  Type Inference Helpers
// -------------------------
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
