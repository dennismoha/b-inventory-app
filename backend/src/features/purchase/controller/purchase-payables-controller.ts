import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { StatusCodes } from 'http-status-codes';
import { BatchPayableResult } from '@src/features/purchase/interface/purchase.interface';

export class PurchasePayablesController {
  /**
   * Fetch all BatchPayables records
   */
  public async getAll(req: Request, res: Response) {
    const batchPayables = await prisma.batchPayables.findMany({
      select: {
        payable_id: true,
        purchase_id: true,
        amount_due: true,
        total_paid: true,
        balance_due: true,
        payment_type: true,
        settlement_date: true,
        batchpayable: {
          select: {
            batch: true,
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

    // transform the result so supplier & product names
    const formatted: BatchPayableResult[] = batchPayables.map((item) => ({
      payable_id: item.payable_id,
      purchase_id: item.purchase_id,
      amount_due: item.amount_due,
      total_paid: item.total_paid,
      balance_due: item.balance_due,
      payment_type: item.payment_type,
      settlement_date: item.settlement_date,
      batch: item.batchpayable?.batch,
      supplier_name: item.batchpayable?.supplierProduct?.supplier?.name,
      product_name: item.batchpayable?.supplierProduct?.product?.name
    }));

    // res.json(batchPayables2);
    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, formatted, 'payables returned succesfully'));

    // res.status(200).json(batchPayables);
  }
}
