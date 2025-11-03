import { z } from "zod";

// Helper schema for UUID
export const uuidSchema = z.uuid();

// -----------------------------
// Create Book Validation
// -----------------------------
export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional().nullable(),
  categoryId: uuidSchema.optional().nullable(),
});

// -----------------------------
// Update Book Validation
// -----------------------------
// All fields optional for partial updates
export const updateBookSchema = bookSchema.partial();
