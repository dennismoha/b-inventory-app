-- AlterTable
ALTER TABLE "AssetRegister" ADD COLUMN     "accountId" UUID;

-- AddForeignKey
ALTER TABLE "AssetRegister" ADD CONSTRAINT "AssetRegister_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;
