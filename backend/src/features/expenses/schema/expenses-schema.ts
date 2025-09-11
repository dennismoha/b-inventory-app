import Joi from 'joi';

export const expenseCreateSchema = Joi.object({
  description: Joi.string().required(),
  accountId:Joi.string().required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().required(),
  expenseDate: Joi.date().optional(),
  purchaseId: Joi.string().uuid().optional(),
  batch: Joi.string().optional(),
  isGeneral: Joi.boolean().optional()
});

export const expenseUpdateSchema = Joi.object({
  description: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().optional(),
  expenseDate: Joi.date().optional(),
  purchaseId: Joi.string().uuid().optional(),
  batch: Joi.string().optional(),
  isGeneral: Joi.boolean().optional()
}).min(1);
