-- AlterTable
ALTER TABLE "CustomerReceivable" ADD COLUMN     "balance_due" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "total_paid" DECIMAL(12,2) NOT NULL DEFAULT 0.00;
