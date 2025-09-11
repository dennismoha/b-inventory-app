// controllers/SubCategoriesController.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { subCategorySchema } from '@src/features/categories/schema/categories-schema';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { SubCategory } from '@src/features/categories/interfaces/categories.interface';
import { ConflictError } from '@src/shared/globals/helpers/error-handler';
// import { ConflictError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
// import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
// import { Category } from '@src/features/categories/interfaces/categories.interface';

// const prisma = new PrismaClient();

export class SubCategoriesController {
  /**
   * Fetch all subcategories.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchSubCategories(req: Request, res: Response): Promise<void> {
    const message = 'success';
    const subcategories: SubCategory[] = await prisma.subCategories.findMany();
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, subcategories, message));
  }

  /**
   * Create a new subcategory.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(subCategorySchema)
  public async createSubCategory(req: Request, res: Response): Promise<void> {
    const subcategory_name: string = req.body.subcategory_name;
    const description: string = req.body.description;

    // Check if subcategory_name already exists

    const existingSubCategory: SubCategory | null = await prisma.subCategories.findUnique({
      where: { subcategory_name }
    });

    // If a record with the same composite key exists, return an error
    if (existingSubCategory) {
      throw new ConflictError('A subcategory with this name already exists for the specified category.');
    }

    const subCategory = await prisma.subCategories.create({
      data: { subcategory_name, description }
    });
    res.status(StatusCodes.CREATED).json(subCategory);
  }

  /**
   * Update an existing subcategory.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(subCategorySchema)
  public async updateSubCategory(req: Request, res: Response): Promise<void> {
    const { subcategory_id } = req.params;
    const { subcategory_name, description } = req.body;

    // Check if subcategory_name already exists

    const existingSubCategory: SubCategory | null = await prisma.subCategories.findUnique({
      where: { subcategory_name }
    });

    // If a record with the same composite key exists, return an error
    if (existingSubCategory) {
      throw new ConflictError('A subcategory with this name already exists for the specified category.');
    }

    const updatedSubCategory = await prisma.subCategories.update({
      where: { subcategory_id },
      data: { subcategory_name, description }
    });
    res.status(StatusCodes.OK).json(updatedSubCategory);
  }

  /**
   * Delete an existing subcategory.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteSubCategory(req: Request, res: Response): Promise<void> {
    const { subcategory_id } = req.params;

    await prisma.subCategories.delete({
      where: { subcategory_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
