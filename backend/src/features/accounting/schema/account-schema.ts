// src/schemas/accountSchema.ts

import Joi, { ObjectSchema } from 'joi';

export const accountSchema: ObjectSchema = Joi.object().keys({
  name: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Account name should be a string',
    'string.min': 'Account name should be at least 3 characters long',
    'string.max': 'Account name should not exceed 100 characters',
    'string.empty': 'Account name is required'
  }),

  account_number: Joi.string().min(5).max(20).required().messages({
    'string.base': 'Account number must be a string',
    'string.min': 'Account number must be at least 5 characters',
    'string.max': 'Account number must not exceed 20 characters',
    'any.required': 'Account number is required'
  }),

  type: Joi.string().valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE').required().messages({
    'any.only': 'Invalid account type',
    'string.empty': 'Account type is required'
  }),

  opening_balance: Joi.number().precision(2).min(0.0).default(0.0).messages({
    'number.base': 'Opening balance must be a number',
    'number.precision': 'Opening balance can only have up to 2 decimal places',
    'number.min': 'Opening balance cannot be negative'
  })

  // running_balance: Joi.number().precision(2).min(0.0).default(0.0).messages({
  //   'number.base': 'Running balance must be a number',
  //   'number.precision': 'Running balance can only have up to 2 decimal places',
  //   'number.min': 'Running balance cannot be negative',
  // }),

  // account_status: Joi.string()
  //   .valid('ACTIVE', 'INACTIVE', 'CLOSED')
  //   .default('ACTIVE')
  //   .messages({
  //     'any.only': 'Invalid account status',
  //   }),
});

// export const accountSchema: ObjectSchema = Joi.object().keys({
//   name: Joi.string().min(3).max(100).required().messages({
//     'string.base': 'Account name should be a string',
//     'string.min': 'Account name should be at least 3 characters long',
//     'string.max': 'Account name should not exceed 100 characters',
//     'string.empty': 'Account name is required'
//   }),

//   type: Joi.string()
//     .valid('cash', 'bank', 'credit_card', 'other') // Adjust to match your AccountType enum
//     .required()
//     .messages({
//       'any.only': 'Invalid account type',
//       'string.empty': 'Account type is required'
//     }),

//   description: Joi.string().allow(null, '').max(255).messages({
//     'string.base': 'Description should be a string',
//     'string.max': 'Description should not exceed 255 characters'
//   }),

//   account_number: Joi.string().min(5).max(20).required().messages({
//     'string.base': 'Account number must be a string',
//     'string.max': 'Account number must be a string with a maximum length of 20 characters',

//     'any.required': 'Account number is required'
//   }),

//   balance: Joi.number().precision(2).min(0.0).default(0.0).messages({
//     'number.base': 'Balance must be a number',
//     'number.precision': 'Balance can only have up to 2 decimal places'
//   })
// });

//  amount, description, reference_id, accountId

export const AccountTopSchema: ObjectSchema = Joi.object({
  amount: Joi.number()
    .greater(0) // Must be greater than 0 not zero
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.greater': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),

  description: Joi.string().allow('', null).max(255).messages({
    'string.base': 'Description must be a string',
    'string.max': 'Description cannot exceed 255 characters'
  }),

  reference_id: Joi.string().messages({
    'string.base': 'Reference ID must be a string',

    'any.required': 'Reference ID is required'
  }),

  accountId: Joi.string().uuid().required().messages({
    'string.base': 'Account ID must be a string',
    'string.guid': 'Invalid Account ID',
    'any.required': 'Account ID is required'
  })
});

export const accountStatusSchema: ObjectSchema = Joi.object().keys({
  account_status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'CLOSED') // Adjust to match your AccountType enum
    .required()
    .messages({
      'any.only': 'Invalid account STATUS',
      'string.empty': 'Account STATUS is required'
    })
});
