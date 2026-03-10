import type {
  AccountStatus,
  AccountType,
  InventoryStatus,
  PayableStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  ReferenceType,
  TransactionType
} from './enums';

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
  // ProductUnits?: ProductUnit[]; // Array of product units (not detailed in your schema)
  // SupplierPricing?: SupplierPricing[]; // Array of supplier pricing (not detailed in your schema)
  // SupplierProducts?: SupplierProduct[]; // Array of supplier products (not detailed in your schema)
}

export interface ProductApiResponse {
  statusCode: number;
  data: Product[];
  status: string;
}

export interface PurchaseEditPayload {
  field: Partial<CreatePurchaseRequest>;
  value: string;
  purchase_id: string;
  batch: string;
}

export interface NewProductPayload {
  name: string;
  description: string;
  category_id: string; // UUID of the category
  subcategory_id: string; // UUID of the subcategory
  image_url: string; // URL to the product image
  sku: string; // Optional SKU (Stock Keeping Unit)
}

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

// State structure for Categories in Redux
export interface CategoryState {
  categories: Category[];
}

export interface CategoryResponse {
  status: string;
  statusCode: string;
  data: Category[];
}

export interface SubCategoryApiResponse {
  statusCode: number;
  data: SubCategory[];
  status: string;
}

/****
 *
 * This is the supplier interface
 *
 */

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

export interface SupplierPricing {
  supplier_pricing: string; // UUID for supplier pricing
  supplier_id: string; // UUID of the supplier
  product_id: string; // UUID of the product
  unit_id: string; // UUID of the unit
  price: number; // number price (number type in JS)
  effective_date: Date; // Date when the price is effective (ISO 8601 date)
  supplierProduct: SupplierProduct;
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  supplier?: Supplier; // Reference to the supplier
  product?: Product; // Reference to the product
  unit?: Unit; // Reference to the unit
}

export interface SupplierProduct {
  supplier_products_id: string; // UUID for supplier product
  supplier_id: string; // UUID of the supplier
  product_id: string; // UUID of the product
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
  supplier: Supplier; // Reference to the supplier
  product: Product; // Reference to the product
  Inventory: InventoryItem;
  ProductPricing?: ProductPricing;
}

export interface SupplierProductsApiResponse {
  statusCode: number;
  data: SupplierProduct[];
  status: string;
}

export interface SuppplierApiResponse {
  statusCode: number;
  data: Supplier[];
  status: string;
}

export interface NewSupplierProductPayload {
  supplier_id: string;
  product_id: string;
}

export interface SupplierPricingResponse {
  status: string;
  data: SupplierPricing[];
  statusCode: number;
}

export type SupplierPricingPayload = Pick<SupplierProduct, 'supplier_products_id'> &
  Pick<SupplierPricing, 'unit_id' | 'effective_date' | 'price'> & {
    Quantity: number;
  };
/***
 * This is the unit type section
 *
 */

// units
export interface Unit {
  unit_id: string; // UUID for the unit
  unit: string; // Name of the unit (e.g., 'kg', 'piece', 'liter')
  short_name: string; // Symbol for the unit (e.g., 'kg', 'pcs', 'L')
  no_of_products: number;
  created_at: Date; // ISO 8601 DateTime string
  updated_at: Date; // ISO 8601 DateTime string
}

export interface UnitApiResponse {
  statusCode: number;
  data: Unit[];
  status: string;
}

export interface UnitBodyPayload {
  unit_id: string; // UUID for the unit
  unit: string; // Name of the unit (e.g., 'kg', 'piece', 'liter')
  short_name: string; // Symbol for the unit (e.g., 'kg', 'pcs', 'L')
  no_of_products: number;
}

/***
 *  This is the inventory types
 */

