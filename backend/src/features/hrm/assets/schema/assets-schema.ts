import Joi from 'joi';

export const assetSchema = Joi.object({
  assetTag: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  purchaseDate: Joi.date().required(),
  purchaseCost: Joi.number().required(),
  supplier: Joi.string().optional(),
  location: Joi.string().optional(),
  custodianId: Joi.string().uuid().optional(),
  status: Joi.string().valid('active', 'under_maintenance', 'disposed').default('active'),
  depreciation: Joi.number().optional(),
  usefulLifeYears: Joi.number().optional(),
  accountId: Joi.string().uuid().required()
});
