-- CreateTable
CREATE TABLE "UserLoginAttempt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptTime" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "UserLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLoginAttempt" ADD CONSTRAINT "UserLoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
