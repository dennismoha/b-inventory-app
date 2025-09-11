import { Decimal } from '@prisma/client/runtime/library';
import { Product } from '@src/features/products/interfaces/product.interface';
import { Unit } from '@src/features/units/interfaces/units.interface';
// Interface for Suppliers
export interface Supplier {
  supplier_id: string; // UUID for supplier
  name: string; // Supplier name (unique)
  address: string; // Supplier address
  contact: string; // Supplier contact information
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  SupplierProducts?: SupplierProduct[]; // Array of SupplierProducts
  SupplierPricing?: SupplierPricing[]; // Array of SupplierPricing
}

// Interface for SupplierPricing
export interface SupplierPricing {
  supplier_pricing: string; // UUID for supplier pricing
  supplier_products_id: string;
  Quantity: Decimal;
  unit_id: string; // UUID of the unit
  price: Decimal; // Decimal price (usually represented as number in JS)
  effective_date: Date; // Date when the price is effective (ISO 8601 date)
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  supplier?: Supplier; // Reference to the supplier
  product?: Product; // Reference to the product
  unit?: Unit; // Reference to the unit
}

// Interface for SupplierProducts
export interface SupplierProduct {
  supplier_products_id: string; // UUID for supplier product
  supplier_id: string; // UUID of the supplier
  product_id: string; // UUID of the product
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  supplier?: Supplier; // Reference to the supplier
  product?: Product; // Reference to the product
}
