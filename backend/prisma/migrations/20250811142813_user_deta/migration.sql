/*
  Warnings:

  - Added the required column `payment_type` to the `BatchPayables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TerminalSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "BatchPayables" ADD COLUMN     "balance_due" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL,
ADD COLUMN     "total_paid" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "CashBankLedger" ADD COLUMN     "TerminalSessionId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "UserLoginLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "terminalId" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutTime" TIMESTAMP(3),
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserLoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerminalSession" (
    "id" SERIAL NOT NULL,
    "terminalId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "status" "TerminalSessionStatus" NOT NULL DEFAULT 'CLOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerminalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningClosingBalance" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "accountId" UUID NOT NULL,
    "openingBalance" DECIMAL(15,2) NOT NULL,
    "closingBalance" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningClosingBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLoginLog" ADD CONSTRAINT "UserLoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminalSession" ADD CONSTRAINT "TerminalSession_openedBy_fkey" FOREIGN KEY ("openedBy") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminalSession" ADD CONSTRAINT "TerminalSession_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningClosingBalance" ADD CONSTRAINT "OpeningClosingBalance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TerminalSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningClosingBalance" ADD CONSTRAINT "OpeningClosingBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
