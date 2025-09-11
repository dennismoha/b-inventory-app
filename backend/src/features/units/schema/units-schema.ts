import Joi, { ObjectSchema } from 'joi';
// Units Validation Schema
export const unitSchema: ObjectSchema = Joi.object().keys({
  unit: Joi.string().required(),
  short_name: Joi.string().required(),
  no_of_products: Joi.number().integer().required()
});
