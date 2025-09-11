-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid', 'partially_paid');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'bank', 'credit');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'empty', 'failed', 'fulfilled', 'extended', 'order_default');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateTable
CREATE TABLE "Categories" (
    "categoryId" UUID NOT NULL,
    "category_slug" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "SubCategories" (
    "subcategory_id" UUID NOT NULL,
    "subcategory_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SubCategories_pkey" PRIMARY KEY ("subcategory_id")
);

-- CreateTable
CREATE TABLE "CategorySubCategory" (
    "category_subcategory_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "subcategory_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategorySubCategory_pkey" PRIMARY KEY ("category_id","subcategory_id")
);

-- CreateTable
CREATE TABLE "SupplierPricing" (
    "supplier_pricing" UUID NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "Quantity" DECIMAL(8,2) NOT NULL,
    "unit_id" UUID NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "effective_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SupplierPricing_pkey" PRIMARY KEY ("supplier_pricing")
);

-- CreateTable
CREATE TABLE "ProductUnits" (
    "product_unit_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,

    CONSTRAINT "ProductUnits_pkey" PRIMARY KEY ("product_unit_id")
);

-- CreateTable
CREATE TABLE "Units" (
    "unit_id" UUID NOT NULL,
    "unit" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "no_of_products" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "SupplierProducts" (
    "supplier_products_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SupplierProducts_pkey" PRIMARY KEY ("supplier_products_id")
);

-- CreateTable
CREATE TABLE "Products" (
    "product_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "subcategory_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "supplier_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "supplier_id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "orderName" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "shippingDate" TIMESTAMP(3) NOT NULL,
    "orderDeliveryDate" TIMESTAMP(3) NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'empty',
    "comments" TEXT,
    "supplierDetails" TEXT,
    "receiptPictorials" TEXT,
    "receiptText" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "Miscellaneous" (
    "miscellaneous_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "base_fare" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "additional_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "shipping_charge" DECIMAL(10,2) NOT NULL,
    "payment_processing_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_order_value" DECIMAL(10,2) NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL,
    "fare_breakdown" JSONB,
    "tip_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refund_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "other_fees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Miscellaneous_pkey" PRIMARY KEY ("miscellaneous_id")
);

-- CreateTable
CREATE TABLE "OrderProducts" (
    "orderProductsId" TEXT NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "order_quantity" INTEGER NOT NULL,
    "price_per_unit" DECIMAL(10,2) NOT NULL,
    "unit_id" UUID NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "supplierProductsPricingId" UUID NOT NULL,

    CONSTRAINT "OrderProducts_pkey" PRIMARY KEY ("orderProductsId")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "inventoryId" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "product_weight" DECIMAL(8,2) NOT NULL,
    "stock_quantity" DECIMAL(8,2) NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "last_restocked" TIMESTAMP(3) NOT NULL,
    "unit_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "softDelete" BOOLEAN NOT NULL DEFAULT false,
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("inventoryId")
);

-- CreateTable
CREATE TABLE "InventoryRestock" (
    "inventoryRestockId" TEXT NOT NULL,
    "inventory_Id" TEXT NOT NULL,
    "new_stock_quantity" DECIMAL(8,2) NOT NULL,
    "old_stock_quantity" DECIMAL(8,2) NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "restock_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "softDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryRestock_pkey" PRIMARY KEY ("inventoryRestockId")
);

-- CreateTable
CREATE TABLE "ProductPricing" (
    "product_pricing_id" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "Quantity" DECIMAL(8,2) NOT NULL,
    "unit_id" UUID NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "VAT" DECIMAL(8,2),
    "discount" DECIMAL(8,2),
    "effective_date" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ProductPricing_pkey" PRIMARY KEY ("product_pricing_id")
);

-- CreateTable
CREATE TABLE "InventoryTracking" (
    "inventoryTrackingId" TEXT NOT NULL,
    "productID" TEXT NOT NULL,
    "orderProductId" TEXT NOT NULL,
    "quantityDeducted" INTEGER NOT NULL,
    "dateDeducted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "InventoryTracking_pkey" PRIMARY KEY ("inventoryTrackingId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "preferredPaymentMethod" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "Id" SERIAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    "customerId" TEXT,
    "transactionDateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TransactionProduct" (
    "TransactionProductId" TEXT NOT NULL,
    "supplier_products_id" UUID NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "stock_quantity" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "VAT" DOUBLE PRECISION NOT NULL,
    "productSubTotalCost" DOUBLE PRECISION NOT NULL,
    "productTotalCost" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionProduct_pkey" PRIMARY KEY ("TransactionProductId")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRoles" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_category_slug_key" ON "Categories"("category_slug");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_category_name_key" ON "Categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategories_subcategory_name_key" ON "SubCategories"("subcategory_name");

-- CreateIndex
CREATE UNIQUE INDEX "Units_unit_key" ON "Units"("unit");

-- CreateIndex
CREATE UNIQUE INDEX "Units_short_name_key" ON "Units"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "Units_unit_short_name_key" ON "Units"("unit", "short_name");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProducts_supplier_id_product_id_key" ON "SupplierProducts"("supplier_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Products_sku_key" ON "Products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_name_key" ON "Suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderName_key" ON "Order"("orderName");

-- CreateIndex
CREATE UNIQUE INDEX "Miscellaneous_order_id_key" ON "Miscellaneous"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_supplier_products_id_key" ON "Inventory"("supplier_products_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPricing_supplier_products_id_key" ON "ProductPricing"("supplier_products_id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneNumber_key" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionId_key" ON "Transaction"("transactionId");

-- CreateIndex
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CategorySubCategory" ADD CONSTRAINT "CategorySubCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubCategory" ADD CONSTRAINT "CategorySubCategory_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "SubCategories"("subcategory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPricing" ADD CONSTRAINT "SupplierPricing_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPricing" ADD CONSTRAINT "SupplierPricing_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnits" ADD CONSTRAINT "ProductUnits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnits" ADD CONSTRAINT "ProductUnits_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProducts" ADD CONSTRAINT "SupplierProducts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProducts" ADD CONSTRAINT "SupplierProducts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "SubCategories"("subcategory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Miscellaneous" ADD CONSTRAINT "Miscellaneous_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_supplierProductsPricingId_fkey" FOREIGN KEY ("supplierProductsPricingId") REFERENCES "SupplierPricing"("supplier_pricing") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRestock" ADD CONSTRAINT "InventoryRestock_inventory_Id_fkey" FOREIGN KEY ("inventory_Id") REFERENCES "Inventory"("inventoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricing" ADD CONSTRAINT "ProductPricing_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricing" ADD CONSTRAINT "ProductPricing_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTracking" ADD CONSTRAINT "InventoryTracking_orderProductId_fkey" FOREIGN KEY ("orderProductId") REFERENCES "OrderProducts"("orderProductsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionProduct" ADD CONSTRAINT "TransactionProduct_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("inventoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionProduct" ADD CONSTRAINT "TransactionProduct_supplier_products_id_fkey" FOREIGN KEY ("supplier_products_id") REFERENCES "SupplierProducts"("supplier_products_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionProduct" ADD CONSTRAINT "TransactionProduct_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
