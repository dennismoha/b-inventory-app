/*
  Warnings:

  - You are about to drop the column `new_balance` on the `accounts_log` table. All the data in the column will be lost.
  - You are about to drop the column `running_balance` on the `accounts_log` table. All the data in the column will be lost.
  - Added the required column `new_running_balance` to the `accounts_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `old_running_balance` to the `accounts_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts_log" DROP COLUMN "new_balance",
DROP COLUMN "running_balance",
ADD COLUMN     "new_running_balance" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "old_running_balance" DECIMAL(65,30) NOT NULL;
