import { Product } from '@src/features/products/interfaces/product.interface';
// Interface for Categories
export interface Category {
  categoryId: string; // UUID
  category_slug: string; // Unique string for the slug
  category_name: string; // Unique name of the category
  description: string; // Description of the category
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string

  Products?: Product[]; // Array of products in the category
}

// Interface for SubCategories
export interface SubCategory {
  subcategory_id: string; // UUID
  subcategory_name: string; // Unique name of the subcategory
  description: string; // Description of the subcategory
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  category?: Category; // Parent category
  Products?: Product[]; // Array of products in the subcategory
}

export interface CategorySubCategory {
  created_at: Date;
  category_subcategory_id: string;
  category_id: string;
  subcategory_id: string;
}
