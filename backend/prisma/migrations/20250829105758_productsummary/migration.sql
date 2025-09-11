-- CreateTable
CREATE TABLE "ProductSummary" (
    "product_summary_id" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "total_received" INTEGER NOT NULL DEFAULT 0,
    "total_sold" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "total_cost_value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ProductSummary_pkey" PRIMARY KEY ("product_summary_id")
);

-- AddForeignKey
ALTER TABLE "ProductSummary" ADD CONSTRAINT "ProductSummary_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;
