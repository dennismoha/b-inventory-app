import { Transaction } from '@src/features/transactions/interfaces/transaction.interface';

export type TotalSalesResponse = number;
export interface PrismaTransactionProductAggregate {
  _sum: {
    productTotalCost: number | null; // The sum could be null if no data matches
  };
}

export interface TotalSalesType {
  _sum: {
    productTotalCost: number | null; // The total cost of all products sold
  };
}

export interface SupplierSales {
  supplier_products_id: string;
  supplierProduct: string;
  products: string;
  totalSales: number;
}

export interface CustomerSales {
  customerId: string;
  firstName: string;
  lastName: string;
  totalSales: SupplierSales[];
}
export interface TransactionProductsBetweenDates {
  totalSales: number;
  transactions: Transaction[];
}
