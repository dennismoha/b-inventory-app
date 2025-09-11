// controllers/ProductUnitsController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { productUnitSchema } from '@src/features/products/schema/products-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { ProductUnit } from '@src/features/products/interfaces/product.interface';

const prisma = new PrismaClient();

export class ProductUnitsController {
  /**
   * Fetch all product units.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchProductUnits(req: Request, res: Response): Promise<void> {
    const productUnits: ProductUnit[] = await prisma.productUnits.findMany();
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, productUnits, 'succesfully fetched'));
    // json(productUnits);
  }

  /**
   * Create a new product unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  @joiValidation(productUnitSchema)
  public async createProductUnit(req: Request, res: Response): Promise<void> {
    const { product_id, unit_id } = req.body;

    const productUnit = await prisma.productUnits.create({
      data: { product_id, unit_id }
    });
    res.status(StatusCodes.CREATED).json(productUnit);
  }

  /**
   * Update an existing product unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(productUnitSchema)
  public async updateProductUnit(req: Request, res: Response): Promise<void> {
    const { product_unit_id } = req.params;
    const { product_id, unit_id } = req.body;

    const updatedProductUnit = await prisma.productUnits.update({
      where: { product_unit_id },
      data: { product_id, unit_id }
    });
    res.status(StatusCodes.OK).json(updatedProductUnit);
  }

  /**
   * Delete an existing product unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteProductUnit(req: Request, res: Response): Promise<void> {
    const { product_unit_id } = req.params;

    await prisma.productUnits.delete({
      where: { product_unit_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
