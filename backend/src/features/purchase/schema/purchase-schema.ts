// validators/purchase.validator.ts
import Joi, { ObjectSchema } from 'joi';

// export const createPurchaseSchema: ObjectSchema = Joi.object().keys({
//   batch: Joi.string().trim().required(),
//   supplier_products_id: Joi.string().uuid().required(),
//   quantity: Joi.number().integer().min(1).required(),
//   damaged_units: Joi.number().integer().min(0).default(0),
//   reason_for_damage: Joi.string().allow('', null),
//   unit_id: Joi.string().uuid().required(),
//   purchase_cost_per_unit: Joi.number().precision(2).min(0).required(),
//   total_purchase_cost: Joi.number().precision(2).min(0).required(),
//   discounts: Joi.number().precision(2).min(0).default(0),
//   tax: Joi.number().precision(2).min(0).default(0),
//   payment_type: Joi.string().valid('CASH', 'CREDIT').required(),
//   payment_method: Joi.string().valid('MPESA', 'BANK', 'CASH').required(),
//   account_id: Joi.string().uuid().allow(null),
//   payment_reference: Joi.string().allow('', null),
//   arrival_date: Joi.date().required()
// });

const paymentSchema = Joi.object({
  account_id: Joi.string().uuid().required(),
  amount_paid: Joi.number().positive().required(),
  payment_method: Joi.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY').required()
});

export const updateBatchPayableSchema = Joi.object({
  amount: Joi.number().positive().required(),
  account_id: Joi.string().uuid().required(),
  payment_date: Joi.date().optional()
});

export const createPurchaseSchema: ObjectSchema = Joi.object().keys({
  batch: Joi.string().required(),
  supplier_products_id: Joi.string().uuid().required(),
  quantity: Joi.number().positive().required(),
  damaged_units: Joi.number().min(0).required(),
  reason_for_damage: Joi.string().allow(null, ''),
  unit_id: Joi.string().uuid().required(),
  purchase_cost_per_unit: Joi.number().positive().required(),
  total_purchase_cost: Joi.number().positive().required(),
  discounts: Joi.number().min(0).required(),
  tax: Joi.number().min(0).required(),
  payment_type: Joi.string().valid('full', 'partial', 'credit', 'full_split').required(),
  payment_status: Joi.string().valid('paid', 'partially_paid', 'unpaid').optional(),
  payment_method: Joi.string().allow(null, '').valid('CASH', 'BANK', 'CREDIT'),
  payment_date: Joi.date().optional(),
  account_id: Joi.string().uuid().allow(null, ''),
  payment_reference: Joi.string().allow(null, ''),
  arrival_date: Joi.date().required(),
  payments: Joi.when('payment_type', {
    is: Joi.valid('partial', 'full_split'),
    then: Joi.array().items(paymentSchema).min(1).required(),
    otherwise: Joi.forbidden()
  })
});
