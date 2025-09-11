/*
  Warnings:

  - Added the required column `supplier_products_id` to the `BatchInventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchInventory" ADD COLUMN     "supplier_products_id" UUID NOT NULL;
