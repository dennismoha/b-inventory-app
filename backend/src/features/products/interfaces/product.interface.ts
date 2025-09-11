import { Category, SubCategory } from '@src/features/categories/interfaces/categories.interface';
import { SupplierPricing, SupplierProduct } from '@src/features/suppliers/interfaces/supplier.interface';
import { Unit } from '@src/features/units/interfaces/units.interface';
// Interface for Products
export interface Product {
  product_id: string; // UUID
  name: string; // Name of the product
  description: string; // Description of the product
  category_id: string; // UUID of the category
  subcategory_id: string; // UUID of the subcategory
  image_url: string; // URL to the product image
  sku: string; // Optional SKU (Stock Keeping Unit)
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  category?: Category; // Parent category of the product
  subcategory?: SubCategory; // Parent subcategory of the product
  ProductUnits?: ProductUnit[]; // Array of product units (not detailed in your schema)
  SupplierPricing?: SupplierPricing[]; // Array of supplier pricing (not detailed in your schema)
  SupplierProducts?: SupplierProduct[]; // Array of supplier products (not detailed in your schema)
}

// Interfaces for related models (based on the schema, but undefined in your provided models)
export interface ProductUnit {
  product_unit_id: string; // UUID for product unit
  product_id: string; // UUID of the related product
  unit_id: string; // UUID of the related unit
  product?: Product; // Reference to the related product
  unit?: Unit; // Reference to the related unit
}