export interface InventoryItem {
  inventoryId: string; // Unique identifier for the inventory
  supplier_products_id: string; // Reference to the supplier's product
  product_weight: number;
  stock_quantity: number; // Quantity of the product in stock
  reorder_level: number; // The level at which new stock should be ordered
  last_restocked: Date; // Date when the item was last restocked
  unit_id: string; // Unit of measure (e.g., kg, g, etc.)
  created_at: Date; // Timestamp of when the record was created
  updated_at: Date; // Timestamp of the last update to the record
  softDelete: boolean; // Flag indicating if the item is logically deleted
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'; // Status of the item (ACTIVE, INACTIVE, DISCONTINUED)

  // Relations
  TransactionProduct: TransactionProduct[];
  supplierProduct: SupplierProduct; // Reference to the supplier product record
  InventoryRestock?: InventoryRestock[];
  InventorySalesTracking?: InventorySalesTracking[];
  unit: Unit; // Reference to the unit of measurement
}

export type InventoryItems = {
  inventoryId: string;
  supplier_products_id: string;
  batch_inventory_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  stock_quantity: number;
  unit_id: string;
  unit_short_name: string;
  name: string; // supplier + product name
  supplier_name: string;
  product_pricing_id?: string;
  Quantity?: number;
  pricing_unit_id?: string;
  price?: number;
  VAT?: number;
  discount?: number;
  effective_date?: string;
  total_stock_quantity: number;
};

export interface InventoryItemsApiResponse {
  statusCode: number;
  data: InventoryItems[];
  status: string;
}

export interface ProductPricing {
  product_pricing_id: string;
  supplier_products_id: string;
  Quantity: number;
  unit_id: string;
  discount: number;
  VAT: number;
  price: number;
  effective_date: Date;
  created_at: Date;
  updated_at: Date;
  supplierProduct?: SupplierProduct; // Relation to SupplierProducts model
  unit?: Unit; // Relation to Units model
}

export type NewProductPricingPayload = Pick<ProductPricing, 'supplier_products_id' | 'Quantity' | 'unit_id' | 'price' | 'effective_date'>;

export type NewInventoryItemPayload = Pick<InventoryItem, 'supplier_products_id' | 'stock_quantity' | 'unit_id'>;

export interface InventoryRestock {
  inventoryRestockId: string;
  inventoryId: string; // UUID for the inventory item
  new_stock_quantity: number; // The new stock quantity after restocking (number type)
  old_stock_quantity: number; // The stock quantity before restocking (number type)
  reorder_level: number; // Reorder level indicating when to reorder stock
  restock_date: Date; // The date when the restocking occurred (DateTime)
  softDelete: boolean; // Flag indicating whether the record is soft deleted (boolean)
  InventoryItemID?: InventoryItem; //  Inventory relation (InventoryItemID is a reference to `inventoryId`)
}

export interface InventorySalesTracking {
  inventorysalesTrackingId: string;
  inventoryId: string;
  new_stock_quantity: number;
  /**
   * The quantity of stock that existed before the restock.
   */
  old_stock_quantity: number;
  /**
   * The level at which the item needs to be reordered.
   */
  reorder_level: number;
  /**
   * The date when the item was restocked.
   */
  restock_date: Date;
  softDelete: boolean;
  InventoryItemID?: InventoryItem; // Assuming Inventory model is defined elsewhere
}

/***
 *  This is the transaction product template
 */

export interface Transaction {
  transactionId: string; // Transaction ID
  // customerId?: string | null; // Customer ID if applicable

  totalCost: number; // Total cost after applying discounts and VAT
  paymentMethod: string; // Payment method (e.g., card, PayPal, cash)
  subtotal: number; // Subtotal (price * quantity). total before taxes and others are added
  productSubTotalCost: number;
  productTotalCost?: number;
  // Relationships
  customer: Customer | null;
  transactionDateCreated: Date;

  Sales: TransactionProduct[];
  // List of related transaction products
}

