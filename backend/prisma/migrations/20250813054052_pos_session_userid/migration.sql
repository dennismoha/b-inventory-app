-- DropForeignKey
ALTER TABLE "PosSession" DROP CONSTRAINT "PosSession_openedBy_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "current_balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00;

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_openedBy_fkey" FOREIGN KEY ("openedBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
