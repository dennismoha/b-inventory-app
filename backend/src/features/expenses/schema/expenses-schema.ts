import Joi from 'joi';

// export const expenseCreateSchema = Joi.object({
//   description: Joi.string().required(),
//   accountId: Joi.string().required(),
//   amount: Joi.number().positive().required(),
//   category: Joi.string().required(),
//   expenseDate: Joi.date().optional(),
//   purchaseId: Joi.string().uuid().optional(),
//   batch: Joi.string().optional(),
//   isGeneral: Joi.boolean().optional()
// });

export const expenseCreateSchema = Joi.object({
  description: Joi.string().min(3).max(255).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 3 characters long',
    'string.max': 'Description cannot exceed 255 characters'
  }),

  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than zero',
    'any.required': 'Amount is required'
  }),

  category: Joi.string()
    .valid('RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'TRAVEL', 'MARKETING', 'OTHER', 'TRANSPORT', 'PURCHASE')
    .required()
    .messages({
      'any.only': 'Invalid expense category',
      'string.empty': 'Expense category is required'
    }),

  expenseDate: Joi.date().optional().messages({
    'date.base': 'Expense date must be a valid date'
  }),

  accountId: Joi.string().uuid().required().messages({
    'string.guid': 'Account ID must be a valid UUID',
    'any.required': 'Account ID is required'
  }),

  purchaseId: Joi.string().uuid().optional().messages({
    'string.guid': 'Purchase ID must be a valid UUID'
  }),

  paymentMethod: Joi.string().valid('CASH', 'BANK', 'CREDIT', 'CARD').required().messages({
    'any.only': 'Invalid payment method',
    'string.empty': 'Payment method is required'
  }),

  referenceNo: Joi.string().max(50).optional().messages({
    'string.max': 'Reference number cannot exceed 50 characters'
  }),

  vendor: Joi.string().max(100).optional().messages({
    'string.max': 'Vendor name cannot exceed 100 characters'
  }),

  batch: Joi.string().optional(),

  isGeneral: Joi.boolean().default(false)
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
