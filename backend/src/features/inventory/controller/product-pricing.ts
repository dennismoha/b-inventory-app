import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client
import { productPricingSchema } from '@src/features/inventory/schema/inventory-schema'; // Joi validation schema
import { StatusCodes } from 'http-status-codes'; // HTTP status codes
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators'; // Joi validation decorator
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages'; // Helper function for success response
import { ProductPricing } from '@src/features/inventory/interfaces/inventory.interface'; // ProductPricing interface
import { BadRequestError, ConflictError } from '@src/shared/globals/helpers/error-handler';

/**
 * Controller for handling product pricing operations.
 */
export class ProductPricingController {
  /**
   * Fetches all product pricing records from the database.
   *
   * This method retrieves all product pricing records that are not logically deleted (softDelete: false).
   * It returns a list of product pricing records with an HTTP status of 200.
   *

   * @returns {Promise<void>} A promise that resolves to the response object containing the fetched product pricing.
   */
  public async fetchProductPricing(req: Request, res: Response): Promise<void> {
    const productPricing: ProductPricing[] = await prisma.productPricing.findMany({
      include: {
        supplierProduct: true,
        unit: true
      }
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, productPricing, 'Product pricing fetched successfully'));
  }

  /**
   * Creates a new product pricing record in the database.
   *
   * This method accepts input data from the request body, validates it using Joi schema,
   * and adds the new product pricing record to the database after performing necessary validations.
   *
   * @async
   * @function
   * @param {Request} req - The Express request object, which contains the necessary body fields:
   *   - `supplier_products_id`: The ID of the product from the supplier products.
   *   - `Quantity`: The quantity for which the price applies.
   *   - `unit_id`: The unit of measurement ID (e.g., kg, g, etc.).
   *   - `price`: The price for the product.
   *   - `effective_date`: The effective date when the price will be applied.
   * @param {Response} res - The Express response object, which will contain the newly created product pricing.
   *
   * @returns {Promise<void>} A promise that resolves to the response object containing the created product pricing.
   */
  @joiValidation(productPricingSchema)
  public async createProductPricing(req: Request, res: Response): Promise<void> {
    const { supplier_products_id, Quantity, unit_id, price, VAT, discount } = req.body;

    // 1) Validate Unique Product Pricing
    const existingProductPricing = await prisma.productPricing.findFirst({
      where: {
        supplier_products_id
        // effective_date,
      }
    });

    if (existingProductPricing) {
      throw new ConflictError('Product pricing already exists for this supplier and effective date.');
    }

    if (Quantity === 0 || price === 0) {
      throw new BadRequestError('item price or quantity cannot be equal to 0');
    }

    // 2) Create New Product Pricing Record
    const newProductPricing: ProductPricing = await prisma.productPricing.create({
      data: {
        supplier_products_id,
        Quantity,
        unit_id,
        price,
        // effective_date,
        VAT,
        discount,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, newProductPricing, 'Product pricing created successfully'));
  }

  /**
   * Updates an existing product pricing record.
   *
   * This method accepts the `productPricingId` from the URL and the updated data from the request body.
   * It then updates the product pricing record in the database and returns the updated record with a successful response.
   *

   *   - `productPricingId`: The ID of the product pricing record to update (in the URL params).
   *   - The body should contain the fields to be updated:
   *     - `supplier_products_id`: The updated supplier product ID.
   *     - `Quantity`: The updated quantity for the product.
   *     - `unit_id`: The updated unit ID for the product.
   *     - `price`: The updated price for the product.
   *     - `effective_date`: The updated effective date of the pricing.
   * @param {Response} res - The Express response object, which will contain the updated product pricing record and a success message.
   *
   * @returns {Promise<void>} A promise that resolves to the response object containing the updated product pricing.
   */
  @joiValidation(productPricingSchema)
  public async updateProductPricing(req: Request, res: Response): Promise<void> {
    const { productPricingId } = req.params;
    const { supplier_products_id, Quantity, unit_id, price, VAT, discount } = req.body;

    console.log('=========== update product pricing ');
    // Attempt to update the product pricing record
    const updatedProductPricing: ProductPricing = await prisma.productPricing.update({
      where: { product_pricing_id: productPricingId },
      data: {
        supplier_products_id,
        Quantity,
        unit_id,
        price,
        VAT,
        discount,
        // effective_date,
        updated_at: new Date()
      }
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedProductPricing, 'Product pricing updated successfully'));
  }

  /**
   * Soft deletes a product pricing record from the database.
   *
   * Instead of permanently removing the record, this method sets the `softDelete` flag to `true`,
   * marking the record as deleted without physically removing it from the database.
   *
   */
  public async deleteProductPricing(req: Request, res: Response): Promise<void> {
    const { productPricingId } = req.params;

    // Soft delete the product pricing record by setting softDelete flag to true
    await prisma.productPricing.delete({
      where: { product_pricing_id: productPricingId }
    });

    res.status(StatusCodes.NO_CONTENT).send(); // 204 No Content
  }
}
