import { Request, Response } from 'express';
import { customerSchema } from '@src/features/customers/schema/customers-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { Customer } from '@src/features/customers/interfaces/customer.interface';
import { ConflictError } from '@src/shared/globals/helpers/error-handler';

export class CustomersController {
  /**
   * Fetch all customers.
   */
  public async fetchCustomers(req: Request, res: Response): Promise<void> {
    const customers: Customer[] = await prisma.customer.findMany({
      include: {
        transactions: true // If there are related transactions
      }
    });
    const message = utilMessage.fetchedMessage('customers');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, customers, message));
  }

  /**
   * Create a new customer.
   */
  @joiValidation(customerSchema)
  public async createCustomer(req: Request, res: Response): Promise<void> {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      country,
      status,
      loyaltyPoints,

      notes,
      preferredPaymentMethod
    } = req.body;
    console.log('req. body is ', req.body);
    // Check if the email already exists in the database
    const existingEmail = await prisma.customer.findUnique({
      where: { email }
    });

    // If email or phone number already exists, throw an error
    if (existingEmail) {
      throw new ConflictError('Email already exists.');
    }

    // Check if the phone number already exists in the database
    const existingPhone = await prisma.customer.findUnique({
      where: { phoneNumber }
    });

    if (existingPhone) {
      throw new ConflictError('Phone number already exists.');
    }

    // Create the new customer entry in the database
    const customer = await prisma.customer.create({
      data: {
        firstName, // Customer's first name
        lastName, // Customer's last name
        email,
        phoneNumber,
        address, // Optional: Customer's address

        country, // Optional: Customer's country

        status, // Customer status: "active", "inactive", etc.
        loyaltyPoints,

        notes, // Optional: Any special notes or preferences about the customer
        preferredPaymentMethod // Optional: Preferred payment method (e.g., Credit card, PayPal)
      }
    });

    const message = utilMessage.created('customer');
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, customer, message));
  }

  /**
   * Update an existing customer.
   * @param req The Express request object containing the customer ID in the params and updated details in the body.
   * @param res The Express response object used to send the response back to the client.
   */
  @joiValidation(customerSchema)
  public async updateCustomer(req: Request, res: Response): Promise<void> {
    const { customerId } = req.params; // Extract the customer ID from the URL params
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      country,
      status,
      loyaltyPoints,

      notes,
      preferredPaymentMethod
    } = req.body;

    // Update the existing customer entry in the database
    const updatedCustomer = await prisma.customer.update({
      where: { customerId },
      data: {
        firstName, // Customer's first name
        lastName, // Customer's last name
        email,
        phoneNumber,
        address, // Optional: Customer's address

        country, // Optional: Customer's country

        status, // Customer status: "active", "inactive", etc.
        loyaltyPoints,

        notes, // Optional: Any special notes or preferences about the customer
        preferredPaymentMethod // Optional: Preferred payment method (e.g., Credit card, PayPal)
      }
    });

    const message = utilMessage.updateMessage('customer');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedCustomer, message));
  }

  /**
   * Delete an existing customer.
  
   */
  public async deleteCustomer(req: Request, res: Response): Promise<void> {
    const { customerId } = req.params;

    // Delete the customer entry from the database
    await prisma.customer.update({
      where: { customerId },
      data: {
        deleted: true
      }
    });

    res.status(StatusCodes.NO_CONTENT).send();
  }
}
