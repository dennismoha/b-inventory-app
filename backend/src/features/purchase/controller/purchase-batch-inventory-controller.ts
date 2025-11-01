import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { FormattedBatchInventory } from '../interface/purchase.interface';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { BadRequestError, NotFoundError } from '@src/shared/globals/helpers/error-handler';

type AllowedActions = 'activate' | 'deactivate' | 'discontinue';
export class BatchInventoryController {
  public async getAll(req: Request, res: Response) {
    //    const batchInventories2 = await prisma.batchInventory.findMany({
    //     include:{
    //         purchase:true
    //     }
    //    });
    const batchInventories = await prisma.batchInventory.findMany({
      select: {
        batch_inventory_id: true,
        purchase_id: true,
        total_units: true,
        status: true,
        created_at: true,
        purchase: {
          select: {
            batch: true,
            damaged_units: true,
            payment_status: true,
            supplierProduct: {
              select: {
                supplier: {
                  select: {
                    name: true
                  }
                },
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const formattedBatchInventories: FormattedBatchInventory[] = batchInventories.map((batch) => ({
      batchInventory: batch.batch_inventory_id,
      purchaseId: batch.purchase_id,
      totalUnits: batch.total_units,
      status: batch.status,
      createdAt: batch.created_at,
      batch: batch.purchase.batch,
      damaged_units: batch.purchase.damaged_units,
      supplierName: batch.purchase.supplierProduct.supplier.name,
      payment_status: batch.purchase.payment_status,
      productName: batch.purchase.supplierProduct.product.name
    }));
    // res.json(batchInventories2);
    res
      .status(StatusCodes.ACCEPTED)
      .send(GetSuccessMessage(StatusCodes.ACCEPTED, formattedBatchInventories, 'batch inventory fetched succesfully'));
  }

  /**
   * Toggle between active and inactive status,
   * 1) set to inavtive, if active
   * params batchInventoryid
   * Now we check if status on batch inventory is active,   if yes set to inactive. also set all inventory under this batch inventory to inactive
   *
   * 2) set to active, if inactive . we only need to have only a single active item in the inventory for each supplier_products id and that should also coincide with the bacthc inventory.
   * params batchInventoryid
   * Now we check if status on batch inventory is inactive,   if yes check if there is any other batch inventory for the same product which is active, if yes set to pending.
   *   but remember the inventory status will still read inactive untill:
   *    1) user sets the inventory under this batch inventory to active manually one by one from inventory module
   *   2) * if no other batch inventory for the same product is active, then set this batch inventory to active. also set all inventory under this batch inventory to active
   *
   * - If user want to continue with this batch as active, then he should first deactivate the other batch inventory for the same product. and then set this to active.
   *
   *
   *
   */

  public async toggleStatus(req: Request, res: Response) {
    const { id } = req.params;

    const { batchInventoryId, status } = req.body;

    const allowedActions = ['activate', 'deactivate', 'discontinue'] as const;
    const action = String(req.query.action || '').toLowerCase();

    if (!allowedActions.includes(action as AllowedActions))
      throw new BadRequestError(`Invalid or missing action. Allowed: ${allowedActions.join(', ')}`);

    // from active to inactive

    if (!id || !batchInventoryId) {
      throw new BadRequestError('Batch inventory id is required');
    }

    if (id !== String(batchInventoryId)) {
      throw new BadRequestError('Bad Request: Mismatched batch inventory id');
    }

    const batchInventory = await prisma.batchInventory.findUnique({
      where: { batch_inventory_id: batchInventoryId, status },
      include: {
        purchase: {
          include: {
            supplierProduct: true
          }
        },
        BatchInventory: true
      }
    });

    if (!batchInventory) {
      throw new NotFoundError('Batch inventory not found');
    }

    const currentStatus = batchInventory.status;
    let message = '';

    // Optional: block changes to finished/discontinued
    if (['FINISHED'].includes(currentStatus)) {
      throw new BadRequestError('Cannot modify a finished  batch');
    }

    switch (action) {
      case 'deactivate':
        if (currentStatus === 'INACTIVE') throw new BadRequestError('Batch is already inactive');

        await prisma.$transaction([
          prisma.batchInventory.update({
            where: { batch_inventory_id: batchInventoryId },
            data: { status: 'INACTIVE' }
          }),
          prisma.inventory.updateMany({
            where: { batch_inventory_id: batchInventoryId },
            data: { status: 'INACTIVE' }
          })
        ]);

        message = 'Batch inventory set to INACTIVE successfully';
        break;

      case 'activate': {
        const activeBatchExists = await prisma.batchInventory.findFirst({
          where: {
            supplier_products_id: batchInventory.supplier_products_id,
            status: 'ACTIVE',
            NOT: { batch_inventory_id: batchInventoryId }
          }
        });
        // if(currentStatus !== 'INACTIVE' ){
        //   throw new BadRequestError('Batch inventory is not inactive');
        // }

        if (activeBatchExists) {
          await prisma.batchInventory.update({
            where: { batch_inventory_id: batchInventoryId },
            data: { status: 'PENDING' }
          });
          message = 'Batch inventory set to PENDING (another active batch exists)';
        } else {
          await prisma.$transaction([
            prisma.batchInventory.update({
              where: { batch_inventory_id: batchInventoryId },
              data: { status: 'ACTIVE' }
            }),
            prisma.inventory.updateMany({
              where: { batch_inventory_id: batchInventoryId },
              data: { status: 'ACTIVE' }
            })
          ]);
          message = 'Batch inventory set to ACTIVE successfully';
        }
        break;
      }

      case 'discontinue':
        await prisma.$transaction([
          prisma.batchInventory.update({
            where: { batch_inventory_id: batchInventoryId },
            data: { status: 'DISCONTINUED' }
          }),
          prisma.inventory.updateMany({
            where: { batch_inventory_id: batchInventoryId },
            data: { status: 'DISCONTINUED' }
          })
        ]);
        message = 'Batch inventory and related inventory discontinued successfully';

        break;
      default:
        throw new BadRequestError('Bad Request: Invalid action');
    }

    // if(batchInventory.status !== 'ACTIVE'){
    //   throw new BadRequestError('Bad Request');
    // }

    // if (batchInventory.status === 'ACTIVE') {
    //   // Set to inactive
    //   await prisma.batchInventory.update({
    //     where: { batch_inventory_id: batchInventoryId },
    //     data: { status: 'INACTIVE' }
    //   });

    //   await prisma.inventory.updateMany({
    //     where: { batch_inventory_id: batchInventoryId },
    //     data: { status: 'INACTIVE' }
    //   });

    // }

    // else {
    //   // Set to active or pending based on other active batches
    //   const activeBatches = await prisma.batchInventory.findMany({
    //     where: {
    //       purchase: {
    //         supplier_products_id: batchInventory.purchase.supplier_products_id
    //       },
    //       status: 'active'
    //     }
    //   });

    //   if (activeBatches.length > 0) {
    //     // Set to pending
    //     await prisma.batchInventory.update({
    //       where: { batch_inventory_id: Number(batchInventoryId) },
    //       data: { status: 'pending' }
    //     });
    //   } else {
    //     // Set to active
    //     await prisma.batchInventory.update({
    //       where: { batch_inventory_id: Number(batchInventoryId) },
    //       data: { status: 'active' }
    //     });

    //     await prisma.inventory.updateMany({
    //       where: { batch_inventory_id: Number(batchInventoryId) },
    //       data: { status: 'active' }
    //     });
    //   }
    // }
    res.status(200).json({ status: 'success', message });

    // res
    //   .status(StatusCodes.OK)
    //   .send(GetSuccessMessage(StatusCodes.OK, message, 'Batch inventory status updated successfully'));
  }
}
