import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { StatusCodes } from 'http-status-codes';
import { BatchPayableResult, PurchasePayable, PurchasePayableResponse } from '@src/features/purchase/interface/purchase.interface';
import { JournalService } from '@src/features/accounting/controller/journals-controller';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Inventory } from '@src/constants';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { updateBatchPayableSchema } from '../schema/purchase-schema';

export class PurchasePayablesController {
  /**
   * Fetch all BatchPayables records
   */
  public async getAll(req: Request, res: Response) {
    const batchPayables = await prisma.batchPayables.findMany({
      where: { status: 'unsettled' },
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

  public async getPartialPurchasePayablesById(req: Request, res: Response) {
    const { id } = req.params;

    const batchPayables = await prisma.partialPurchasePayment.findMany({
      where: {
        purchase_id: id
      },
      select: {
        partial_purchase_id: true,
        purchase_id: true,
        full_amount: true,
        initial_payment: true,
        balance: true,
        payment_method: true,
        payment_date: true
      }
    });

    // transform the result so supplier & product names
    const formatted: PurchasePayable[] = batchPayables.map((item) => ({
      partial_payment_id: item.partial_purchase_id,
      purchase_id: item.purchase_id,
      amount_paid: item.full_amount,
      initial_payment: item.initial_payment,
      balance: item.balance,
      payment_method: item.payment_method,
      payment_date: item.payment_date
    }));

    // res.json(batchPayables2);

    res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, formatted, 'payables returned succesfully'));
  }

  /**
   *  I'll have to divide the lgic below to add that for partial payments too
   *  if paymenttype is credit we just create a batchpayable record else we update the partialPaymentslogic

   * 
   */

  // @joiValidation(updateBatchPayableSchema)
  // public async createPartialPurchasePayableById(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { account_id, amount } = req.body;

  //   const result: PurchasePayableResponse = await prisma.$transaction(async (tx) => {
  //     const purchase = await tx.purchase.findUnique({
  //       where: {
  //         purchase_id: id
  //       }
  //     });

  //     if (!purchase) {
  //       throw new BadRequestError('Invalid purchase ID');
  //     }

  //     if (purchase.payment_type === 'full') {
  //       throw new BadRequestError('This purchase was made as full payment, no outstanding balance exists');
  //     }

  //     if (purchase.payment_type === 'partial' && purchase.payment_status === 'paid') {
  //       throw new BadRequestError('This purchase has already been fully paid');
  //     }

  //     if (purchase.payment_type === 'credit' && purchase.payment_status === 'paid') {
  //       throw new BadRequestError('This purchase has already been fully paid');
  //     }

  //     if (Number(amount) > Number(purchase.total_purchase_cost)) {
  //       throw new BadRequestError(`Payment ${300} amount exceeds total purchase cost ${purchase.total_purchase_cost}`);
  //     }

  //     const inventoryAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type });
  //     if (inventoryAccount.account_id === account_id) {
  //       throw new BadRequestError('credit account cannot be equal to debit account');
  //     }
  //     // create a journal entry
  //     const journalEntry = await JournalService.createJournalEntry(tx, {
  //       transactionId: 'batchpayablepayment',
  //       description: 'purchase payment',
  //       lines: [
  //         {
  //           account_id: account_id!,
  //           credit: amount
  //         },
  //         {
  //           account_id: inventoryAccount.account_id,
  //           debit: amount
  //         }
  //       ]
  //     });

  //     console.log('journal entry is ', journalEntry);

  //     // update batch payables table
  //     const updateBatchPayable = await tx.batchPayables.update({
  //       where: {
  //         purchase_id: id
  //       },
  //       data: {
  //         total_paid: {
  //           increment: amount
  //         },
  //         balance_due: {
  //           decrement: amount
  //         }
  //       }
  //     });

  //     // if balance due is 0 update purchase payment status to settled
  //     const updatedPurchase =
  //       Number(updateBatchPayable.balance_due) === 0
  //         ? await tx.batchPayables.update({
  //             where: {
  //               purchase_id: id
  //             },
  //             data: {
  //               status: 'settled',
  //               settlement_date: new Date()
  //             }
  //           })
  //         : null;

  //     // update purchase payment status to paid
  //     if (Number(updateBatchPayable.balance_due) === 0) {
  //       await tx.purchase.update({
  //         where: {
  //           purchase_id: id
  //         },
  //         data: {
  //           payment_status: 'paid'
  //         }
  //       });
  //     }
  //     console.log('updated purchase is ', updatedPurchase);
  //     return { balance_due: updateBatchPayable.balance_due };
  //   });

  //   res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, result, 'Partial payable created successfully'));
  // }

  // batch payables payment algo

  @joiValidation(updateBatchPayableSchema)
  public async BatchPurchasePayablesPayment(req: Request, res: Response) {
    const { id } = req.params;
    const { account_id, amount } = req.body;

    const result: PurchasePayableResponse = await prisma.$transaction(async (tx) => {
      const purchase = await tx.batchPayables.findUnique({
        where: {
          purchase_id: id
        }
      });

      if (!purchase) {
        throw new BadRequestError('Invalid purchase ID');
      }

      if (purchase.payment_type === 'full') {
        throw new BadRequestError('This purchase was made as full payment, no outstanding balance exists');
      }

      if (purchase.payment_type === 'partial' && purchase.status === 'settled') {
        throw new BadRequestError('This purchase has already been fully paid');
      }

      // if (purchase.payment_type === 'credit' && purchase.status === 'paid') {
      //   throw new BadRequestError('This purchase has already been fully paid');
      // }

      if (Number(amount) > Number(purchase.balance_due)) {
        throw new BadRequestError(`Payment ${300} amount exceeds total purchase cost ${purchase.balance_due}`);
      }

      const inventoryAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type });
      if (inventoryAccount.account_id === account_id) {
        throw new BadRequestError('credit account cannot be equal to debit account');
      }
      // create a journal entry
      const journalEntry = await JournalService.createJournalEntry(tx, {
        transactionId: 'batchpayablepayment',
        description: 'purchase payment',
        lines: [
          {
            account_id: account_id!,
            credit: amount
          },
          {
            account_id: inventoryAccount.account_id,
            debit: amount
          }
        ]
      });

      console.log('journal entry is ', journalEntry);

      // update batch payables table
      const updateBatchPayable = await tx.batchPayables.update({
        where: {
          purchase_id: id
        },
        data: {
          total_paid: {
            increment: amount
          },
          balance_due: {
            decrement: amount
          }
        }
      });

      // if balance due is 0 update purchase payment status to settled
      const updatedPurchase =
        Number(updateBatchPayable.balance_due) === 0
          ? await tx.batchPayables.update({
              where: {
                purchase_id: id
              },
              data: {
                status: 'settled',
                settlement_date: new Date()
              }
            })
          : null;

      // update purchase payment status to paid
      if (Number(updateBatchPayable.balance_due) === 0) {
        await tx.purchase.update({
          where: {
            purchase_id: id
          },
          data: {
            payment_status: 'paid'
          }
        });
      }
      console.log('updated purchase is ', updatedPurchase);
      return { balance_due: updateBatchPayable.balance_due };
    });

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, result, 'Partial payable created successfully'));
  }
}

// type PurchasePayable = {partial_payment_id: string, purchase_id: string, amount_paid: number, initial_payment:number, balance:number, payment_method:string,payment_date:string}
