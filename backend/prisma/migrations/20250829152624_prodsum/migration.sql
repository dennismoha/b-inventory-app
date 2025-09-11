/*
  Warnings:

  - A unique constraint covering the columns `[supplier_products_id]` on the table `ProductSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductSummary_supplier_products_id_key" ON "ProductSummary"("supplier_products_id");
