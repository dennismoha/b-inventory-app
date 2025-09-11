/*
  Warnings:

  - The `old_status` column on the `account_status_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `new_status` on the `account_status_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'CREATED';

-- AlterTable
ALTER TABLE "account_status_log" DROP COLUMN "old_status",
ADD COLUMN     "old_status" "AccountStatus",
DROP COLUMN "new_status",
ADD COLUMN     "new_status" "AccountStatus" NOT NULL;
