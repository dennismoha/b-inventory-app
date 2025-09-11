-- DropForeignKey
ALTER TABLE "PosSession" DROP CONSTRAINT "PosSession_closedBy_fkey";

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
