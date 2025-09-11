-- CreateTable
CREATE TABLE "PartialPurchasePayment" (
    "partial_purchase_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "full_amount" DECIMAL(12,2) NOT NULL,
    "initial_payment" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartialPurchasePayment_pkey" PRIMARY KEY ("partial_purchase_id")
);

-- CreateTable
CREATE TABLE "PartialPaymentLog" (
    "id" UUID NOT NULL,
    "partial_payment_id" UUID NOT NULL,
    "initial_payment" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "PaymentMethod" NOT NULL,

    CONSTRAINT "PartialPaymentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartialPurchasePayment" ADD CONSTRAINT "PartialPurchasePayment_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartialPaymentLog" ADD CONSTRAINT "PartialPaymentLog_partial_payment_id_fkey" FOREIGN KEY ("partial_payment_id") REFERENCES "PartialPurchasePayment"("partial_purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;
