// controllers/UnitsController.ts
import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { unitSchema } from '@src/features/units/schema/units-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Unit } from '@src/features/units/interfaces/units.interface';
import { ConflictError } from '@src/shared/globals/helpers/error-handler';

export class UnitsController {
  /**
   * Fetch all units.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchUnits(req: Request, res: Response): Promise<void> {
    const message = 'Units fetched succesfully';
    const units: Unit[] = await prisma.units.findMany();
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, units, message));
  }

  /**
   * Create a new unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(unitSchema)
  public async createUnit(req: Request, res: Response): Promise<void> {
    const { unit, short_name, no_of_products } = req.body;
    const message = 'units created successfully';

    // Check if category_slug already exists
    const existingUnitShortName = await prisma.units.findUnique({
      where: { short_name }
    });

    const existingUnit = await prisma.units.findUnique({
      where: { short_name }
    });

    if (existingUnit || existingUnitShortName) {
      throw new ConflictError('resource arleady exists');
    }

    const newUnit = await prisma.units.create({
      data: { unit, short_name, no_of_products }
    });
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, newUnit, message));
    //json(newUnit);
  }

  /**
   * Update an existing unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */

  @joiValidation(unitSchema)
  public async updateUnit(req: Request, res: Response): Promise<void> {
    const { unit_id } = req.params;
    const { unit, short_name, no_of_products } = req.body;
    const message = 'unit updated succesfully';
    const updatedUnit: Unit = await prisma.units.update({
      where: { unit_id },
      data: { unit, short_name, no_of_products }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.CREATED, updatedUnit, message));
    //json(updatedUnit);
  }

  /**
   * Delete an existing unit.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteUnit(req: Request, res: Response): Promise<void> {
    const { unit_id } = req.params;

    await prisma.units.delete({
      where: { unit_id }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
