/*
  Warnings:

  - Changed the type of `category` on the `AssetRegister` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('CURRENT', 'NON_CURRENT', 'OTHER');

-- AlterTable
ALTER TABLE "AssetRegister" DROP COLUMN "category",
ADD COLUMN     "category" "AssetCategory" NOT NULL;
