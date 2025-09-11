/*
  Warnings:

  - The `status` column on the `BatchInventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BatchInventoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'FINISHED', 'PENDING');

-- AlterTable
ALTER TABLE "BatchInventory" DROP COLUMN "status",
ADD COLUMN     "status" "BatchInventoryStatus" NOT NULL DEFAULT 'PENDING';
