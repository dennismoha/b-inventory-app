-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PAID', 'PENDING');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "expenseCategory" "ExpenseStatus" NOT NULL DEFAULT 'PENDING';
