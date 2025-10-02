/*
  Warnings:

  - You are about to drop the column `expenseCategory` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "expenseCategory",
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING';
