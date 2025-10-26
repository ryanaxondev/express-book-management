import { Request, Response } from "express";
import { db } from "../db/index.js";
import { books } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Input type for creating or updating a book
interface BookInput {
  title: string;
  author: string;
}

// Get all books
export const getAllBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allBooks = await db.select().from(books);
    res.json(allBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// Create a new book
export const createBook = async (
  req: Request<{}, {}, BookInput>,
  res: Response
): Promise<void> => {
  const { title, author } = req.body;

  if (!title || !author) {
    res.status(400).json({ error: "Title and author are required" });
    return;
  }

  try {
    const [newBook] = await db.insert(books).values({ title, author }).returning();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
};

// Update an existing book
export const updateBook = async (
  req: Request<{ id: string }, {}, Partial<BookInput>>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { title, author } = req.body;

  try {
    const [updated] = await db
      .update(books)
      .set({ title, author })
      .where(eq(books.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
};

// Delete a book
export const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(books).where(eq(books.id, Number(id))).returning();

    if (!deleted.length) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json({ message: "Book deleted", book: deleted[0] });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};
