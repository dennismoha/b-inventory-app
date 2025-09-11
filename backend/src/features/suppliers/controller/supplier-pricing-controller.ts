// controllers/SupplierPricingController.ts
import { Request, Response } from 'express';
import { supplierPricingSchema } from '@src/features/suppliers/schema/suppliers-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { SupplierPricing } from '@src/features/suppliers/interfaces/supplier.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class SupplierPricingController {
  /**
   * Fetch all supplier pricing entries.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchSupplierPricing(req: Request, res: Response): Promise<void> {
    const pricing: SupplierPricing[] = await prisma.supplierPricing.findMany({
      include: {
        unit: true,
        supplierProduct: {
          include: {
            product: true,
            supplier: true
          }
        }
      }
    });
    const message = utilMessage.fetchedMessage('supplier pricing');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, pricing, message));
  }

  /**
   * Create a new supplier pricing entry.
   * @param req The Express request object containing the supplier pricing details in the body.
   * @param res The Express response object used to send the response back to the client.
   */
  @joiValidation(supplierPricingSchema)
  public async createSupplierPricing(req: Request, res: Response): Promise<void> {
    const { unit_id, price, effective_date, supplier_products_id, Quantity } = req.body;

    // Create the new supplier pricing entry in the database
    const pricing = await prisma.supplierPricing.create({
      data: {
        supplier_products_id, // Using supplier_products_id from the body

        Quantity: new Decimal(Quantity), // Using Quantity as a decimal
        unit_id, // Using unit_id from the body
        price: new Decimal(price), // Using price as a decimal
        effective_date: new Date(effective_date) // Using effective_date as a Date
      }
    });

    const message = utilMessage.created('supplier pricing');

    // Return the created pricing entry
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.OK, pricing, message));
    //json(pricing);
  }
  /**
   * Update an existing supplier pricing entry.
   * @param req The Express request object containing the supplier pricing ID in the params and updated details in the body.
   * @param res The Express response object used to send the response back to the client.
   */
  @joiValidation(supplierPricingSchema)
  public async updateSupplierPricing(req: Request, res: Response): Promise<void> {
    const { supplier_pricing } = req.params; // Extract the supplier pricing ID from the URL params
    const { supplier_products_id, unit_id, price, effective_date, Quantity } = req.body;

    // Update the existing supplier pricing entry in the database
    const updatedPricing = await prisma.supplierPricing.update({
      where: { supplier_pricing }, // Using supplier pricing ID to find the entry
      data: {
        supplier_products_id, // Using supplier_products_id from the body
        Quantity: new Decimal(Quantity), // Using Quantity as a decimal
        unit_id, // Using unit_id from the body
        price: new Decimal(price), // Using price as a decimal
        effective_date: new Date(effective_date) // Using effective_date as a Date
      }
    });

    const message = utilMessage.updateMessage('supplier pricing');

    // Return the updated supplier pricing entry
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedPricing, message));
    //json(updatedPricing);
  }

  /**
   * Delete an existing supplier pricing entry.
   * @param req The Express request object containing the supplier pricing ID in the params.
   * @param res The Express response object used to send the response back to the client.
   */
  public async deleteSupplierPricing(req: Request, res: Response): Promise<void> {
    const { supplier_pricing } = req.params; // Extract the supplier pricing ID from the URL params

    // Delete the supplier pricing entry from the database
    await prisma.supplierPricing.delete({
      where: { supplier_pricing } // Using supplier pricing ID to find the entry
    });

    // Return no content status to indicate successful deletion
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
