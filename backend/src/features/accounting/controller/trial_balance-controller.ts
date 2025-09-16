/** First: What a Trial Balance Is

It’s simply a report that lists every account with its total Debit or Credit balance.

At the bottom:
 * 
 so we need two columns: debits and credits

 so this is what we have so far that we can use to make a trial balance. i beleive this is not enough
 custom
 model Account {
  account_id      String        @id @default(uuid()) @db.Uuid
  name            String
  account_number  String?       @unique
  type            AccountType
  description     String?
  opening_balance         Decimal       @default(0.00) @db.Decimal(14, 2)
  running_balance Decimal
}

model AssetRegister {
  id              String   @id @default(uuid())
  assetTag        String   @unique
  name            String
  category        String
  description     String?
  purchaseDate    DateTime
  purchaseCost    Float
  supplier        String?
  location        String?
  status          String   @default("active") // active, under_maintenance, disposed
  depreciation    Float?
  usefulLifeYears Int?
}

model BatchPayables {
  payable_id      String        @id @default(uuid()) @db.Uuid
  purchase_id     String        @unique @db.Uuid
  amount_due      Decimal       @db.Decimal(12, 2)
  total_paid      Decimal  

  |  enum PayableStatus {
  settled
  unsettled
}


model Expense {
  id              String    @id @default(uuid())
  description     String
  amount          Float
  category        String    // e.g., "Transport", "Import Duty", "General", etc.
  expenseDate     DateTime  @default(now())

  // Link to Purchase (optional)
  purchaseId      String?   @db.Uuid
  purcha
}

model Sales {
  SalesId String           @id @default(uuid())
  supplier_products_id String           @db.Uuid
  inventoryId          String
  // unit String
  stock_quantity       Decimal
  quantity             Int
  productName          String
  price                Float
  discount             Float
  VAT                  Float
  // totalCost       Float
  productSubTotalCost  Float
  productTotalCost     Float
  transactionId        String

}

model CustomerReceivable {
  customer_receivable_id              String   @id @default(cuid())
  customer_id     String   
  total_Amount Decimal
  transaction_id String  @unique
  status          AccountStatus @default(ACTIVE)

  // Relations
  customer        Customer           @relation(fields: [customer_id], references: [customerId])
  Transactions    Transaction     @relation(fields: [transaction_id], references: [transactionId])
}


model CashBookLedger {
  ledger_id                  String          @id @default(uuid())
  opening_closing_balance_id String          @db.Uuid
  transaction_date           DateTime        @default(now())
  transaction_type           TransactionType
  amount                     Decimal         @db.Decimal(12, 2)
  method                     PaymentMethod
  reference_type             ReferenceType
  reference_id               String?         @db.Uuid // Can be null if no specific reference
  balance_after   
} enum TransactionType {
  INFLOW
  OUTFLOW
}
enum PaymentMethod {
  cash
  bank
  credit
}
enum ReferenceType {
  SALE
  PURCHASE_PAYMENT
  EXPENSE
  CUSTOMER_PAYMENT
  SUPPLIER_PAYMENT
  ACCOUNT_TOPUP
}


i tend to believe there has to be ore features of the company


 * 
 */
