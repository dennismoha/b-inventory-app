/*
  Warnings:

  - Added the required column `paymentMethod` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'TRAVEL', 'MARKETING', 'OTHER', 'TRANSPORT');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "referenceNo" TEXT,
ADD COLUMN     "vendor" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "ExpenseCategory" NOT NULL;
