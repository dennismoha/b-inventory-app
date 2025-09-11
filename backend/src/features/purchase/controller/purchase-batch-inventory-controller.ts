import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { FormattedBatchInventory } from '../interface/purchase.interface';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';




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
                        damaged_units:true,
                        payment_status:true,
                        supplierProduct: {
                            select: {
                                supplier: {
                                    select: {
                                        name: true,
                                    },
                                },
                                product: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
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
       res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, formattedBatchInventories,'batch inventory fetched succesfully'));
    }
}


