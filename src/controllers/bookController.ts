import { Request, Response } from "express";
import { db } from "../db/index.js";
import { books, categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

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
// Get all books
// -----------------------------
export const getAllBooks = async (
  _req: Request,
  res: Response<BookWithCategory[] | { error: string }>
): Promise<void> => {
  try {
    const results = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id));

    const mapped = results.map(mapToBookWithCategory);
    res.status(200).json(mapped);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// -----------------------------
// Get single book by ID
// -----------------------------
export const getBookById = async (
  req: Request<{ id: string }>,
  res: Response<BookWithCategory | { error: string }>
): Promise<void> => {
  const { id } = req.params;

  try {
    const [result] = await db
      .select()
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, Number(id)));

    if (!result) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json(mapToBookWithCategory(result));
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

// ----------------------------
//  Create new book
// ----------------------------
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, categoryId } = req.body;

    if (!title || !author || !categoryId) {
      return res.status(400).json({ error: "title, author, and categoryId are required" });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const [newBook] = await db
      .insert(books)
      .values({ title, author, categoryId })
      .returning();

    const bookWithCategory = { ...newBook, category };

    res.status(201).json(bookWithCategory);
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
    const [updated] = await db
      .update(books)
      .set({ title, author, description, categoryId })
      .where(eq(books.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    // Refetch with category
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
