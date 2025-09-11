// features/orders/order-schema.ts

import Joi from 'joi';

export const orderSchema = Joi.object({
  supplier_id: Joi.string().required(),
  orderName: Joi.string().required(),
  totalAmount: Joi.number().required(),
  paymentStatus: Joi.string().valid('paid', 'unpaid', 'partially_paid').required(),
  paymentMethod: Joi.string().valid('cash', 'bank', 'credit').required(),
  orderDate: Joi.string().required(),
  shippingDate: Joi.date().required(),
  orderDeliveryDate: Joi.date().required(),
  // orderStatus: Joi.string().valid('pending', 'empty', 'failed', 'fulfilled', 'extended', 'order_default').required(),
  supplierDetails: Joi.string().allow(''),
  receiptPictorials: Joi.string().allow(''),
  receiptText: Joi.string().allow(''),
  comments: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const orderProductsSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  productId: Joi.string().uuid().required(),
  productName: Joi.string().required(),
  quantity: Joi.number().required(),
  price_per_unit: Joi.number().precision(2).required(),
  unit_id: Joi.string().required(),
  // totalAmount: Joi.number().precision(2).required(),
  order_quantity: Joi.number(),
  supplierProductsPricingId: Joi.string()
});
