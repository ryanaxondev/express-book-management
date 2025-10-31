import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = Router();

// Get all books
router.get("/", getAllBooks);

// Create a new book
router.post("/", createBook);

// Update a book by ID
router.put("/:id", updateBook);

// Delete a book by ID
router.delete("/:id", deleteBook);

// Get single book by ID
router.get("/:id", getBookById);

export default router;
