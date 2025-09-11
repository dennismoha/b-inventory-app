-- CreateTable
CREATE TABLE "account_status_log" (
    "id" TEXT NOT NULL,
    "account_id" UUID NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_status_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account_status_log" ADD CONSTRAINT "account_status_log_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;
