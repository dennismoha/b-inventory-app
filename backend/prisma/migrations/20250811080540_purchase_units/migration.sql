/*
  Warnings:

  - You are about to drop the column `units` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `damaged_units` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `undamaged_units` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "units",
ADD COLUMN     "damaged_units" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "undamaged_units" INTEGER NOT NULL,
ADD COLUMN     "unit_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
