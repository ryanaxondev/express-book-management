import { BookWithCategory } from "../types/bookTypes.js";

export const mapToBookWithCategory = (row: any): BookWithCategory => ({
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
