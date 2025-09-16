// import Joi from 'joi';

// export const transactionSchema = Joi.object().keys({
//   supplier_products_id: Joi.string().uuid().required(),  // Use `supplier_products_id` (UUID)
//   quantity: Joi.number().min(0).required(),  // Use `quantity` (positive number)
//   productName: Joi.string().min(1).max(255).required(),  // `productName` (non-empty string)
//   price: Joi.number().precision(2).required(),  // `price` (number with precision of 2 decimal places)
//   discount: Joi.number().precision(2).min(0).required(),  // `discount` (non-negative number)
//   vat: Joi.number().precision(2).min(0).required(),  // `vat` (non-negative number)
//   customerId: Joi.string().uuid().allow(null),  // `customerId` (UUID, can be null)
//   transactionDateCreated: Joi.date().iso().required(),  // `transactionDateCreated` (valid ISO date)
//   paymentMethod: Joi.string().valid('card', 'paypal', 'cash', 'bank-transfer').required(),  // `paymentMethod` (valid string)
//   subtotal: Joi.number().precision(2).min(0).required(),  // `subtotal` (non-negative number)
//   totalCost: Joi.number().precision(2).min(0).required()  // `totalCost` (non-negative number)
// });

import Joi from 'joi';

// Validate cart product schema
// const cartProductSchema = Joi.object().keys({
//   inventoryId: Joi.string().uuid().required(),  // `inventoryId` as UUID (required)
//   quantity: Joi.number().min(1).required(),  // `quantity` (positive number, min 1)
//   name: Joi.string().min(1).max(255).required(),  // `name` (non-empty string)
//   pricing: Joi.number().precision(2).min(0).required(),  // `pricing` (positive number with 2 decimals)
//   VAT: Joi.number().precision(2).min(0).required(),  // `VAT` (non-negative number with 2 decimals)
//   discount: Joi.number().precision(2).min(0).required(),  // `discount` (non-negative number with 2 decimals)
// });

const cartProductSchema = Joi.object().keys({
  inventoryId: Joi.string().uuid().required(), // `inventoryId` as UUID (required)
  quantity: Joi.number().min(1).required(), // `quantity` (positive number, min 1)
  productName: Joi.string().min(1).max(255).required(), // `productName` (non-empty string)
  price: Joi.number().precision(2).min(0).required(), // `price` (positive number with 2 decimals)
  VAT: Joi.number().precision(2).min(0).required(), // `VAT` (non-negative number with 2 decimals)
  discount: Joi.number().precision(2).min(0).required(), // `discount` (non-negative number with 2 decimals)
  batch_inventory_id: Joi.string().uuid().required(),
  // transactionId: Joi.string().uuid().required(),  // `transactionId` as UUID (required)
  status: Joi.string().allow(null),
  stock_quantity: Joi.number().min(0).required(), // `stock_quantity` (non-negative number)
  supplier_products_id: Joi.string().uuid().required(), // `supplier_products_id` as UUID (required)
  total_stock_quantity: Joi.number().min(0).required(),
  needsBatchLoad: Joi.boolean().required()
});

// Validate product items schema
// export const transactionSchema = Joi.object().keys({
//   cartProducts: Joi.array().items(cartProductSchema).required(),  // Array of `cartProducts` (required)
//   statusTab: Joi.boolean().required(),  // `statusTab` (boolean, required)
//   totalCost: Joi.object().keys({
//     total: Joi.number().precision(2).min(0).required(),  // `total` (non-negative number with 2 decimals)
//     subtotal: Joi.number().precision(2).min(0).required(),  // `subtotal` (non-negative number with 2 decimals)
//   }).required(),  // `totalCost` (required)
//   customerId: Joi.string().uuid().allow(null),  // `customerId` (UUID, can be null or omitted)
// });

export const transactionSchema = Joi.object().keys({
  cartProducts: Joi.array().items(cartProductSchema).required(), // Array of `cartProducts` (required)
  statusTab: Joi.boolean().required(), // `statusTab` (boolean, required)
  totalCost: Joi.object()
    .keys({
      total: Joi.number().precision(2).min(0).required(), // `total` (non-negative number with 2 decimals)
      subtotal: Joi.number().precision(2).min(0).required() // `subtotal` (non-negative number with 2 decimals)
    })
    .required(), // `totalCost` (required)
  paymentMethod: Joi.string().valid('CASH', 'BANK', 'CREDIT').required(), // `paymentMethod` (valid string values)
  customerId: Joi.string().uuid().allow(null) // `customerId` (UUID, can be null or omitted)
});
