import Joi from 'joi';

export const inventorySchema = Joi.object({
  batch_name: Joi.string().required()
  // supplier_products_id: Joi.string().uuid().required(),
  // quantity: Joi.number().positive().required(),
  // unit_id: Joi.string().uuid().required(),
});

// export const inventorySchema = Joi.object({
//   supplier_products_id: Joi.string().required(),
//   // productName: Joi.string().min(1).max(255).required(),
//   // sku: Joi.string().min(1).max(100).required(),
//   stock_quantity: Joi.number().min(0).required(),
//   reorder_level: Joi.number().min(0).required(),
//   // last_restocked: Joi.date().required(),
//   unit_id: Joi.string().required()
//   // status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DISCONTINUED').required(),
// });

export const inventoryRestockSchema = Joi.object({
  stock_quantity: Joi.number().min(0).required()
});

export const productPricingSchema = Joi.object({
  supplier_products_id: Joi.string().uuid().required(),
  Quantity: Joi.number().precision(2).min(0).required(), // Validates Decimal
  unit_id: Joi.string().uuid().required(),
  VAT: Joi.number().precision(2).min(0).required(), // Validates Decimal
  discount: Joi.number().precision(2).min(0).required(), // Validates Decimal
  price: Joi.number().precision(2).min(0).required() // Validates Decimal
  // effective_date: Joi.date().required(),
});

export const updateStockLevelSchema = Joi.object({
  supplier_products_id: Joi.string().uuid().required(),
  reorder_level: Joi.number().integer().min(0).required()
});
