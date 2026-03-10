// import { Decimal } from '@prisma/client/runtime/library';

import { Customer } from '@src/features/customers/interfaces/customer.interface';
import { Inventory } from '@src/features/inventory/interfaces/inventory.interface';
import { SupplierProduct } from '@src/features/suppliers/interfaces/supplier.interface';

// Transaction Type (in interfaces/transaction.interface.ts)
// export interface Transaction {
//     transactionId: string;
//     supplierProductId : string;
//     quantity: number;
//     productName: string;
//     price: number;
//     discount: number;
//     vat: number;
//     customerId: string | null;
//     transactionDateCreated: Date;
//     totalCost: number;
//     paymentMethod: string | null;
//     subtotal: number;
//     SupplierProduct?: SupplierProduct;
//     Customer?: Customer;
//   }

// this is the structure of the transaction how it looks with the totala amounts, pyaments methods etc.
export interface Transaction {
  transactionId: string; // Transaction ID
  // customerId?: string | null; // Customer ID if applicable

  totalCost: number; // Total cost after applying discounts and VAT
  paymentMethod: string; // Payment method (e.g., card, PayPal, cash)
  subtotal: number; // Subtotal (price * quantity). total before taxes and others are added

  // Relationships
  customer?: Customer | null;

  TransactionProduct?: TransactionProduct[];
  // List of related transaction products
}

// This is the structure of the data of all items in a transaction
export type TransactionProduct = Pick<Inventory, 'inventoryId' | 'stock_quantity' | 'supplier_products_id'> & {
  quantity: number;
  productName: string;
  price: number;
  VAT: number;
  discount: number;
  transactionId: string;
  productSubTotalCost?: number;
  productTotalCost?: number;
  batch_inventory_id: string;
  needsBatchLoad: boolean;
  SupplierProduct?: SupplierProduct;
  total_stock_quantity: number; // this will come from the productSummaryStock.
};

// Assuming the types for SupplierProducts and Transaction are defined elsewhere

// export interface TransactionProduct {
//   quantity: number; // Quantity of the product
//   productName: string; // Name of the product
//   price: number; // Price of the product
//   discount: number; // Discount applied to the product
//   vat: number; // VAT applied to the product
//   transactionId: string; // ID of the related transaction
// }

// this is the structure of the data from the frontend

export interface TransactionProductItems {
  cartProducts: TransactionProduct[];
  statusTab: boolean;
  totalCost: {
    total: number;
    subtotal: number;
  };
  paymentMethod: 'CASH' | 'BANK' | 'CREDIT';
  customerId?: string;
}

export type PayableStatus = 'settled' | 'unsettled';
