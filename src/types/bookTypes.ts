export type UUID = string & { readonly brand: unique symbol };

export interface BookInput {
  title: string;
  author: string;
  description?: string;
  categoryId?: UUID | null;
}

export interface BookWithCategory {
  id: UUID;
  title: string;
  author: string;
  description: string | null;
  categoryId: UUID | null;
  category?: {
    id: UUID;
    name: string;
    description?: string | null;
  } | null;
}
