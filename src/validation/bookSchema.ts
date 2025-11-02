import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
});

export const updateBookSchema = bookSchema.partial(); // all fields optional
