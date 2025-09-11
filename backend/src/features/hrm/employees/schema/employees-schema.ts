import Joi from 'joi';

export const employeeCreateSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional()
});

export const employeeUpdateSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional()
}).min(1);
