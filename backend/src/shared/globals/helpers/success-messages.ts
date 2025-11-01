import { Category, SubCategory } from '@src/features/categories/interfaces/categories.interface';
import { Product } from '@src/features/products/interfaces/product.interface';
import { ProductUnit } from '@src/features/products/interfaces/product.interface';
import { Unit } from '@src/features/units/interfaces/units.interface';
import { Supplier, SupplierPricing, SupplierProduct } from '@src/features/suppliers/interfaces/supplier.interface';
import { Order, OrderProducts } from '@src/features/orders/interfaces/order.interface';
import {
  Inventory,
  ProductPricing,
  InventorystockQuantityVsReorderLevel,
  InventoryRestock,
  InventoryItems,
  LowStockResponseItem,
  StockResponseItem
} from '@src/features/inventory/interfaces/inventory.interface';
import { Miscellaneous } from '@src/features/miscellaneous/interfaces/miscellaneous.interface';
import { Customer } from '@src/features/customers/interfaces/customer.interface';
import { Transaction } from '@src/features/transactions/interfaces/transaction.interface';
import { TotalSalesResponse, TransactionProductsBetweenDates } from '@src/features/analysis/interfaces/analysis.interface';
import { CustomerSales } from '@src/features/analysis/interfaces/analysis.interface';
import { Account, TrialBalance } from '@src/features/accounting/interfaces/accounts.interface';
import {
  BatchPayableResult,
  FormattedBatchInventory,
  purchaseList,
  PurchasePayable,
  PurchasePayableResponse
} from '@src/features/purchase/interface/purchase.interface';
import { CashbookLedgerRecords } from '@src/features/accounting/interfaces/cashbook-ledger.interface';
import { Asset } from '@src/features/hrm/assets/interface/assets.interface';
import { Employee } from '@src/features/hrm/employees/interfaces/employee.interface';
import { Expense } from '@src/features/expenses/interface/expenses.interface';
import {
  BalanceSheetResponse,
  CashflowStatement,
  ProfitAndLossResponse
} from '@src/features/accounting/interfaces/financial-reports.interface';
import { pos_session_header } from '@src/features/pos/interface/pos.interface';
import { AdminDashboardResponse } from '@src/features/dashboard/interfaces/dashboard.interfaces';
// Utility type to handle both singular and array types
type WithArray<T> = T | T[];

// success_data type using WithArray
type success_data =
  | WithArray<Miscellaneous>
  | WithArray<Inventory>
  | WithArray<Order>
  | WithArray<OrderProducts>
  | WithArray<SupplierPricing>
  | WithArray<SupplierProduct>
  | WithArray<Supplier>
  | WithArray<Unit>
  | WithArray<Category>
  | WithArray<SubCategory>
  | WithArray<Product>
  | WithArray<ProductUnit>
  | WithArray<ProductPricing>
  | WithArray<Customer>
  | WithArray<Transaction>
  | WithArray<InventorystockQuantityVsReorderLevel>
  | WithArray<TotalSalesResponse>
  | WithArray<TransactionProductsBetweenDates>
  | WithArray<CustomerSales>
  | WithArray<InventoryRestock>
  | WithArray<Account>
  | WithArray<BatchPayableResult>
  | WithArray<FormattedBatchInventory>
  | WithArray<CashbookLedgerRecords>
  | WithArray<InventoryItems>
  | WithArray<Asset>
  | WithArray<Employee>
  | WithArray<Expense>
  | WithArray<ProfitAndLossResponse>
  | WithArray<BalanceSheetResponse>
  | WithArray<CashflowStatement>
  | WithArray<LowStockResponseItem>
  | WithArray<StockResponseItem>
  | WithArray<TrialBalance>
  | WithArray<pos_session_header>
  | WithArray<PurchasePayable>
  | WithArray<PurchasePayableResponse>
  | WithArray<AdminDashboardResponse>
  | WithArray<purchaseList[]>
  | null;

// GetSuccessMessage function
export default function GetSuccessMessage(statusCode: number, data: success_data, statusMessage: string) {
  return {
    statusCode: statusCode || 200, // Default to 200 if statusCode is not provided
    data: data || [], // Default to empty array if data is not provided (no null data allowed)
    status: statusMessage || 'Success' // Default to 'Success' if statusMessage is not provided
  };
}

// type success_data =
//     | Order
//     | OrderProducts
//     | SupplierPricing
//     | SupplierPricing[]
//     | SupplierProduct
//     | SupplierProduct[]
//     | Supplier
//     | Supplier[]
//     | Unit
//     | Unit[]
//     | Category
//     | Category[]
//     | SubCategory[]
//     | Product[]
//     | Product
//     | ProductUnit
//     | ProductUnit[]
//     | [];

// export default function GetSuccessMessage(statusCode: number, data: success_data, statusMessage: string) {
//     return {
//         statusCode: statusCode || 200, // Default to 200 if statusCode is not provided
//         data: data || null, // Default to null if data is not provided
//         status: statusMessage || 'Success' // Default to 'Success' if statusMessage is not provided
//     };
// }
