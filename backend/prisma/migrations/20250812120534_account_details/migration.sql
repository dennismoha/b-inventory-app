/*
  Warnings:

  - The primary key for the `OpeningClosingBalance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the column `closingBalance` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the column `openingBalance` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OpeningClosingBalance` table. All the data in the column will be lost.
  - You are about to drop the `CashBankLedger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TerminalSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cash_bank_ledger_id]` on the table `OpeningClosingBalance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cash_bank_ledger_id` to the `OpeningClosingBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opening_balance` to the `OpeningClosingBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pos_session_id` to the `OpeningClosingBalance` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `OpeningClosingBalance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PREV', 'CLOSED');

-- DropForeignKey
ALTER TABLE "CashBankLedger" DROP CONSTRAINT "CashBankLedger_account_id_fkey";

-- DropForeignKey
ALTER TABLE "OpeningClosingBalance" DROP CONSTRAINT "OpeningClosingBalance_accountId_fkey";

-- DropForeignKey
ALTER TABLE "OpeningClosingBalance" DROP CONSTRAINT "OpeningClosingBalance_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "TerminalSession" DROP CONSTRAINT "TerminalSession_closedBy_fkey";

-- DropForeignKey
ALTER TABLE "TerminalSession" DROP CONSTRAINT "TerminalSession_openedBy_fkey";

-- AlterTable
ALTER TABLE "OpeningClosingBalance" DROP CONSTRAINT "OpeningClosingBalance_pkey",
DROP COLUMN "accountId",
DROP COLUMN "closingBalance",
DROP COLUMN "createdAt",
DROP COLUMN "openingBalance",
DROP COLUMN "sessionId",
DROP COLUMN "updatedAt",
ADD COLUMN     "account_collection_id" UUID,
ADD COLUMN     "cash_bank_ledger_id" UUID NOT NULL,
ADD COLUMN     "closing_balance" DECIMAL(14,2),
ADD COLUMN     "closing_date" TIMESTAMP(3),
ADD COLUMN     "opening_balance" DECIMAL(14,2) NOT NULL,
ADD COLUMN     "opening_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pos_session_id" TEXT NOT NULL,
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'PREV',
ADD COLUMN     "total_for_accounts" DECIMAL(14,2),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "OpeningClosingBalance_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "CashBankLedger";

-- DropTable
DROP TABLE "TerminalSession";

-- CreateTable
CREATE TABLE "CashBookLedger" (
    "ledger_id" TEXT NOT NULL,
    "opening_closing_balance_id" UUID NOT NULL,
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

    CONSTRAINT "CashBookLedger_pkey" PRIMARY KEY ("ledger_id")
);

-- CreateTable
CREATE TABLE "PosSession" (
    "pos_session_id" TEXT NOT NULL,
    "posId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "status" "TerminalSessionStatus" NOT NULL DEFAULT 'CLOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosSession_pkey" PRIMARY KEY ("pos_session_id")
);

-- CreateTable
CREATE TABLE "AccountCollection" (
    "collection_id" UUID NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountCollection_pkey" PRIMARY KEY ("collection_id")
);

-- CreateTable
CREATE TABLE "AccountBalanceSnapshot" (
    "snapshot_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "collection_id" UUID NOT NULL,

    CONSTRAINT "AccountBalanceSnapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpeningClosingBalance_cash_bank_ledger_id_key" ON "OpeningClosingBalance"("cash_bank_ledger_id");

-- AddForeignKey
ALTER TABLE "CashBookLedger" ADD CONSTRAINT "CashBookLedger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashBookLedger" ADD CONSTRAINT "CashBookLedger_opening_closing_balance_id_fkey" FOREIGN KEY ("opening_closing_balance_id") REFERENCES "OpeningClosingBalance"("cash_bank_ledger_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_openedBy_fkey" FOREIGN KEY ("openedBy") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningClosingBalance" ADD CONSTRAINT "OpeningClosingBalance_account_collection_id_fkey" FOREIGN KEY ("account_collection_id") REFERENCES "AccountCollection"("collection_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningClosingBalance" ADD CONSTRAINT "OpeningClosingBalance_pos_session_id_fkey" FOREIGN KEY ("pos_session_id") REFERENCES "PosSession"("pos_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalanceSnapshot" ADD CONSTRAINT "AccountBalanceSnapshot_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalanceSnapshot" ADD CONSTRAINT "AccountBalanceSnapshot_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "AccountCollection"("collection_id") ON DELETE RESTRICT ON UPDATE CASCADE;
