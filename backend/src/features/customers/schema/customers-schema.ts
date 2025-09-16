import Joi from 'joi';

// export const customerSchema = Joi.object().keys({
//   name: Joi.string().min(1).max(255).required(),  // `name` (non-empty string)
//   email: Joi.string().email().max(255).required(),  // `email` (valid email format)
//   phone: Joi.string().min(10).max(15).optional(),  // `phone` (string with optional length, adjust if necessary)
//   address: Joi.string().max(255).optional()  // `address` (optional string with max length of 255)
// });

export const customerSchema = Joi.object({
  firstName: Joi.string().min(1).max(255).required(), // Required: first name (non-empty string)
  lastName: Joi.string().min(1).max(255).required(), // Required: last name (non-empty string)
  email: Joi.string().email().max(255).required(), // Required: valid email format
  // phoneNumber: Joi.number().min(10).max(15).required(), // Required: phone number (string, optional length)
  phoneNumber: Joi.string()
    .pattern(/^[0-9]+$/) // only digits
    .min(10) // at least 10 digits
    .max(15) // at most 15 digits
    .required(),
  address: Joi.string().max(255).optional().allow(null), // Optional: address (string or null)
  country: Joi.string().max(255).optional().allow(null), // Optional: country (string or null)

  status: Joi.string().valid('active', 'inactive'), // Required: customer status ('active' or 'inactive')
  loyaltyPoints: Joi.number().integer().min(0), // Required: loyalty points (non-negative integer)

  notes: Joi.string().max(500).optional().allow(null), // Optional: notes (string or null, max length 500)
  preferredPaymentMethod: Joi.string().max(255).optional().allow(null) // Optional: preferred payment method (string or null)
});
