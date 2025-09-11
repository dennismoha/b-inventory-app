// controllers/SuppliersController.ts
import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { supplierSchema } from '@src/features/suppliers/schema/suppliers-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Supplier } from '@src/features/suppliers/interfaces/supplier.interface';
import { ConflictError } from '@src/shared/globals/helpers/error-handler';

export class SuppliersController {
  /**
   * Fetches a list of suppliers along with their associated products and pricing information.
   *
   * This function retrieves all suppliers from the database, including their related
   * `SupplierProducts` (with associated `Product` details) and `SupplierPricing` data.
   * The data is then returned in a success response with a 200 status code.
   *
   * @async
   * @function
   *
   * @param {Request} req - The request object, which contains any parameters or query data.
   * @param {Response} res - The response object used to send the data back to the client.
   *
   * @returns {Promise<void>} A promise that resolves when the response has been sent. The response
   * structure is as follows:
   *
   * @returns {object} res - The response object.
   * @returns {number} res.status - HTTP status code (200).
   * @returns {object} res.body - The body of the response, containing the supplier data.
   * @returns {object[]} res.body.suppliers - Array of supplier objects.
   * @returns {string} res.body.suppliers.id - Unique identifier for the supplier (UUID).
   * @returns {string} res.body.suppliers.name - Name of the supplier.
   * @returns {string} res.body.suppliers.address - Address of the supplier.
   * @returns {string} res.body.suppliers.contact - Contact number of the supplier.
   * @returns {string} res.body.suppliers.createdAt - The creation timestamp of the supplier (ISO string).
   * @returns {string} res.body.suppliers.updatedAt - The last update timestamp of the supplier (ISO string).
   * @returns {object[]} res.body.suppliers.supplierProducts - Array of supplier products.
   * @returns {string} res.body.suppliers.supplierProducts.id - Unique identifier for the supplier product.
   * @returns {string} res.body.suppliers.supplierProducts.supplierId - The ID of the associated supplier.
   * @returns {string} res.body.suppliers.supplierProducts.productId - The ID of the associated product.
   * @returns {string} res.body.suppliers.supplierProducts.createdAt - The creation timestamp of the supplier product.
   * @returns {string} res.body.suppliers.supplierProducts.updatedAt - The last update timestamp of the supplier product.
   * @returns {object} res.body.suppliers.supplierProducts.product - The full product details.
   * @returns {string} res.body.suppliers.supplierProducts.product.id - Unique identifier for the product (UUID).
   * @returns {string} res.body.suppliers.supplierProducts.product.name - Name of the product.
   * @returns {string} res.body.suppliers.supplierProducts.product.description - Description of the product.
   * @returns {number} res.body.suppliers.supplierProducts.product.price - Price of the product.
   * @returns {string} res.body.suppliers.supplierProducts.product.createdAt - Creation timestamp of the product.
   * @returns {string} res.body.suppliers.supplierProducts.product.updatedAt - Last update timestamp of the product.
   * @returns {object[]} res.body.suppliers.supplierPricing - Array of pricing details for the supplier (if available).
   */
  public async fetchSuppliers(req: Request, res: Response): Promise<void> {
    // Fetching suppliers from the database
    const suppliers: Supplier[] = await prisma.suppliers.findMany({
      include: {
        // Include related SupplierProducts, and for each, include the associated product details
        SupplierProducts: {
          include: {
            product: true // Eager loading related Product data for each SupplierProduct
          }
        }
      }
    });

    // Define a success message to be sent in the response
    const message = 'fetched suppliers successfully';

    // Send a success response with the fetched suppliers and message
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, suppliers, message));
  }

  // public async fetchSuppliers(req: Request, res: Response): Promise<void> {
  //   const suppliers:Supplier[] = await prisma.suppliers.findMany({

  //     include:{
  //       SupplierProducts: {
  //         include:{
  //           product: true
  //         }
  //       } , // Include related Products
  //       SupplierPricing: true
  //     }
  //   });
  //   const message = 'fetched suppliers succesfully';
  //   res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, suppliers, message));

  // }

  /**
   * Create a new supplier.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(supplierSchema)
  public async createSupplier(req: Request, res: Response): Promise<void> {
    const { name, address, contact } = req.body;
    const message = 'fetched suppliers';

    // Check if category_slug already exists
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { name }
    });

    if (existingSupplier) {
      throw new ConflictError('supplier arleady exists');
    }

    const supplier: Supplier = await prisma.suppliers.create({
      data: { name, address, contact }
    });
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, supplier, message));
    //json(supplier);
  }

  /**
   * Update an existing supplier.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(supplierSchema)
  public async updateSupplier(req: Request, res: Response): Promise<void> {
    const { supplier_id } = req.params;
    const { name, address, contact } = req.body;
    const message = 'supplier updated succesfully';

    const updatedSupplier: Supplier = await prisma.suppliers.update({
      where: { supplier_id },
      data: { name, address, contact }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedSupplier, message));
    //json(updatedSupplier);
  }

  /**
   * Delete an existing supplier.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteSupplier(req: Request, res: Response): Promise<void> {
    const { supplier_id } = req.params;

    await prisma.suppliers.delete({
      where: { supplier_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
