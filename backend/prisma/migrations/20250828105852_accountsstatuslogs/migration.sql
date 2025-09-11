/*
  Warnings:

  - Added the required column `pos_session_id` to the `account_status_log` table without a default value. This is not possible if the table is not empty.
  - Made the column `changed_by` on table `account_status_log` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "account_status_log" ADD COLUMN     "pos_session_id" TEXT NOT NULL,
ALTER COLUMN "changed_by" SET NOT NULL;
