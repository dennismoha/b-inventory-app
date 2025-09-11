-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INFLOW', 'OUTFLOW');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('SALE', 'PURCHASE_PAYMENT', 'EXPENSE', 'CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('cash', 'bank', 'credit_card', 'other');

-- CreateTable
CREATE TABLE "CashBankLedger" (
    "register_id" UUID NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference_type" "ReferenceType" NOT NULL,
    "reference_id" UUID,
    "balance_after" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "CashBankLedger_pkey" PRIMARY KEY ("register_id")
);

-- CreateTable
CREATE TABLE "Account" (
    "account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "description" TEXT,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("account_id")
);

-- AddForeignKey
ALTER TABLE "CashBankLedger" ADD CONSTRAINT "CashBankLedger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
