/*
  Warnings:

  - The primary key for the `InventorySalesTracking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `iventorysalesTrackingId` on the `InventorySalesTracking` table. All the data in the column will be lost.
  - The required column `inventorysalesTrackingId` was added to the `InventorySalesTracking` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "InventorySalesTracking" DROP CONSTRAINT "InventorySalesTracking_pkey",
DROP COLUMN "iventorysalesTrackingId",
ADD COLUMN     "inventorysalesTrackingId" TEXT NOT NULL,
ADD CONSTRAINT "InventorySalesTracking_pkey" PRIMARY KEY ("inventorysalesTrackingId");
