import { Request, Response } from "express";
import { db } from "../db/index.js";
import { books, categories } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";
import { bookSchema, updateBookSchema } from "../validation/bookSchema.js";

// -----------------------------
// Types
// -----------------------------
export interface BookInput {
  title: string;
  author: string;
  description?: string;
  categoryId?: number | null;
}

export interface BookWithCategory {
  id: number;
  title: string;
  author: string;
  description: string | null;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
}

// -----------------------------
// Mapper Utility
// -----------------------------
const mapToBookWithCategory = (row: any): BookWithCategory => ({
  id: row.books.id,
  title: row.books.title,
  author: row.books.author,
  description: row.books.description,
  categoryId: row.books.categoryId,
  category: row.categories
    ? {
        id: row.categories.id,
        name: row.categories.name,
        description: row.categories.description,
      }
    : null,
});

// -----------------------------
// Get all books (with optional search) — Refactored
// -----------------------------
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const qParam = req.query.q;
    const q = typeof qParam === "string" ? qParam.trim() : undefined;

    // optional validation (for type-safety)
    if (q && q.length > 100) {
      res.status(400).json({ error: { message: "Query parameter too long" } });
      return;
    }

    let results: any[];

    if (q && q.length > 0) {
      // Full-text search using PostgreSQL
      results = await db.execute(sql`
        SELECT 
          b.*, 
          c.id AS category_id,
          c.name AS category_name,
          c.description AS category_description
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE to_tsvector('simple', coalesce(b.title, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.description, ''))
        @@ plainto_tsquery('simple', ${q})
        ORDER BY ts_rank_cd(
          to_tsvector('simple', coalesce(b.title, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.description, '')),
          plainto_tsquery('simple', ${q})
        ) DESC;
      `);
    } else {
      results = await db
        .select()
        .from(books)
        .leftJoin(categories, eq(books.categoryId, categories.id));
    }

    const mapped: BookWithCategory[] = results.map((row: any) => ({
      id: row.id ?? row.books?.id,
      title: row.title ?? row.books?.title,
      author: row.author ?? row.books?.author,
      description: row.description ?? row.books?.description,
      categoryId: row.category_id ?? row.books?.categoryId ?? null,
      category: row.category_name
        ? {
            id: row.category_id,
            name: row.category_name,
            description: row.category_description,
          }
        : row.categories
        ? {
            id: row.categories.id,
            name: row.categories.name,
            description: row.categories.description,
          }
        : null,
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// -----------------------------
// Get single book by ID
// -----------------------------
export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [book] = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        description: books.description,
        categoryId: books.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, id));

    if (!book) return res.status(404).json({ error: "Book not found" });

    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

// ----------------------------
// Create a new book
// ----------------------------
export const createBook = async (
  req: Request,
  res: Response<BookWithCategory | { error: Record<string, any> }>
): Promise<void> => {
  try {
    // Validate request body using Zod schema
    const parsed = bookSchema.safeParse(req.body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      res.status(400).json({ error: formattedErrors });
      return;
    }

    const { title, author, description, categoryId } = parsed.data;
    let validCategoryId: number | null = null;

    // Check if the referenced category exists (if provided)
    if (categoryId) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId));

      if (!category) {
        res.status(404).json({ error: { message: "Category not found" } });
        return;
      }

      validCategoryId = categoryId;
    }

    // Insert the new book record
    const [newBook] = await db
      .insert(books)
      .values({ title, author, description, categoryId: validCategoryId })
      .returning();

    // Fetch the inserted book along with its category for response
    const [joined] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, newBook.id));

    res.status(201).json(mapToBookWithCategory(joined));
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: { message: "Failed to create book" } });
  }
};

// -----------------------------
// Update an existing book
// -----------------------------
export const updateBook = async (
  req: Request<{ id: string }, {}, Partial<BookInput>>,
  res: Response<BookWithCategory | { error: Record<string, any> }>
): Promise<void> => {
  const { id } = req.params;

  try {
    // Validate request body using Zod schema
    const parsed = updateBookSchema.safeParse(req.body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      res.status(400).json({ error: formattedErrors });
      return;
    }

    const { title, author, description, categoryId } = parsed.data;
    let validCategoryId: number | null = null;

    // Validate category reference if provided
    if (categoryId !== undefined) {
      if (categoryId === null) {
        validCategoryId = null;
      } else {
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId));

        if (!category) {
          res.status(404).json({ error: { message: "Category not found" } });
          return;
        }

        validCategoryId = categoryId;
      }
    }

    // Update the book record in the database
    const [updated] = await db
      .update(books)
      .set({
        title,
        author,
        description,
        categoryId: validCategoryId ?? categoryId,
      })
      .where(eq(books.id, Number(id)))
      .returning();

    // Handle case when no matching book is found
    if (!updated) {
      res.status(404).json({ error: { message: "Book not found" } });
      return;
    }

    // Fetch the updated book with its category for response consistency
    const [joined] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, updated.id));

    // Return the updated record
    res.json(mapToBookWithCategory(joined));
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: { message: "Failed to update book" } });
  }
};

// -----------------------------
// Delete book
// -----------------------------
export const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string; book: BookWithCategory } | { error: { message: string } }>
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: { message: "Invalid book ID" } });
      return;
    }

    // Get book before deleting
    const [existing] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, id));

    if (!existing) {
      res.status(404).json({ error: { message: "Book not found" } });
      return;
    }

    // Delete operation
    await db.delete(books).where(eq(books.id, id));

    res.status(200).json({
      message: "Book deleted successfully",
      book: mapToBookWithCategory(existing),
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: { message: "Failed to delete book" } });
  }
};
