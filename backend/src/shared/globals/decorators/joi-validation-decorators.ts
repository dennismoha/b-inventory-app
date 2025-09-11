import { ObjectSchema } from 'joi';
import { jOIRequestValidationError } from '@src/shared/globals/helpers/error-handler';
import { Request } from 'express';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new jOIRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
