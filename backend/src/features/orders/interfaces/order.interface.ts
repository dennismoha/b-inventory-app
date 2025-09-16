// features/orders/order.interface.ts

import { Decimal } from '@prisma/client/runtime/library';
import { SupplierPricing } from '@src/features/suppliers/interfaces/supplier.interface';
import { Inventory } from '@src/features/inventory/interfaces/inventory.interface';
import { PaymentMethod } from '@src/features/purchase/interface/purchase.interface';

export interface Order {
  orderId: string;
  orderName: string;
  totalAmount: Decimal;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  paymentMethod: PaymentMethod;
  shippingDate: Date;
  orderDeliveryDate: Date;
  orderStatus?: 'pending' | 'empty' | 'failed' | 'fulfilled' | 'extended' | 'order_default';
  comments?: string | null;
  created_at: Date;
  last_updated_at: Date;
  orderProducts?: OrderProducts[];
}

export interface OrderProducts {
  orderProductsId: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  order_quantity: number;
  price_per_unit: Decimal;
  unit_id: string;
  totalAmount: Decimal;
  supplierProductsPricingId: string;
  order?: Order;
  supplierPricing?: SupplierPricing;
  inventoryTracking?: Inventory;
}
