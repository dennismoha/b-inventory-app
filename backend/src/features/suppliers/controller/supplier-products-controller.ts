// controllers/SupplierProductsController.ts
import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { supplierProductSchema } from '@src/features/suppliers/schema/suppliers-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { SupplierProduct } from '@src/features/suppliers/interfaces/supplier.interface';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import { ConflictError } from '@src/shared/globals/helpers/error-handler';

export class SupplierProductsController {
  /**
   * Fetch all supplier products.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchSupplierProducts(req: Request, res: Response): Promise<void> {
    const supplierProducts: SupplierProduct[] = await prisma.supplierProducts.findMany({
      include: {
        supplier: true, // Include related Products
        product: true,
        Inventory: true,
        ProductPricing: true
      }
    });
    const message = utilMessage.fetchedMessage('supplier product');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, supplierProducts, message));
    // json(supplierProducts);
  }

  /**
   * Create a new supplier product.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(supplierProductSchema)
  public async createSupplierProduct(req: Request, res: Response): Promise<void> {
    const { supplier_id, product_id } = req.body;

    const checkForDuplicate = await prisma.supplierProducts.findFirst({
      where: {
        supplier_id: supplier_id, // Check by supplier_id
        product_id: product_id // Check by product_id
      }
    });

    if (checkForDuplicate) {
      throw new ConflictError(utilMessage.duplicateMessage('supplier product'));
    }

    const supplierProduct = await prisma.supplierProducts.create({
      data: { supplier_id, product_id }
    });
    const message = utilMessage.created('supplier product');
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, supplierProduct, message));
  }

  /**
   * Update an existing supplier product.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(supplierProductSchema)
  public async updateSupplierProduct(req: Request, res: Response): Promise<void> {
    const { supplier_products_id } = req.params;
    const { supplier_id, product_id } = req.body;

    const updatedSupplierProduct = await prisma.supplierProducts.update({
      where: { supplier_products_id },
      data: { supplier_id, product_id }
    });
    const message = utilMessage.updateMessage('supplier product');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedSupplierProduct, message));
  }

  /**
   * Delete an existing supplier product.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteSupplierProduct(req: Request, res: Response): Promise<void> {
    const { supplier_products_id } = req.params;

    await prisma.supplierProducts.delete({
      where: { supplier_products_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
