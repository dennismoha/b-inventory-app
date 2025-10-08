// controllers/ProductsController.ts
import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { productSchema } from '@src/features/products/schema/products-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
// import { ConflictError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Product } from '@src/features/products/interfaces/product.interface';
// import { ConflictError } from '@src/shared/globals/helpers/error-handler';

export class ProductsController {
  /**
   * Fetch all products.t.
   */
  public async fetchProducts(req: Request, res: Response): Promise<void> {
    const products: Product[] = await prisma.products.findMany({
      include: {
        category: true, // Include related Products
        subcategory: true
      }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, products, 'succesfully fetched'));
  }

  /**
   * Create a new product.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(productSchema)
  public async createProduct(req: Request, res: Response): Promise<void> {
    // const { name, description, category_id, subcategory_id, image_url, sku } = req.body;
    const { name, description, category_id, subcategory_id } = req.body;

    // Check if product name already exists
    // const existingProductSku = await prisma.products.findUnique({
    //   where: { name }
    // });

    // if (existingProductSku) {
    //   throw new ConflictError('sku arleady exists');
    // }

    // const product: Product = await prisma.products.create({
    //   data: { name, description, category_id, subcategory_id, image_url, sku }
    // });
    const product: Product = await prisma.products.create({
      data: { name, description, category_id, subcategory_id }
    });
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.OK, product, 'succesfully fetched'));
  }

  /**
   * Update an existing product.
   */

  @joiValidation(productSchema)
  public async updateProduct(req: Request, res: Response): Promise<void> {
    const { product_id } = req.params;
    const { name, description, category_id, subcategory_id, image_url, sku } = req.body;

    const updatedProduct = await prisma.products.update({
      where: { product_id },
      data: { name, description, category_id, subcategory_id, image_url, sku }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedProduct, 'succesfully fetched'));
    // json(updatedProduct);
  }

  /**
   * Delete an existing product..
   */
  public async deleteProduct(req: Request, res: Response): Promise<void> {
    const { product_id } = req.params;

    await prisma.products.delete({
      where: { product_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
