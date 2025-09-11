-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_batch_inventory_id_fkey" FOREIGN KEY ("batch_inventory_id") REFERENCES "BatchInventory"("batch_inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;
