import Joi, { ObjectSchema } from 'joi';
// ProductUnits Validation Schema
export const productUnitSchema: ObjectSchema = Joi.object().keys({
  product_id: Joi.string().uuid().required(),
  unit_id: Joi.string().uuid().required()
});

// Products Validation Schema
export const productSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category_id: Joi.string().uuid().required(),
  subcategory_id: Joi.string().uuid().required(),
  image_url: Joi.string().uri().required(),
  sku: Joi.string().optional()
});
