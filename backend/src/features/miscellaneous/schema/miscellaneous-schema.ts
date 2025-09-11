// features/miscellaneous/schema/miscellaneous-schema.ts

import Joi from 'joi';

export const miscellaneousSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  base_fare: Joi.number().precision(2).required(),
  discount_amount: Joi.number().precision(2).default(0),
  additional_charges: Joi.number().precision(2).default(0),
  tax_amount: Joi.number().precision(2).required(),
  shipping_charge: Joi.number().precision(2).required(),
  payment_processing_fee: Joi.number().precision(2).default(0),
  total_order_value: Joi.number().precision(2).required(),
  currency_code: Joi.string().length(3).required(),
  fare_breakdown: Joi.object().optional(),
  tip_amount: Joi.number().precision(2).default(0),
  refund_amount: Joi.number().precision(2).default(0),
  other_fees: Joi.number().precision(2).default(0),
  payment_status: Joi.string().valid('paid', 'unpaid', 'partially_paid').required(),
  notes: Joi.string().optional()
});
