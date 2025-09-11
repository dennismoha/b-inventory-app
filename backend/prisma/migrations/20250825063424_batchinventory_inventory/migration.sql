/*
  Warnings:

  - You are about to drop the column `last_restocked` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `product_weight` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `reorder_level` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[batch_inventory_id]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[batch_inventory_id,status]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_inventory_id` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryRestock" DROP CONSTRAINT "InventoryRestock_inventory_Id_fkey";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "last_restocked",
DROP COLUMN "product_weight",
DROP COLUMN "reorder_level",
ADD COLUMN     "batch_inventory_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_batch_inventory_id_key" ON "Inventory"("batch_inventory_id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_batch_inventory_id_status_key" ON "Inventory"("batch_inventory_id", "status");

-- AddForeignKey
ALTER TABLE "BatchInventory" ADD CONSTRAINT "BatchInventory_batch_inventory_id_fkey" FOREIGN KEY ("batch_inventory_id") REFERENCES "Inventory"("batch_inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;
