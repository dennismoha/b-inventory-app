-- CreateTable
CREATE TABLE "CustomerReceivable" (
    "customer_receivable_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "total_Amount" DECIMAL(65,30) NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "CustomerReceivable_pkey" PRIMARY KEY ("customer_receivable_id")
);

-- CreateTable
CREATE TABLE "BatchLifecycle" (
    "id" TEXT NOT NULL,
    "batch_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "BatchLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReceivable_transaction_id_key" ON "CustomerReceivable"("transaction_id");

-- AddForeignKey
ALTER TABLE "CustomerReceivable" ADD CONSTRAINT "CustomerReceivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReceivable" ADD CONSTRAINT "CustomerReceivable_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLifecycle" ADD CONSTRAINT "BatchLifecycle_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "BatchInventory"("batch_inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;
