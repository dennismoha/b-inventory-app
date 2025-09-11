// features/miscellaneous/interfaces/miscellaneous.interface.ts

import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Order } from '@src/features/orders/interfaces/order.interface';

export interface Miscellaneous {
  order_id: string;
  base_fare: Decimal;
  discount_amount: Decimal;
  additional_charges: Decimal;
  tax_amount: Decimal;
  shipping_charge: Decimal;
  payment_processing_fee: Decimal;
  total_order_value: Decimal;
  currency_code: string;
  fare_breakdown: Prisma.JsonValue;
  tip_amount: Decimal;
  refund_amount: Decimal;
  other_fees: Decimal;
  payment_status: string;
  notes?: string;
  order?: Order;
}

// type JSONValue =
//   | string
//   | number
//   | boolean
//   | { [x: string]: JSONValue }
//   | Array<JSONValue>
//   | null;
