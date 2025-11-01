-- DropForeignKey
ALTER TABLE "BatchInventory" DROP CONSTRAINT "BatchInventory_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseDamage" DROP CONSTRAINT "PurchaseDamage_purchase_id_fkey";

-- AddForeignKey
ALTER TABLE "PurchaseDamage" ADD CONSTRAINT "PurchaseDamage_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchInventory" ADD CONSTRAINT "BatchInventory_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE CASCADE ON UPDATE CASCADE;
