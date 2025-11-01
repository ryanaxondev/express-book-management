import { Request, Response } from "express";
import { db } from "../db/index.js";
import { books, categories } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";

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
// Get all books (with optional search)
// -----------------------------
export const getAllBooks = async (
  req: Request,
  res: Response<BookWithCategory[] | { error: string }>
): Promise<void> => {
  try {
    const q = req.query.q?.toString()?.trim();

    let results;

    if (q && q.length > 0) {
      // Full-text search
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
      // Get all books without search
      results = await db
        .select()
        .from(books)
        .leftJoin(categories, eq(books.categoryId, categories.id));
    }

    // Normalize output
    const mapped = Array.isArray(results)
      ? results.map((row: any) => ({
          id: row.id ?? row.books?.id,
          title: row.title ?? row.books?.title,
          author: row.author ?? row.books?.author,
          description: row.description ?? row.books?.description,
          categoryId: row.category_id ?? row.books?.categoryId,
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
        }))
      : [];

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
// Create new book
// ----------------------------
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, description, categoryId } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "title and author are required" });
    }

    let validCategoryId: number | null = null;

    if (categoryId) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId));

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      validCategoryId = categoryId;
    }

    const [newBook] = await db
      .insert(books)
      .values({ title, author, description, categoryId: validCategoryId })
      .returning();

    const [joined] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, newBook.id));

    res.status(201).json(mapToBookWithCategory(joined));
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
};

// -----------------------------
// Update book
// -----------------------------
export const updateBook = async (
  req: Request<{ id: string }, {}, Partial<BookInput>>,
  res: Response<BookWithCategory | { error: string }>
): Promise<void> => {
  const { id } = req.params;
  const { title, author, description, categoryId } = req.body;

  try {
    // Validate category existence if provided
    let validCategoryId: number | null = null;

    if (categoryId !== undefined) {
      if (categoryId === null) {
        validCategoryId = null;
      } else {
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId));

        if (!category) {
          res.status(404).json({ error: "Category not found" });
          return;
        }

        validCategoryId = categoryId;
      }
    }

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

    if (!updated) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    // Refetch with category for joined response
    const [joined] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, updated.id));

    res.json(mapToBookWithCategory(joined));
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
};

// -----------------------------
// Delete book
// -----------------------------
export const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string; book: BookWithCategory } | { error: string }>
): Promise<void> => {
  const { id } = req.params;

  try {
    // Get book before deleting
    const [existing] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, Number(id)));

    if (!existing) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    await db.delete(books).where(eq(books.id, Number(id)));

    res.json({
      message: "Book deleted successfully",
      book: mapToBookWithCategory(existing),
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};
