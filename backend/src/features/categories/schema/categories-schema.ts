import Joi, { ObjectSchema } from 'joi';

// Define schema for category creation
export const categorySchema: ObjectSchema = Joi.object().keys({
  category_slug: Joi.string().min(3).max(50).required(),
  category_name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'category should be of type string',
    'string.min': 'Invalid category name',
    'string.max': 'Invalid category name',
    'string.empty': 'category name is a required field'
  }),
  description: Joi.string().min(5).max(500).required()
});

// Define schema for category update (some fields might be optional)
export const updateCategorySchema: ObjectSchema = Joi.object().keys({
  category_slug: Joi.string().min(3).max(50),
  category_name: Joi.string().min(3).max(100),
  description: Joi.string().min(5).max(500)
});

// SubCategories Validation Schema
export const subCategorySchema: ObjectSchema = Joi.object().keys({
  subcategory_name: Joi.string().required(),
  description: Joi.string().required()
});
