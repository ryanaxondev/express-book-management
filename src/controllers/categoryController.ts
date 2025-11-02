import { Request, Response } from "express";
import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { categorySchema, updateCategorySchema } from "../validation/categorySchema.js";

// ----------------------------
//  Get all categories
// ----------------------------
export const getAllCategories = async (
  req: Request,
  res: Response<any | { error: Record<string, any> }>
): Promise<void> => {
  try {
    const result = await db.select().from(categories);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: { message: "Failed to fetch categories" } });
  }
};

// ----------------------------
//  Get single category by ID
// ----------------------------
export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response<any | { error: Record<string, any> }>
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: { message: "Invalid ID" } });
      return;
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      res.status(404).json({ error: { message: "Category not found" } });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: { message: "Failed to fetch category" } });
  }
};

// ----------------------------
//  Create new category
// ----------------------------
export const createCategory = async (
  req: Request,
  res: Response<any | { error: Record<string, any> }>
): Promise<void> => {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      res.status(400).json({ error: formattedErrors });
      return;
    }

    const { name, description } = parsed.data;

    const [newCategory] = await db
      .insert(categories)
      .values({ name, description })
      .returning();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: { message: "Failed to create category" } });
  }
};

// ----------------------------
//  Update category
// ----------------------------
export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<any | { error: Record<string, any> }>
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: { message: "Invalid ID" } });
      return;
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      res.status(400).json({ error: formattedErrors });
      return;
    }

    const { name, description } = parsed.data;

    const [updated] = await db
      .update(categories)
      .set({ name, description })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: { message: "Category not found" } });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: { message: "Failed to update category" } });
  }
};

// ----------------------------
//  Delete category
// ----------------------------
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string } | { error: Record<string, any> }>
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: { message: "Invalid ID" } });
      return;
    }

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: { message: "Category not found" } });
      return;
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: { message: "Failed to delete category" } });
  }
};
