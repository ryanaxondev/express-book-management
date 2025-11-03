import {
  pgTableCreator,
  uuid,
  varchar,
  text,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

/**
 * Create table helper.
 * Using pgTableCreator with a simple name mapper to keep API stable
 * and avoid deprecated overloads.
 */
export const createTable = pgTableCreator((name) => name);

/**
 * Categories table definition
 */
export const categories = createTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});

/**
 * Books table definition
 *
 * Note: the third parameter returns an array of index definitions (not an object).
 * This avoids the deprecated object overload.
 */
export const books = createTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    author: text("author").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // basic b-tree indexes
    index("idx_books_title").on(table.title),
    index("idx_books_author").on(table.author),

    // full-text GIN index using a tsvector expression
    index("idx_books_fulltext").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.author} || ' ' || coalesce(${table.description}, ''))`
    ),
  ]
);

/**
 * Type helpers
 */
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