// This is the structure of the data of all items in a transaction
export type TransactionProduct = Pick<InventoryItem, 'inventoryId' | 'stock_quantity' | 'supplier_products_id'> & {
  quantity: number;
  productName: string;
  price: number;
  VAT: number;
  discount: number;
  transactionId: string;
  createdAt: string;
  supplierProduct?: SupplierProduct;
  productSubTotalCost?: number;
  productTotalCost?: number;
};

// this is the structure of the data from the frontend

export interface TransactionProductItems {
  cartProducts: TransactionProduct[];
  statusTab: boolean;
  totalCost: {
    total: number;
    subtotal: number;
  };
  paymentMethod: 'cash' | 'bank' | 'credit';
  customerId?: string;
}

export interface NewTransactionPayload {
  statusCode: number;
  data: Transaction[];
  status: string;
}

/***
 * This is the customer interface
 */

export interface Customer {
  customerId: string;
  firstName: string; // Customer's first name
  lastName: string; // Customer's last name
  email: string;
  phoneNumber: string;
  address: string | null; // Optional: Customer's address

  country: string | null; // Optional: Customer's country
  createdAt: Date;
  updatedAt: Date;
  status: string; // Customer status: "active", "inactive", etc.
  loyaltyPoints: number;
  totalSpent: number;

  notes: string | null; // Optional: Any special notes or preferences about the customer
  preferredPaymentMethod: string | null; // Optional: Preferred payment method (e.g., Credit card, PayPal)
}

// used in the customer insights

export interface NewCustomerPayload {
  statusCode: number;
  data: Customer[];
  status: string;
}

export interface CustomerTotalSalesInterface {
  supplier_products_id: string;
  supplierProduct: string;
  products: string;
  totalSales: number;
}

export type GetTransactionDateData = Transaction;

// Current user types

export interface CurrentUserType {
  isUser: boolean;
  token: string | null;
  user: {
    email: string;
    username: string;
    role: string;
  } | null;
}

// purchases

export interface CreatePurchaseRequest {
  batch: string;
  supplier_products_id: string; // UUID
  quantity: number;
  damaged_units: number;
  reason_for_damage: string | null;
  unit_id: string; // UUID
  purchase_cost_per_unit: number;
  total_purchase_cost: number;
  discounts: number;
  tax: number;
  payment_type: PaymentType;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_date?: Date | null; // ISO date
  account_id?: string | null; // UUID
  payment_reference: string | null;
  arrival_date: Date; // ISO date
}

export type deleteMessage = {
  message: string;
  statusCode: number | string | null;
  status: string;
};

export type purchaseList = CreatePurchaseRequest & {
  purchase_id: string;
};

export type PurchasePayableResponse = {
  balance_due: number;
};

export type purchasePayable = {
  amount: string;
  account_id: string;
  purchase_id: string;
};

export interface PartialPurchasePayment {
  partial_purchase_id: string;
  purchase_id: string;
  full_amount: string;
  initial_payment: string;
  balance: string;
  payment_method: PaymentMethod;
  payment_date: string;
  created_at: Date;

  // Relations
  Purchase?: CreatePurchaseRequest;
  Logs?: PartialPaymentLog[];
}

export interface PartialPaymentLog {
  id: string;
  partial_payment_id: string;
  initial_payment: string;
  amount_paid: string;
  payment_date: string;
  payment_method: PaymentMethod;

  // Relation
  PartialPayment?: PartialPurchasePayment;
}

