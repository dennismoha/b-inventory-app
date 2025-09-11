/*
  Warnings:

  - You are about to drop the `TransactionProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TransactionProduct" DROP CONSTRAINT "TransactionProduct_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionProduct" DROP CONSTRAINT "TransactionProduct_supplier_products_id_fkey";

-- DropForeignKey
ALTER TABLE "TransactionProduct" DROP CONSTRAINT "TransactionProduct_transactionId_fkey";

-- DropTable
DROP TABLE "TransactionProduct";

-- CreateTable
CREATE TABLE "Sales" (
    "SalesId" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "stock_quantity" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "VAT" DOUBLE PRECISION NOT NULL,
    "productSubTotalCost" DOUBLE PRECISION NOT NULL,
    "productTotalCost" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "BatchInventoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("SalesId")
);

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("inventoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
