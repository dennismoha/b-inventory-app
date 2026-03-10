/*
  Warnings:

  - The `status` column on the `CustomerReceivable` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "customerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "CustomerReceivable" ADD COLUMN     "payment_status" "PayableStatus" NOT NULL DEFAULT 'unsettled',
DROP COLUMN "status",
ADD COLUMN     "status" "customerStatus" NOT NULL DEFAULT 'ACTIVE';
