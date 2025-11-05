import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { assetSchema } from '@src/features/hrm/assets/schema/assets-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { ConflictError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Asset } from '@src/features/hrm/assets/interface/assets.interface';
import { JournalService } from '@src/features/accounting/controller/journals-controller';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Inventory } from '@src/constants';
import { Decimal } from '@prisma/client/runtime/library';

export class AssetsController {
  public async fetchAssets(req: Request, res: Response): Promise<void> {
    const assets: Asset[] = await prisma.assetRegister.findMany({
      include: {
        custodian: true
      }
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, assets, 'Assets fetched successfully'));
  }

  public async fetchAssetById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const asset = await prisma.assetRegister.findUnique({
      where: { id },
      include: { custodian: true }
    });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, asset, 'Asset fetched successfully'));
  }

  /**
   * Create a new asset
   */
  @joiValidation(assetSchema)
  public async createAsset(req: Request, res: Response): Promise<void> {
    const {
      assetTag,
      name,
      category,
      description,
      purchaseDate,
      purchaseCost,
      supplier,
      location,
      status,
      depreciation,
      usefulLifeYears,
      accountId // expense/cash account paying for asset
    }: {
      assetTag: string;
      name: string;
      category: 'CURRENT' | 'NON_CURRENT' | 'OTHER';
      description?: string | null;
      purchaseDate: Date;
      purchaseCost: Decimal;
      supplier?: string | null;
      location?: string | null;
      status?: string | null;
      depreciation?: number | null;
      usefulLifeYears?: number | null;
      accountId: string; // paying account (e.g. Cash or Bank)
    } = req.body;

    const asset = await prisma.$transaction(async (tx) => {
      // Check duplicate tag
      const existingAsset = await tx.assetRegister.findUnique({
        where: { assetTag }
      });
      if (existingAsset) {
        throw new ConflictError('Asset with this tag already exists');
      }
      const UsefulLifeYears = usefulLifeYears ? Number(usefulLifeYears) : null;
      const Depreciation = depreciation ? Number(depreciation) : null;

      //  Create Asset record
      const createdAsset = await tx.assetRegister.create({
        data: {
          assetTag,
          name,
          category,
          description: description ?? null,
          purchaseDate,
          purchaseCost: Number(purchaseCost),
          supplier: supplier ?? null,
          location: location ?? null,
          status: status ?? 'active',
          depreciation: Depreciation,
          usefulLifeYears: UsefulLifeYears,
          accountId: accountId ?? null
        }
      });

      // const cashAccount = await AccountController.findAccount({ tx, name: Account_Utilities.name, type: Account_Utilities.acc_type });
      const cashAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type }); //
      //  Post Journal Entry (Dr Asset, Cr Cash/Bank)
      await JournalService.createJournalEntry(tx, {
        transactionId: createdAsset.id, // link journal to this asset
        description: `Asset Purchase - ${name}`,
        lines: [
          {
            account_id: accountId,
            debit: purchaseCost
          },
          {
            account_id: cashAccount.account_id, // credit cash/bank
            credit: purchaseCost
          }
        ]
      });

      return createdAsset;
    });

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, asset, 'Asset created successfully'));
  }

  // public async createAsset(req: Request, res: Response): Promise<void> {
  //   const { assetTag } = req.body;

  //   const existingAsset = await prisma.assetRegister.findUnique({
  //     where: { assetTag }
  //   });

  //   if (existingAsset) {
  //     throw new ConflictError('Asset with this tag already exists');
  //   }

  //   const asset = await prisma.assetRegister.create({
  //     data: req.body
  //   });

  //   res
  //     .status(StatusCodes.CREATED)
  //     .send(GetSuccessMessage(StatusCodes.CREATED, asset, 'Asset created successfully'));
  // }

  /**
   * Update an asset
   */
  @joiValidation(assetSchema)
  public async updateAsset(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existingAsset = await prisma.assetRegister.findUnique({ where: { id } });
    if (!existingAsset) {
      throw new NotFoundError('Asset not found');
    }

    const updated = await prisma.assetRegister.update({
      where: { id },
      data: req.body
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updated, 'Asset updated successfully'));
  }

  /**
   * Delete an asset
   */
  public async deleteAsset(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existingAsset = await prisma.assetRegister.findUnique({ where: { id } });
    if (!existingAsset) {
      throw new NotFoundError('Asset not found');
    }

    await prisma.assetRegister.delete({ where: { id } });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, null, 'Asset deleted successfully'));
  }
}
