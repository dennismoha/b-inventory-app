/*
  Warnings:

  - You are about to drop the column `balance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `current_balance` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "balance",
DROP COLUMN "current_balance",
ADD COLUMN     "opening_balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "running_balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "CashBookLedger" ALTER COLUMN "balance_after" DROP NOT NULL;

-- CreateTable
CREATE TABLE "account_session_log" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "opening_balance" DECIMAL(65,30) NOT NULL,
    "closing_balance" DECIMAL(65,30) NOT NULL,
    "pos_session" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_session_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_log" (
    "accounts_log_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "opening_balance" DECIMAL(65,30) NOT NULL,
    "running_balance" DECIMAL(65,30) NOT NULL,
    "new_balance" DECIMAL(65,30) NOT NULL,
    "pos_session_id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_log_pkey" PRIMARY KEY ("accounts_log_id")
);
