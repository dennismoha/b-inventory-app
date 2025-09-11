/*
  Warnings:

  - A unique constraint covering the columns `[batch_name]` on the table `BatchInventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_name` to the `BatchInventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchInventory" ADD COLUMN     "batch_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BatchInventory_batch_name_key" ON "BatchInventory"("batch_name");