export interface PurchaseExpense {
  expense_id: string;
  purchase_id: string;
  supplier_products_id: string;
  expense_type: string;
  amount: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface PurchaseDamage {
  damage_id: string;
  purchase_id: string;
  quantity: number;
  reason: string;
  damage_date: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface BatchInventory {
  batch_inventory_id: string;
  purchase_id: string;
  total_units: number;
  status: InventoryStatus;
  updated_at: Date;
  created_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface BatchPayables {
  payable_id: string;
  purchase_id: string;
  amount_due: string;
  total_paid: string;
  status: PayableStatus;
  payment_type: PaymentType;
  balance_due: string;
  settlement_date?: string | null;
  created_at: Date;
  updated_at: Date;

  batchpayable?: CreatePurchaseRequest;
}

export interface CashBookLedger {
  ledger_id: string;
  opening_closing_balance_id: string;
  transaction_date: Date;
  transaction_type: TransactionType;
  amount: string;
  method: PaymentMethod;
  reference_type: ReferenceType;
  reference_id?: string;
  balance_after: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;

  // Relations
  account_id: string;
  CashBookLedgers_?: Account | undefined;
  openingClosingBalance?: OpeningClosingBalance;
}

export type journalLines = {
  line_id: string;
  entry_id: string;
  account_id: string;
  debit: string;
  credit: string;
};
export interface Account {
  account_id: string;
  name: string;
  account_number?: string | null;
  type: AccountType;
  description?: string | null;
  balance: string;
  running_balance: string;
  deleted: boolean;
  account_status: AccountStatus;
  created_at: Date;
  updated_at: Date;
  journalLines?: journalLines[];

  // Relations
  Purchase?: CreatePurchaseRequest[];
  CashBookLedgers?: CashBookLedger[];
  AccountBalances?: AccountBalanceSnapshot[];
  AccountStatusLog?: AccountStatusLog[];
}

export type TrialBalance = {
  totalDebit: number;
  totalCredit: number;
  trialBalance: {
    name: string;
    account_type: AccountType;
    debit: number;
    credit: number;
  }[];
};

export interface AccountStatusLog {
  id: string;
  account_id: string;
  old_status: string;
  new_status: string;
  changed_by?: string | null;
  changed_at: string;

  // Relations
  account?: Account;
}

// Accounts

export interface PartialPurchasePayment {
  partial_purchase_id: string;
  purchase_id: string;
  full_amount: string;
  initial_payment: string;
  balance: string;
  payment_method: PaymentMethod;
  payment_date: string;
  created_at: Date;

  // Relations
  Purchase?: CreatePurchaseRequest;
  Logs?: PartialPaymentLog[];
}

export interface PartialPaymentLog {
  id: string;
  partial_payment_id: string;
  initial_payment: string;
  amount_paid: string;
  payment_date: string;
  payment_method: PaymentMethod;

  // Relation
  PartialPayment?: PartialPurchasePayment;
}

export interface PurchaseExpense {
  expense_id: string;
  purchase_id: string;
  supplier_products_id: string;
  expense_type: string;
  amount: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface PurchaseDamage {
  damage_id: string;
  purchase_id: string;
  quantity: number;
  reason: string;
  damage_date: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface BatchInventory {
  batch_inventory_id: string;
  purchase_id: string;
  total_units: number;
  status: InventoryStatus;
  updated_at: Date;
  created_at: Date;

  // Relations
  purchase?: CreatePurchaseRequest;
}

export interface BatchPayables {
  payable_id: string;
  purchase_id: string;
  amount_due: string;
  total_paid: string;
  status: PayableStatus;
  payment_type: PaymentType;
  balance_due: string;
  settlement_date?: string | null;
  created_at: Date;
  updated_at: Date;

  batchpayable?: CreatePurchaseRequest;
}

export interface CashBookLedger {
  ledger_id: string;
  opening_closing_balance_id: string;
  transaction_date: Date;
  transaction_type: TransactionType;
  amount: string;
  method: PaymentMethod;
  reference_type: ReferenceType;
  reference_id?: string;
  balance_after: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;

  // Relations
  account_id: string;
  CashBookLedgers_?: Account;
  openingClosingBalance?: OpeningClosingBalance;
}

export interface Account {
  account_id: string;
  name: string;
  account_number?: string | null;
  type: AccountType;
  description?: string | null;
  balance: string;
  current_balance: string;
  deleted: boolean;
  account_status: AccountStatus;
  created_at: Date;
  updated_at: Date;

  // Relations
  Purchase?: CreatePurchaseRequest[];
  CashBookLedgers?: CashBookLedger[];
  AccountBalances?: AccountBalanceSnapshot[];
  AccountStatusLog?: AccountStatusLog[];
}

export interface AccountStatusLog {
  id: string;
  account_id: string;
  old_status: string;
  new_status: string;
  changed_by?: string | null;
  changed_at: string;

  // Relations
  account?: Account;
}

// =====================
// ENUMS
// =====================
export enum SessionStatus {
  PREV = 'PREV',
  CLOSED = 'CLOSED'
}

export enum TerminalSessionStatus {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN' // If you have this in schema (assuming)
}

export enum UserRoles {
  admin = 'admin',
  user = 'user'
}

// =====================
// MODELS
// =====================

export interface OpeningClosingBalance {
  id: string;
  pos_session_id: string;
  cash_bank_ledger_id: string;
  opening_date: Date;
  closing_date: Date | null;
  status: SessionStatus;
  opening_balance: string; // number as string
  closing_balance?: string; // number as string | undefined
  total_for_accounts?: string; // number as string | undefined

  account_collection_id?: string;
  accountCollection?: AccountCollection;
  cashBankLedgers?: CashBookLedger[];
  session: PosSession;
}

export interface PosSession {
  pos_session_id: string;
  posId: string;
  openedBy: string;
  openedAt: Date;
  closedBy?: string;
  closedAt?: Date;
  status: TerminalSessionStatus;
  createdAt: Date;

  openedUser: User;
  closedUser?: User;
  balances: OpeningClosingBalance[];
}

export interface UserLoginAttempt {
  id: number;
  userId: string;
  attemptTime: Date;
  ipAddress: string;
  userAgent: string;
  status: string; // e.g. 'FAILED_ACTIVE_SESSION', 'WRONG_PASSWORD'
  user: User;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string;
  role: UserRoles;
  createdAt: Date;
  updatedAt: Date;

  UserLoginLog: UserLoginLog[];
  userLoginAttempt: UserLoginAttempt[];
  PosSessionOpened: PosSession[];
  PosSessionClosed: PosSession[];
}

export interface UserLoginLog {
  id: string;
  userId: string;
  loginTime: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface AccountCollection {
  collection_id: string;
  snapshot_date: Date;
  accounts: AccountBalanceSnapshot[];
  created_at: Date;
  updated_at: Date;
  openingClosingBalances: OpeningClosingBalance[];
}

// =====================
// Already defined earlier
// CashBookLedger, AccountBalanceSnapshot, etc.
// =====================
export interface CashBookLedger {
  ledger_id: string;
  opening_closing_balance_id: string;
  transaction_date: Date;
  transaction_type: TransactionType;
  amount: string; // number
  method: PaymentMethod;
  reference_type: ReferenceType;
  reference_id?: string;
  balance_after: string; // number
  description?: string | null;
  created_at: Date;
  updated_at: Date;

  account_id: string;
  CashBookLedgers: Account;
  openingClosingBalance?: OpeningClosingBalance;
}

export interface AccountBalanceSnapshot {
  id: string;
  account_id: string;
  balance: string; // number
  snapshot_date: Date;
  account: Account;
}

export type BatchPayableResult = {
  payable_id: string;
  purchase_id: string;
  amount_due: number;
  total_paid: number;
  balance_due: number;
  payment_type: string;
  settlement_date: Date;
  batch: string;
  supplier_name: string;
  product_name: string;
};

export type FormattedBatchInventory = {
  batchInventory: string;
  purchaseId: string;
  totalUnits: number;
  status: string;
  createdAt: Date;
  damaged_units: number | null;
  batch: string;
  payment_status: string;
  supplierName: string;
  productName: string;
};

// cashbook lefger records from fetch

type UUID = string;
type ISODate = string | Date;

type Status = 'CLOSED' | 'PREV' | string;

export type CashBookLedgerEntry = {
  transaction_date: ISODate;
  transaction_type: 'INFLOW' | 'OUTFLOW';

  amount: number;
  method: string;
  // description: string | null;
  account_name: string | undefined;
} & Pick<CashBookLedger, 'description'> &
  Pick<Account, 'running_balance'>;

export interface CashBookLedgers {
  inflows: CashBookLedgerEntry[];
  outflows: CashBookLedgerEntry[];
  total_inflows: number;
  total_outflows: number;
  net_balance: number;
}

export type CashbookLedgerRecords = {
  id?: UUID;
  pos_session_id: UUID;
  cash_bank_ledger_id?: UUID;

  opening_date: ISODate;
  closing_date: ISODate | null;

  status: Status;

  cashBookLedgers: CashBookLedgers;
} & Pick<OpeningClosingBalance, 'account_collection_id' | 'closing_balance' | 'total_for_accounts'>;

// end of cashbook ledger records

// Assets interface

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  description?: string;
  purchaseDate: Date;
  purchaseCost: number;
  supplier?: string;
  location?: string;
  status: string;
  depreciation?: number;
  usefulLifeYears?: number;
  custodianId?: string;
  custodian?: Employee | null;
  createdAt: Date;
  updatedAt: Date;
}

// Employee interface
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  assets?: Asset[]; // optionally include assets if you fetch with relations
}

export type NewEmployeePayload = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'assets'>;

// export interface EmployeesApiResponse {
//   statusCode: number;
//   message: string;
//   data: Employee[] | Employee | null;
// }

export type NewAssetPayload = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export interface AssetsApiResponse {
  statusCode: number;
  message: string;
  data: Asset[] | Asset | null;
}

// Expenses
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: Date;
  purchaseId: string | null;
  batch: string | null;
  isGeneral: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewExpensePayload = {
  description: string;
  amount: number;
  category: string;
  expenseDate: Date | null;
  accountId: string;
  paymentMethod: string;
  purchaseId?: string | null;
  batch?: string | null;
  referenceNo: string;
  vendor: string;
  isGeneral: boolean;
};
export interface ExpensesApiResponse {
  statusCode: number;
  message: string;
  data: Expense[] | Expense | null;
}

// Reports

export interface BalanceSheetResponse {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  totals: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
}

export interface ProfitAndLossResponse {
  incomeAccounts: Account[];
  expenseAccounts: Account[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

// cashflow
export interface CashflowSection {
  inflow: number;
  outflow: number;
  net: number;
}

// Totals type
export interface CashflowTotals {
  netCashflow: number;
}

// Full Cashflow Statement type
export interface CashflowStatement {
  operating: CashflowSection;
  investing: CashflowSection;
  financing: CashflowSection;
  totals: CashflowTotals;
}

// product purchase stock summary
export interface LowStockResponseItem {
  supplier_products_id: string;
  total_received: number;
  total_sold: number;
  reorder_level: number;
  total_cost_value: number;
  product_name: string;
  supplier_name: string;
}

export interface StockResponseItem {
  supplier_products_id: string;
  total_received: number;
  total_sold: number;
  reorder_level: number;
  total_cost_value_as_per_suppliers: number; // Prisma number -> string
  current_in_stock: number;
  product_name: string;
  supplier_name: string;
  total_cost_value_in_our_stock_price: number;

  pricing_per_unit?: number;

  // flattened supplier pricing fields
  unit_quantity?: number | null;
  units?: string;

  effectiveData: Date | null;

  // derived
  remaining: number;
}

export type pos_session_header = { pos_session_id: string };

export interface TransactionProductsBetweenDates {
  totalSales: number;
  transactions: Transaction[];
}

// custome sales report
export interface CustomerSalesResponse {
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  totalSales: CustomerProductSales[];
  transactionDate: Transaction[];
}

export interface CustomerProductSales {
  supplier_products_id: string;
  supplierProduct: string;
  products: string;
  totalSales: number;
}
