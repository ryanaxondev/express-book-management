import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = Router();

/**
 * @route   GET /categories
 * @desc    Get all categories
 * @access  Public
 */
router.get("/", getAllCategories);

/**
 * @route   GET /categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get("/:id", getCategoryById);

/**
 * @route   POST /categories
 * @desc    Create a new category
 * @access  Public
 */
router.post("/", createCategory);

/**
 * @route   PUT /categories/:id
 * @desc    Update category by ID
 * @access  Public
 */
router.put("/:id", updateCategory);

/**
 * @route   DELETE /categories/:id
 * @desc    Delete category by ID
 * @access  Public
 */
router.delete("/:id", deleteCategory);

export default router;
