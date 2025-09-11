-- CreateTable
CREATE TABLE "InventoryLog" (
    "log_id" UUID NOT NULL,
    "batch_inventory_id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "batch_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "action" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("log_id")
);
