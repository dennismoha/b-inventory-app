-- DropForeignKey
ALTER TABLE "PosSession" DROP CONSTRAINT "PosSession_closedBy_fkey";

-- DropForeignKey
ALTER TABLE "PosSession" DROP CONSTRAINT "PosSession_openedBy_fkey";

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_openedBy_fkey" FOREIGN KEY ("openedBy") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
