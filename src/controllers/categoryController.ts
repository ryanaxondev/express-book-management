import { Request, Response } from "express";
import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";

// ----------------------------
//  Get all categories
// ----------------------------
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(categories);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// ----------------------------
//  Get single category by ID
// ----------------------------
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// ----------------------------
//  Create new category
// ----------------------------
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const [newCategory] = await db
      .insert(categories)
      .values({ name, description })
      .returning();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// ----------------------------
//  Update category
// ----------------------------
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [updated] = await db
      .update(categories)
      .set({ name, description })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// ----------------------------
//  Delete category
// ----------------------------
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Category not found" });

    res.status(200).json({
      message: "Category deleted successfully",
      deleted,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};
