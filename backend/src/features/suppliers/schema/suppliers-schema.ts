import Joi, { ObjectSchema } from 'joi';
// SupplierProducts Validation Schema
export const supplierProductSchema: ObjectSchema = Joi.object().keys({
  supplier_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required()
});

// SupplierPricing Validation Schema
// export const supplierPricingSchema: ObjectSchema = Joi.object().keys({
//     supplier_id: Joi.string().uuid().required(),
//     product_id: Joi.string().uuid().required(),
//     unit_id: Joi.string().uuid().required(),
//     price: Joi.number().precision(2).required(),
//     effective_date: Joi.date().required(),
//   });

// SupplierPricing Validation Schema
export const supplierPricingSchema = Joi.object().keys({
  supplier_products_id: Joi.string().uuid().required(), // Use `supplier_products_id` (UUID)
  unit_id: Joi.string().uuid().required(), // Use `unit_id` (UUID)
  price: Joi.number().precision(2).required(), // Use `price` (number with precision of 2 decimal places)
  effective_date: Joi.date().iso().required(), // Use `effective_date` (valid ISO date)
  Quantity: Joi.number().min(0).required() // Use `Quantity` (positive number)
});

// Suppliers Validation Schema
export const supplierSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().required(),
  address: Joi.string().required(),
  contact: Joi.string().required()
});
