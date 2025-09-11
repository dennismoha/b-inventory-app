-- CreateTable
CREATE TABLE "InventorySalesTracking" (
    "iventorysalesTrackingId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "new_stock_quantity" DECIMAL(8,2) NOT NULL,
    "old_stock_quantity" DECIMAL(8,2) NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "restock_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "softDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventorySalesTracking_pkey" PRIMARY KEY ("iventorysalesTrackingId")
);

-- AddForeignKey
ALTER TABLE "InventorySalesTracking" ADD CONSTRAINT "InventorySalesTracking_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("inventoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
