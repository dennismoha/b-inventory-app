-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('full', 'partial', 'credit');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('settled', 'unsettled');

-- CreateTable
CREATE TABLE "Purchase" (
    "purchase_id" UUID NOT NULL,
    "batch" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "units" INTEGER NOT NULL,
    "purchase_cost_per_unit" DECIMAL(10,2) NOT NULL,
    "total_purchase_cost" DECIMAL(12,2) NOT NULL,
    "discounts" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "PurchaseExpense" (
    "expense_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "expense_type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseExpense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "PurchaseDamage" (
    "damage_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "damage_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseDamage_pkey" PRIMARY KEY ("damage_id")
);

-- CreateTable
CREATE TABLE "BatchInventory" (
    "batch_inventory_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "total_units" INTEGER NOT NULL,
    "damaged_units" INTEGER NOT NULL,
    "available_units" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchInventory_pkey" PRIMARY KEY ("batch_inventory_id")
);

-- CreateTable
CREATE TABLE "BatchPayables" (
    "payable_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "amount_due" DECIMAL(12,2) NOT NULL,
    "status" "PayableStatus" NOT NULL,
    "settlement_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchPayables_pkey" PRIMARY KEY ("payable_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_batch_key" ON "Purchase"("batch");

-- CreateIndex
CREATE UNIQUE INDEX "BatchInventory_purchase_id_key" ON "BatchInventory"("purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "BatchPayables_purchase_id_key" ON "BatchPayables"("purchase_id");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseExpense" ADD CONSTRAINT "PurchaseExpense_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDamage" ADD CONSTRAINT "PurchaseDamage_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchInventory" ADD CONSTRAINT "BatchInventory_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPayables" ADD CONSTRAINT "BatchPayables_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("purchase_id") ON DELETE RESTRICT ON UPDATE CASCADE;
