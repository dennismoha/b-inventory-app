-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';
