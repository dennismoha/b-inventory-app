/*
  Warnings:

  - You are about to drop the column `description` on the `Account` table. All the data in the column will be lost.
  - Made the column `account_number` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "description",
ALTER COLUMN "account_number" SET NOT NULL;

-- CreateTable
CREATE TABLE "JournalEntry" (
    "entry_id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "line_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "account_id" UUID NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("line_id")
);

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "JournalEntry"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;
