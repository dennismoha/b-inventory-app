/*
  Warnings:

  - You are about to drop the column `available_units` on the `BatchInventory` table. All the data in the column will be lost.
  - You are about to drop the column `damaged_units` on the `BatchInventory` table. All the data in the column will be lost.
  - Added the required column `payment_method` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_status` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchInventory" DROP COLUMN "available_units",
DROP COLUMN "damaged_units",
ADD COLUMN     "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "account_id" UUID,
ADD COLUMN     "payment_date" TIMESTAMP(3),
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL,
ADD COLUMN     "payment_reference" TEXT,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL,
ADD COLUMN     "reason_for_damage" TEXT;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;
