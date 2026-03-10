/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { transactionSchema } from '@src/features/transactions/schema/transactions-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
// import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import {
  PayableStatus,
  Transaction,
  TransactionProduct,
  TransactionProductItems
} from '@src/features/transactions/interfaces/transaction.interface';
// import { Decimal } from '@prisma/client/runtime/library';

import crypto from 'crypto';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Bank, Account_Inventory } from '@src/constants';
import { JournalService } from '@src/features/accounting/controller/journals-controller';

/**
 * when and showing them to user have a productsummary remaining total for each product and inventory_quantity for each.
 *
 * Now, if  quantity picked by user >  inventory stock but < productSummary reminaing total then we will have to load a new batch to inventiry
 *  .... etc,,, etc
 * if greater than all then it means that what is ordered  > than our stock.
 * if < inventory_stock then no need for loading another batch
 *
 *
 */

function money(v: number) {
  return Math.round((v + Number.EPSILON) * 100) / 100; // round to 2dp to avoid floating noise
}

export class TransactionsController {
  /**
   * Fetch all transactions.
   */
  public async fetchTransactions(req: Request, res: Response): Promise<void> {
    const transactions: Transaction[] = await prisma.transaction.findMany({
      include: {
        customer: true, // If customer is provided,
        Sales: true
      }
    });
    const message = utilMessage.fetchedMessage('transactions');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, transactions, message));
  }

  /**
   * Create a new transaction.
   */

  @joiValidation(transactionSchema)
  public async createTransaction(req: Request, res: Response): Promise<void> {
    const { cartProducts, customerId, paymentMethod, totalCost }: TransactionProductItems = req.body;

    // POS session check
    const posSession = req.headers['pos_session'];
    if (!posSession || typeof posSession !== 'string') {
      throw new BadRequestError('No active POS session');
    }

    // Resolve opening/closing balance
    const ocb = await prisma.openingClosingBalance.findFirst({
      where: { pos_session_id: posSession },
      select: { cash_bank_ledger_id: true, id: true }
    });
    if (!ocb) {
      throw new BadRequestError('POS session not linked to opening/closing balance');
    }

    // ────────────────────────────
    // DB Transaction
    // ────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      const transactionId = crypto.randomUUID();

      const transaction = await tx.transaction.create({
        data: {
          transactionId,
          customerId: customerId ?? null,
          totalCost: money(totalCost.total),
          subtotal: money(totalCost.subtotal),
          paymentMethod: 'CASH'
        }
      });

      const txProductsData: Array<{
        inventoryId: string;
        supplier_products_id: string;
        quantity: number;
        stock_quantity: number | Decimal;
        BatchInventoryId: string;
        productName: string;
        price: number;
        VAT: number;
        discount: number;
        productSubTotalCost: number;
        productTotalCost: number;
        transactionId: string;
      }> = [];

      for (const item of cartProducts) {
        let totalAllocated = 0;
        console.log('each items is ', item);
        if (item.needsBatchLoad) {
          await TransactionsController.allocateNextBatch(tx, item, transactionId);
          console.log('items need batch load');
        } else {
          // No batch allocation needed (pull directly from inventory)
          totalAllocated = item.quantity;

          const productSubTotalCost = money(item.price * item.quantity);
          const productTotalCost = money(item.price * item.quantity * (1 + item.VAT / 100) - item.discount);

          txProductsData.push({
            inventoryId: item.inventoryId,
            supplier_products_id: item.supplier_products_id,
            BatchInventoryId: item.batch_inventory_id, // not batch-allocated
            stock_quantity: item.stock_quantity,
            quantity: item.quantity,
            productName: item.productName,
            price: item.price,
            VAT: Number(item.VAT),
            discount: Number(item.discount),
            productSubTotalCost,
            productTotalCost,
            transactionId
          });

          const inventoryUpdates = await tx.inventory.findUnique({
            where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE', batch_inventory_id: item.batch_inventory_id }
          });

          if (!inventoryUpdates) {
            throw new BadRequestError('item not found in inventory');
          }

          console.log('inventory updaes', inventoryUpdates.stock_quantity);
          console.log('item stock', item.stock_quantity);
          console.log('item quantity', item.quantity);

          await tx.productSummary.update({
            where: { supplier_products_id: item.supplier_products_id },
            data: {
              total_sold: { increment: totalAllocated }
            }
          });

          if (Number(inventoryUpdates.stock_quantity) - Number(item.quantity) === 0) {
            console.log(
              ' we are here ',
              Number(inventoryUpdates.stock_quantity) - Number(item.stock_quantity) === 0,
              'asnwer is ',
              Number(inventoryUpdates.stock_quantity) - Number(item.stock_quantity)
            );
            await tx.batchInventory.update({
              where: { batch_inventory_id: item.batch_inventory_id },
              data: { status: 'FINISHED' }
            });

            await tx.inventory.update({
              where: { supplier_products_id: item.supplier_products_id },
              data: { stock_quantity: 0 }
            });

            const nextBatchItem = await tx.batchInventory.findFirst({
              where: { supplier_products_id: item.supplier_products_id, status: 'PENDING' },
              orderBy: {
                created_at: 'desc'
              },
              select: {
                total_units: true,
                supplier_products_id: true,
                batch_inventory_id: true,
                purchase: {
                  select: {
                    unit_id: true
                  }
                }
              }
            });

            if (!nextBatchItem) {
              await tx.inventory.update({
                where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
                data: {
                  status: 'FINISHED'
                }
              });

              await tx.batchLifecycle.update({
                where: { batch_id: item.batch_inventory_id },
                data: {
                  ended_at: new Date()
                }
              });
            } else {
              await tx.inventory.upsert({
                where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
                create: {
                  supplier_products_id: nextBatchItem.supplier_products_id,
                  batch_inventory_id: nextBatchItem.batch_inventory_id,
                  stock_quantity: nextBatchItem.total_units,
                  unit_id: nextBatchItem.purchase.unit_id,
                  status: 'ACTIVE'
                },
                update: {
                  batch_inventory_id: nextBatchItem.batch_inventory_id,
                  stock_quantity: nextBatchItem.total_units,
                  status: 'ACTIVE'
                }
              });

              await tx.batchLifecycle.create({
                data: {
                  batch_id: nextBatchItem.batch_inventory_id
                }
              });
            }
          } else {
            await tx.inventory.update({
              where: { supplier_products_id: item.supplier_products_id },
              data: { stock_quantity: { decrement: totalAllocated } }
            });
          }
        }

        // Update inventory & product summary
        // const inventoryUpdates = await tx.inventory.update({
        //   where: { supplier_products_id: item.supplier_products_id },
        //   data: { stock_quantity: { decrement: totalAllocated } }
        // });
      }

      // Insert all product lines
      if (txProductsData.length > 0) {
        await tx.sales.createMany({ data: txProductsData });
      }

      // Handle payments
      if (paymentMethod === 'CASH') {
        console.log('WE ARE IN THE CASH ACCOUNT ');
        const inventoryAccount = await AccountController.findAccount({
          tx,
          name: Account_Inventory.name,
          type: Account_Inventory.acc_type
        });
        const BankAccount = await AccountController.findAccount({ tx, name: Account_Bank.name, type: Account_Bank.acc_type });
        if (!inventoryAccount && !BankAccount) {
          throw new BadRequestError('Account not configured');
        }
        console.log('inventory account is ', inventoryAccount);

        const journalEntry = await JournalService.createJournalEntry(tx, {
          transactionId: 'purchase_payment',
          description: 'purchase payment',
          lines: [
            {
              account_id: inventoryAccount.account_id!,
              credit: new Decimal(totalCost.total)
            },
            {
              account_id: BankAccount.account_id,
              debit: new Decimal(totalCost.total)
            }
          ]
        });

        console.log('journal entry is ', journalEntry);
      } else if (paymentMethod === 'CREDIT') {
        if (!customerId) {
          throw new BadRequestError('Credit sales require a customer');
        }

        await tx.customerReceivable.create({
          data: {
            customer_id: customerId,
            total_Amount: money(totalCost.total),
            transaction_id: transactionId
          }
        });
      }

      return { transaction, products: txProductsData };
    });

    const message = utilMessage.created('transaction');
    res.json({ message, result });
    // res
    //   .status(StatusCodes.CREATED)
    //   .send(GetSuccessMessage(StatusCodes.CREATED, result, message));
  }

  // static async allocateNextBatch(
  //   tx: PrismaTransactionalClient,
  //   item: TransactionProduct,
  //   transactionId: string
  // ) {
  //   // ===================================================
  //   // 1 Calculate remaining quantity to allocate
  //   // ===================================================
  //   // let remainingQuantity = item.quantity - Number(item.stock_quantity);
  //   let remainingQuantity = Number(item.stock_quantity) - item.quantity;
  //   if (remainingQuantity < 0) {
  //     throw new BadRequestError(
  //       `Invalid calculation: remaining quantity for ${item.productName} is negative.`
  //     );
  //   }

  //   const txProductsData: Array<{
  //     inventoryId: string;
  //     supplier_products_id: string;
  //     batch_id: string;
  //     quantity: number;
  //     productName: string;
  //     price: number;
  //     VAT: number;
  //     discount: number;
  //     productSubTotalCost: number;
  //     productTotalCost: number;
  //     transactionId: string;
  //   }> = [];

  //   // ===================================================
  //   // 2️ End lifecycle + mark current batch as FINISHED
  //   // ===================================================
  //   await tx.batchLifecycle.update({
  //     where: { batch_id: item.batch_inventory_id, ended_at: null },
  //     data: { ended_at: new Date() },
  //   });

  //   await tx.batchInventory.update({
  //     where: {
  //       batch_inventory_id: item.batch_inventory_id,
  //       status: 'ACTIVE',
  //     },
  //     data: { status: 'FINISHED' },
  //   });

  //   await tx.inventory.update({
  //     where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
  //     data: {
  //       status: 'FINISHED'
  //     }
  //   });

  //   // ===================================================
  //   // 3️ Fetch all pending batches FIFO order
  //   // ===================================================
  //   const pendingBatches = await tx.batchInventory.findMany({
  //     where: {
  //       supplier_products_id: item.supplier_products_id,
  //       status: 'PENDING',
  //     },
  //     orderBy: { created_at: 'asc' },
  //   });

  //   if (!pendingBatches.length) {
  //     throw new BadRequestError(
  //       `No pending batch available for product: ${item.productName}`
  //     );
  //   }

  //   // ===================================================
  //   // 4️ Iterate through pending batches until filled
  //   // ===================================================
  //   let currentBatchIndex = 0;
  //   let partiallyUsedBatchId: string | null = null;
  //   const usedBatches: string[] = [];

  //   while (remainingQuantity > 0 && currentBatchIndex < pendingBatches.length) {
  //     const batch = pendingBatches[currentBatchIndex];
  //     const batchUnits = batch.total_units;

  //     const useQty = Math.min(batchUnits, remainingQuantity);
  //     const remainingUnits = batchUnits - useQty;

  //     // Activate batch
  //     await tx.batchInventory.update({
  //       where: { batch_inventory_id: batch.batch_inventory_id },
  //       data: { status: 'ACTIVE' },
  //     });

  //     // Start new lifecycle for batch
  //     await tx.batchLifecycle.create({
  //       data: {
  //         batch_id: batch.batch_inventory_id,
  //         started_at: new Date(),
  //       },
  //     });

  //     await tx.inventory.update({
  //       where: { batch_inventory_id: batch.batch_inventory_id },
  //       data: {
  //         status: 'ACTIVE',
  //         stock_quantity: batchUnits,
  //       },
  //     });

  //     // Deduct consumed quantity
  //     if (remainingUnits > 0) {
  //       // Partial use
  //       await tx.batchInventory.update({
  //         where: { batch_inventory_id: batch.batch_inventory_id },
  //         data: { total_units: remainingUnits },
  //       });

  //       await tx.inventory.update({
  //         where: { batch_inventory_id: batch.batch_inventory_id },
  //         data: { stock_quantity: remainingUnits },
  //       });

  //       partiallyUsedBatchId = batch.batch_inventory_id;
  //       remainingQuantity = 0; // done
  //     } else {
  //       // Fully consumed
  //       await tx.batchInventory.update({
  //         where: { batch_inventory_id: batch.batch_inventory_id },
  //         data: { status: 'FINISHED', total_units: 0 },
  //       });

  //       await tx.batchLifecycle.updateMany({
  //         where: { batch_id: batch.batch_inventory_id, ended_at: null },
  //         data: { ended_at: new Date() },
  //       });

  //       usedBatches.push(batch.batch_inventory_id);
  //       remainingQuantity -= useQty;
  //     }

  //     currentBatchIndex++;
  //   }

  //   // ===================================================
  //   // 5️ Preload the next pending batch (if any)
  //   // ===================================================
  //   if (remainingQuantity <= 0) {
  //     const nextBatch = await tx.batchInventory.findFirst({
  //       where: {
  //         supplier_products_id: item.supplier_products_id,
  //         status: 'PENDING',
  //       },
  //       orderBy: { created_at: 'asc' },
  //     });

  //     if (nextBatch) {
  //       await tx.batchInventory.update({
  //         where: { batch_inventory_id: nextBatch.batch_inventory_id },
  //         data: { status: 'ACTIVE' },
  //       });

  //       await tx.inventory.updateMany({
  //         where: { batch_inventory_id: nextBatch.batch_inventory_id },
  //         data: { status: 'ACTIVE', stock_quantity: nextBatch.total_units },
  //       });

  //       await tx.batchLifecycle.create({
  //         data: {
  //           batch_id: nextBatch.batch_inventory_id,
  //           started_at: new Date(),
  //         },
  //       });
  //     }
  //   }

  //   // ===================================================
  //   // 6️ Update product summary & cost tracking
  //   // ===================================================
  //   await tx.productSummary.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: {
  //       total_received: item.total_stock_quantity - Number(item.stock_quantity),
  //       total_sold: { increment: item.quantity },
  //     },
  //   });

  //   const productSubTotalCost = money(item.price * Number(item.stock_quantity));
  //   const productTotalCost = money(
  //     item.price * Number(item.stock_quantity) * (1 + item.VAT / 100) -
  //     item.discount
  //   );

  //   txProductsData.push({
  //     inventoryId: item.inventoryId,
  //     supplier_products_id: item.supplier_products_id,
  //     batch_id: item.batch_inventory_id,
  //     quantity: item.quantity,
  //     productName: item.productName,
  //     price: item.price,
  //     VAT: Number(item.VAT),
  //     discount: Number(item.discount),
  //     productSubTotalCost,
  //     productTotalCost,
  //     transactionId,
  //   });

  //   // ===================================================
  //   // 7️ Return result summary
  //   // ===================================================
  //   return {
  //     usedBatches,
  //     partiallyUsedBatchId,
  //     remainingQuantity,
  //     txProductsData,
  //   };
  // }

  /// start of sample
  // static async allocateNextBatch(tx: PrismaTransactionalClient, item: TransactionProduct, transactionId: string) {
  //   // ===================================================
  //   // 1. Calculate remaining quantity after deduction
  //   // ===================================================
  //   const remainingQuantity = item.quantity - Number(item.stock_quantity);
  //   const txProductsData: Array<{
  //     inventoryId: string;
  //     supplier_products_id: string;
  //     batch_id: string;
  //     quantity: number;
  //     productName: string;
  //     price: number;
  //     VAT: number;
  //     discount: number;
  //     productSubTotalCost: number;
  //     productTotalCost: number;
  //     transactionId: string;
  //   }> = [];

  //   if (remainingQuantity < 0) {
  //     throw new BadRequestError(`Invalid calculation: remaining quantity for ${item.productName} is negative.`);
  //   }

  //   // ===================================================
  //   // 2. End lifecycle of current active batch
  //   // ===================================================
  //   await tx.batchLifecycle.updateMany({
  //     where: { batch_id: item.batch_inventory_id, ended_at: null },
  //     data: { ended_at: new Date() }
  //   });

  //   // ===================================================
  //   // 3. Mark current batch as FINISHED
  //   // ===================================================
  //   await tx.batchInventory.updateMany({
  //     where: {
  //       batch_inventory_id: item.batch_inventory_id,
  //       status: 'ACTIVE'
  //     },
  //     data: { status: 'FINISHED' }
  //   });

  //   // ===================================================
  //   // 4. Fetch the next FIFO batch (must exist & PENDING)
  //   // ===================================================
  //   const nextBatch = await tx.batchInventory.findFirst({
  //     where: {
  //       supplier_products_id: item.supplier_products_id,
  //       status: 'PENDING'
  //     },
  //     orderBy: { created_at: 'asc' }
  //   });

  //   if (!nextBatch) {
  //     throw new BadRequestError(`No pending batch available for product: ${item.productName}`);
  //   }

  //   // ===================================================
  //   // 5. Activate the new batch in inventory
  //   // ===================================================
  //   const loadNewBatch = await tx.inventory.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: {
  //       stock_quantity: nextBatch.total_units,
  //       status: 'ACTIVE',
  //       batch_inventory_id: nextBatch.batch_inventory_id
  //     }
  //   });

  //   if (Number(loadNewBatch.stock_quantity) <= 0) {
  //     throw new BadRequestError(`Next batch for ${item.productName} has no stock units.`);
  //   }

  //   // ===================================================
  //   // 6. Start lifecycle record for new batch
  //   // ===================================================
  //   await tx.batchLifecycle.create({
  //     data: {
  //       batch_id: nextBatch.batch_inventory_id,
  //       started_at: new Date()
  //     }
  //   });

  //   // ===================================================
  //   // 7. Deduct the carry-over quantity from new batch
  //   // ===================================================
  //   const finalQuantity = nextBatch.total_units - remainingQuantity;
  //   console.log('final Quantity is ', finalQuantity);

  //   if (finalQuantity < 0) {
  //     throw new BadRequestError(`Next batch for ${item.productName} does not have enough to cover carry-over.`);
  //   }

  //   await tx.inventory.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: { stock_quantity: finalQuantity }
  //   });

  //   // ===================================================
  //   // 8. Update product summary (tracking totals)
  //   // ===================================================
  //   await tx.productSummary.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: {
  //       total_received: item.total_stock_quantity - Number(item.stock_quantity),
  //       total_sold: { increment: item.quantity }
  //     }
  //   });

  //   const productSubTotalCost = money(item.price * Number(item.stock_quantity));
  //   const productTotalCost = money(item.price * Number(item.stock_quantity) * (1 + item.VAT / 100) - item.discount);

  //   txProductsData.push({
  //     inventoryId: item.inventoryId,
  //     supplier_products_id: item.supplier_products_id,
  //     batch_id: item.batch_inventory_id,
  //     quantity: item.quantity,
  //     productName: item.productName,
  //     price: item.price,
  //     VAT: Number(item.VAT),
  //     discount: Number(item.discount),
  //     productSubTotalCost,
  //     productTotalCost,
  //     transactionId
  //   });
  // }

  // end of sample

  // @joiValidation(transactionSchema)
  // public async createTransaction(req: Request, res: Response): Promise<void> {
  //   const { cartProducts, customerId, paymentMethod, totalCost }: TransactionProductItems = req.body;

  //   // POS session check
  //   const posSession = req.headers['pos_session'];
  //   if (!posSession || typeof posSession !== 'string') {
  //     throw new BadRequestError('No active POS session');
  //   }

  //   // Resolve opening/closing balance
  //   const ocb = await prisma.openingClosingBalance.findFirst({
  //     where: { pos_session_id: posSession },
  //     select: { cash_bank_ledger_id: true, id: true }
  //   });
  //   if (!ocb) {
  //     throw new BadRequestError('POS session not linked to opening/closing balance');
  //   }

  //   // ────────────────────────────
  //   // DB Transaction
  //   // ────────────────────────────
  //   const result = await prisma.$transaction(async (tx) => {
  //     const transactionId = crypto.randomUUID();

  //     const transaction = await tx.transaction.create({
  //       data: {
  //         transactionId,
  //         customerId: customerId ?? null,
  //         totalCost: money(totalCost.total),
  //         subtotal: money(totalCost.subtotal),
  //         paymentMethod: 'CASH'
  //       }
  //     });

  //     const txProductsData: Array<{
  //       inventoryId: string;
  //       supplier_products_id: string;
  //       quantity: number;
  //       stock_quantity: number | Decimal;
  //       BatchInventoryId: string;
  //       productName: string;
  //       price: number;
  //       VAT: number;
  //       discount: number;
  //       productSubTotalCost: number;
  //       productTotalCost: number;
  //       transactionId: string;
  //     }> = [];

  //     for (const item of cartProducts) {
  //       let totalAllocated = 0;

  //       if (item.needsBatchLoad) {
  //         await TransactionsController.allocateNextBatch(tx, item, transactionId);
  //         // FIFO batch allocation
  //         // we subtract items.stock_quantity from inventory.stock_quantity to get second_batch for example
  //         //
  //         // we update the proper tables with that action. productSummary.total_sold for that respective supplier_product_id
  //         // we log that batch in the  batchLifecyles with end time
  //         // we find , fetch the next batch from batchInventorystock with status pending order by dates and updated it to 'Active' and also update the state of the previous batch to finished
  //         // we update the Inventorystock for that supplier_products_id with the new batch and total
  //         // we update the batchLifeCycle with the details of the new batch and start_date
  //         //  we subtract the second batch from that inventory
  //         // then we update the resepctive tables with the new subtractions. that is the productSummary. then we continue

  //         // we subtract items.stock_quantity from inventory.stock_quantity to get second_batch for example
  //         // const remaining_quantity = Number(item.stock_quantity) - item.quantity;

  //         // // we log that batch in the  batchLifecyles with end time
  //         // const lifecycleUpdate = await tx.batchLifecycle.update({
  //         //     where: { batch_id: item.batch_inventory_id },
  //         //     data:{ended_at: new Date()}
  //         //   });

  //         // we find , fetch the next batch from batchInventorystock with status pending order by dates and updated it to 'Active' and also update the state of the previous batch to finished

  //         // const updatePreviousBatchStateToFinished = await tx.batchInventory.update({
  //         //   where: {batch_inventory_id: item.batch_inventory_id},
  //         //   data: {status:'FINISHED'}
  //         // });

  //         // // fetch the next batch from batch inventoryStock
  //         // const batches = await tx.batchInventory.findFirst({
  //         //   where :{
  //         //     supplier_products_id: item.supplier_products_id,
  //         //     status: 'PENDING'
  //         //   },
  //         //   orderBy: {created_at:'asc'}
  //         // });

  //         // if (!batches) {
  //         //   throw new BadRequestError(
  //         //     `No active batches available for product: ${item.productName}`
  //         //   );
  //         // }

  //         // we update the Inventorystock for that supplier_products_id with the new batch and total
  //         // const updateInventoryWithNewBatch = await tx.inventory.update({
  //         //   where:{supplier_products_id: item.supplier_products_id},
  //         //   data:{stock_quantity: batches?.total_units, status:'ACTIVE', batch_inventory_id: batches?.batch_inventory_id}
  //         // });

  //         // // we update the batchLifeCycle with the details of the new batch and start_date
  //         // const updateBatchLifeCycleWithNewBatch = await tx.batchLifecycle.create({
  //         //   data:{batch_id: batches!.batch_inventory_id, started_at: new Date()}
  //         // });

  //         //  //  we subtract the second batch from that inventory
  //         // const newBatchInventoryUpdates = await tx.inventory.update({
  //         //   where: {supplier_products_id: item.supplier_products_id},
  //         //   data:{stock_quantity: batches!.total_units - remaining_quantity}
  //         // });

  //         //    // we update the proper tables with that action. productSummary.total_sold for that respective supplier_product_id
  //         // const logLastBatchItems = await tx.productSummary.update({
  //         //   where: { supplier_products_id: item.supplier_products_id },
  //         //   data: { total_received: item.total_stock_quantity - Number(item.stock_quantity) },
  //         // });

  //         // const batches = await tx.batchInventory.findMany({
  //         //   where: {
  //         //     supplier_products_id: item.supplier_products_id,
  //         //     remaining_quantity: { gt: 0 },
  //         //     status: 'ACTIVE',
  //         //   },
  //         //   orderBy: [{ arrival_date: 'asc' }, { created_at: 'asc' }],
  //         //   select: { id: true, remaining_quantity: true, status: true },
  //         // });

  //         // let need = item.quantity;
  //         // for (const b of batches) {
  //         //   if (need <= 0) break;

  //         //   const take = Math.min(Number(b.remaining_quantity), need);

  //         //   await tx.batchInventory.update({
  //         //     where: { id: b.id },
  //         //     data: { remaining_quantity: { decrement: take } },
  //         //   });

  //         //   await tx.batchLifecycle.upsert({
  //         //     where: { batch_id: b.id },
  //         //     update: {},
  //         //     create: { batch_id: b.id },
  //         //   });

  //         //   const post = await tx.batchInventory.findUnique({
  //         //     where: { id: b.id },
  //         //     select: { remaining_quantity: true },
  //         //   });

  //         //   if (post && Number(post.remaining_quantity) === 0) {
  //         //     await tx.batchInventory.update({
  //         //       where: { id: b.id },
  //         //       data: { status: 'FINISHED' },
  //         //     });
  //         //     await tx.batchLifecycle.update({
  //         //       where: { batch_id: b.id },
  //         //       data: { ended_at: new Date() },
  //         //     });
  //         //   }

  //         //   const productSubTotalCost = money(item.price * take);
  //         //   const productTotalCost = money(
  //         //     item.price * take * (1 + item.VAT / 100) - item.discount
  //         //   );

  //         //   txProductsData.push({
  //         //     inventoryId: item.inventoryId,
  //         //     supplier_products_id: item.supplier_products_id,
  //         //     batch_id: b.id,
  //         //     quantity: take,
  //         //     productName: item.productName,
  //         //     price: item.price,
  //         //     VAT: Number(item.VAT),
  //         //     discount: Number(item.discount),
  //         //     productSubTotalCost,
  //         //     productTotalCost,
  //         //     transactionId,
  //         //   });

  //         //   need -= take;
  //         //   totalAllocated += take;
  //         // }
  //       } else {
  //         // No batch allocation needed (pull directly from inventory)
  //         totalAllocated = item.quantity;

  //         const productSubTotalCost = money(item.price * item.quantity);
  //         const productTotalCost = money(item.price * item.quantity * (1 + item.VAT / 100) - item.discount);

  //         txProductsData.push({
  //           inventoryId: item.inventoryId,
  //           supplier_products_id: item.supplier_products_id,
  //           BatchInventoryId: item.batch_inventory_id, // not batch-allocated
  //           stock_quantity: item.stock_quantity,
  //           quantity: item.quantity,
  //           productName: item.productName,
  //           price: item.price,
  //           VAT: Number(item.VAT),
  //           discount: Number(item.discount),
  //           productSubTotalCost,
  //           productTotalCost,
  //           transactionId
  //         });
  //       }

  //       // Update inventory & product summary
  //       await tx.inventory.update({
  //         where: { supplier_products_id: item.supplier_products_id },
  //         data: { stock_quantity: { decrement: totalAllocated } }
  //       });

  //       await tx.productSummary.update({
  //         where: { supplier_products_id: item.supplier_products_id },
  //         data: {
  //           total_sold: { increment: totalAllocated }
  //         }
  //       });
  //     }

  //     // Insert all product lines
  //     if (txProductsData.length > 0) {
  //       await tx.sales.createMany({ data: txProductsData });
  //     }

  //     // Handle payments
  //     if (paymentMethod === 'CASH') {
  //       console.log('WE ARE IN THE CASH ACCOUNT ');
  //       const inventoryAccount = await AccountController.findAccount({
  //         tx,
  //         name: Account_Inventory.name,
  //         type: Account_Inventory.acc_type
  //       });
  //       const cashAccount = await AccountController.findAccount({ tx, name: Account_Cash.name, type: Account_Cash.acc_type });
  //       if (!inventoryAccount && !cashAccount) {
  //         throw new BadRequestError('Account not configured');
  //       }
  //       console.log('inventory account is ', inventoryAccount);

  //       const journalEntry = await JournalService.createJournalEntry(tx, {
  //         transactionId: 'purchase_payment',
  //         description: 'purchase payment',
  //         lines: [
  //           {
  //             account_id: inventoryAccount.account_id!,
  //             credit: new Decimal(totalCost.total)
  //           },
  //           {
  //             account_id: cashAccount.account_id,
  //             debit: new Decimal(totalCost.total)
  //           }
  //         ]
  //       });

  //       console.log('journal entry is ', journalEntry);

  //       // const cashAccount = await tx.account.findFirst({
  //       //   where: { type: 'INCOME', account_status: 'ACTIVE', deleted: false },
  //       //   select: { account_id: true, running_balance: true },
  //       // });
  //       // if (!cashAccount) throw new BadRequestError('No active cash account configured');

  //       // const newBalance = money(Number(cashAccount.running_balance) + totalCost.total);

  //       // // await tx.account.update({
  //       // //   where: { account_id: cashAccount.account_id },
  //       // //   data: { running_balance: newBalance },
  //       // // });

  //       // const account = await tx.account.findFirst({
  //       //   where: { account_status: 'ACTIVE', name: 'kcb' },
  //       //   select: { name: true, account_id: true },
  //       // });

  //       // if (!account) {
  //       //   throw new BadRequestError('account not found');
  //       // }

  //       // await AccountController.adjustBalance({
  //       //   tx, account_id: account.account_id,
  //       //   amount: money(totalCost.total),
  //       //   action: 'credit',
  //       //   pos_session_id: posSession,
  //       //   user: req.currentUser!.email
  //       // });

  //       // await tx.cashBookLedger.create({
  //       //   data: {
  //       //     opening_closing_balance_id: ocb.cash_bank_ledger_id,
  //       //     transaction_date: new Date(),
  //       //     transaction_type: 'INFLOW',
  //       //     amount: money(totalCost.total),
  //       //     method: 'CASH',
  //       //     reference_type: 'CUSTOMER_PAYMENT',
  //       //     reference_id: transaction.transactionId,
  //       //     balance_after: newBalance,
  //       //     description: `POS sale ${transaction.transactionId}: ${txProductsData.length} items`,
  //       //     account_id: cashAccount.account_id,
  //       //   },
  //       // });
  //     } else if (paymentMethod === 'CREDIT') {
  //       if (!customerId) {
  //         throw new BadRequestError('Credit sales require a customer');
  //       }

  //       // const account = await tx.account.upsert({
  //       //   where: { customer_id: customerId },
  //       //   create: {
  //       //     customer_id: customerId,
  //       //     opening_balance: money(totalCost.total),
  //       //     running_balance: money(totalCost.total),
  //       //     status: 'ACTIVE',
  //       //   },
  //       //   update: { running_balance: { increment: money(totalCost.total) } },
  //       //   select: { id: true },
  //       // });

  //       await tx.customerReceivable.create({
  //         data: {
  //           customer_id: customerId,
  //           total_Amount: money(totalCost.total),
  //           transaction_id: transactionId
  //         }
  //       });
  //     }

  //     // await tx.auditLog.create({
  //     //   data: {
  //     //     action: 'POS_SALE',
  //     //     ref_id: transaction.transactionId,
  //     //     details: JSON.stringify({
  //     //       pos_session: posSession,
  //     //       items: txProductsData.map((t) => ({
  //     //         p: t.supplier_products_id,
  //     //         b: t.batch_id,
  //     //         q: t.quantity,
  //     //       })),
  //     //       paymentMethod,
  //     //       total: totalCost.total,
  //     //     }),
  //     //   },
  //     // });

  //     return { transaction, products: txProductsData };
  //   });

  //   const message = utilMessage.created('transaction');
  //   res.json({ message, result });
  //   // res
  //   //   .status(StatusCodes.CREATED)
  //   //   .send(GetSuccessMessage(StatusCodes.CREATED, result, message));
  // }

  // /**
  //  * Handles FIFO batch allocation when a product needs a new batch load.
  //  * Covers edge cases and ensures data consistency.
  //  */
  // static async allocateNextBatch(tx: PrismaTransactionalClient, item: TransactionProduct, transactionId: string) {
  //   // ===================================================
  //   // 1. Calculate remaining quantity after deduction
  //   // ===================================================
  //   const remainingQuantity = item.quantity - Number(item.stock_quantity);
  //   const txProductsData: Array<{
  //     inventoryId: string;
  //     supplier_products_id: string;
  //     batch_id: string;
  //     quantity: number;
  //     productName: string;
  //     price: number;
  //     VAT: number;
  //     discount: number;
  //     productSubTotalCost: number;
  //     productTotalCost: number;
  //     transactionId: string;
  //   }> = [];

  //   if (remainingQuantity < 0) {
  //     throw new BadRequestError(`Invalid calculation: remaining quantity for ${item.productName} is negative.`);
  //   }

  //   // ===================================================
  //   // 2. End lifecycle of current active batch
  //   // ===================================================
  //   await tx.batchLifecycle.updateMany({
  //     where: { batch_id: item.batch_inventory_id, ended_at: null },
  //     data: { ended_at: new Date() }
  //   });

  //   // ===================================================
  //   // 3. Mark current batch as FINISHED
  //   // ===================================================
  //   await tx.batchInventory.updateMany({
  //     where: {
  //       batch_inventory_id: item.batch_inventory_id,
  //       status: 'ACTIVE'
  //     },
  //     data: { status: 'FINISHED' }
  //   });

  //   // ===================================================
  //   // 4. Fetch the next FIFO batch (must exist & PENDING)
  //   // ===================================================
  //   const nextBatch = await tx.batchInventory.findFirst({
  //     where: {
  //       supplier_products_id: item.supplier_products_id,
  //       status: 'PENDING'
  //     },
  //     orderBy: { created_at: 'asc' }
  //   });

  //   if (!nextBatch) {
  //     throw new BadRequestError(`No pending batch available for product: ${item.productName}`);
  //   }

  //   // ===================================================
  //   // 5. Activate the new batch in inventory
  //   // ===================================================
  //   const loadNewBatch = await tx.inventory.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: {
  //       stock_quantity: nextBatch.total_units,
  //       status: 'ACTIVE',
  //       batch_inventory_id: nextBatch.batch_inventory_id
  //     }
  //   });

  //   if (Number(loadNewBatch.stock_quantity) <= 0) {
  //     throw new BadRequestError(`Next batch for ${item.productName} has no stock units.`);
  //   }

  //   // ===================================================
  //   // 6. Start lifecycle record for new batch
  //   // ===================================================
  //   await tx.batchLifecycle.create({
  //     data: {
  //       batch_id: nextBatch.batch_inventory_id,
  //       started_at: new Date()
  //     }
  //   });

  //   // ===================================================
  //   // 7. Deduct the carry-over quantity from new batch
  //   // ===================================================
  //   const finalQuantity = nextBatch.total_units - remainingQuantity;
  //   console.log('final Quantity is ', finalQuantity);

  //   if (finalQuantity < 0) {
  //     throw new BadRequestError(`Next batch for ${item.productName} does not have enough to cover carry-over.`);
  //   }

  //   await tx.inventory.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: { stock_quantity: finalQuantity }
  //   });

  //   // ===================================================
  //   // 8. Update product summary (tracking totals)
  //   // ===================================================
  //   await tx.productSummary.update({
  //     where: { supplier_products_id: item.supplier_products_id },
  //     data: {
  //       total_received: item.total_stock_quantity - Number(item.stock_quantity),
  //       total_sold: { increment: item.quantity }
  //     }
  //   });

  //   const productSubTotalCost = money(item.price * Number(item.stock_quantity));
  //   const productTotalCost = money(item.price * Number(item.stock_quantity) * (1 + item.VAT / 100) - item.discount);

  //   txProductsData.push({
  //     inventoryId: item.inventoryId,
  //     supplier_products_id: item.supplier_products_id,
  //     batch_id: item.batch_inventory_id,
  //     quantity: item.quantity,
  //     productName: item.productName,
  //     price: item.price,
  //     VAT: Number(item.VAT),
  //     discount: Number(item.discount),
  //     productSubTotalCost,
  //     productTotalCost,
  //     transactionId
  //   });
  // }

  static async allocateNextBatch(tx: PrismaTransactionalClient, item: TransactionProduct, transactionId: string) {
    // ===================================================
    // 1. Calculate remaining quantity to allocate from pending batches
    //    (we assume item.stock_quantity is the active inventory currently available)
    // ===================================================
    let remainingQuantity = item.quantity - Number(item.stock_quantity);
    console.log('allocationg next batch');

    if (remainingQuantity < 0) {
      throw new BadRequestError(`Invalid calculation: remaining quantity for ${item.productName} is negative.`);
    }

    // If nothing to allocate, return an empty result
    if (remainingQuantity === 0) {
      return {
        totalAllocated: 0,
        remainingQuantity: 0,
        allocations: [] as Array<{
          supplier_products_id: string;
          batch_inventory_id: string;
          quantity: number;
          productName: string;
          price: number;
          VAT: number;
          discount: number;
          productSubTotalCost: number;
          productTotalCost: number;
          transactionId: string;
        }>,
        updatedBatches: [] as any[],
        updatedInventories: [] as any[]
      };
    }

    const allocations: Array<{
      supplier_products_id: string;
      batch_inventory_id: string;
      quantity: number;
      productName: string;
      price: number;
      VAT: number;
      discount: number;
      productSubTotalCost: number;
      productTotalCost: number;
      transactionId: string;
    }> = [];

    const updatedBatches: any[] = [];
    const updatedInventories: any[] = [];

    // ===================================================
    // 2. End lifecycle of the current active batch & mark it FINISHED,
    //    and zero out the active inventory for this supplier product.
    //    (This matches the behavior in your non-batch branch.)
    // ===================================================
    await tx.batchLifecycle.updateMany({
      where: { batch_id: item.batch_inventory_id, ended_at: null },
      data: { ended_at: new Date() }
    });

    await tx.batchInventory.updateMany({
      where: {
        batch_inventory_id: item.batch_inventory_id,
        status: 'ACTIVE'
      },
      data: { status: 'FINISHED' }
    });

    // ensure the active inventory is zeroed (so we can load next batch into ACTIVE inventory)
    await tx.inventory.updateMany({
      where: {
        supplier_products_id: item.supplier_products_id,
        status: 'ACTIVE',
        batch_inventory_id: item.batch_inventory_id
      },
      data: { stock_quantity: 0 }
    });

    // ===================================================
    // 3. Loop: fetch next pending batch (FIFO) and consume from it
    // ===================================================
    while (remainingQuantity > 0) {
      // get next pending batch (oldest first)
      const nextBatch = await tx.batchInventory.findFirst({
        where: {
          supplier_products_id: item.supplier_products_id,
          status: 'PENDING'
        },
        orderBy: { created_at: 'asc' },
        select: {
          batch_inventory_id: true,
          total_units: true,
          purchase_id: true,
          supplier_products_id: true,
          batch_name: true,
          created_at: true,
          // include purchase.unit_id if you need to set inventory.unit_id on upsert
          purchase: {
            select: {
              unit_id: true
            }
          }
        }
      });

      if (!nextBatch) {
        // No more pending batches to satisfy remainingQuantity
        break;
      }

      // Activate this batch into inventory (or upsert the ACTIVE inventory row)
      // Upsert pattern used in your existing code
      const upsertedInventory = await tx.inventory.upsert({
        where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
        create: {
          supplier_products_id: nextBatch.supplier_products_id,
          batch_inventory_id: nextBatch.batch_inventory_id,
          stock_quantity: nextBatch.total_units,
          unit_id: nextBatch.purchase?.unit_id ?? null,
          status: 'ACTIVE'
        },
        update: {
          batch_inventory_id: nextBatch.batch_inventory_id,
          stock_quantity: nextBatch.total_units,
          status: 'ACTIVE'
        }
      });

      updatedInventories.push(upsertedInventory);

      // start lifecycle for the batch we just activated
      await tx.batchLifecycle.create({
        data: {
          batch_id: nextBatch.batch_inventory_id,
          started_at: new Date()
        }
      });

      // How much we can take from this batch
      const takeFromThisBatch = Math.min(nextBatch.total_units, remainingQuantity);

      // If the batch has less or equal units than remainingQuantity -> fully consume it
      if (nextBatch.total_units <= remainingQuantity) {
        // mark batch FINISHED and consumed completely
        const finishedBatch = await tx.batchInventory.update({
          where: { batch_inventory_id: nextBatch.batch_inventory_id },
          data: {
            status: 'FINISHED',
            total_units: 0
          }
        });

        // set active inventory stock to 0 (consumed)
        await tx.inventory.update({
          where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
          data: { stock_quantity: 0 }
        });

        // end lifecycle for that batch
        await tx.batchLifecycle.updateMany({
          where: { batch_id: nextBatch.batch_inventory_id, ended_at: null },
          data: { ended_at: new Date() }
        });

        updatedBatches.push(finishedBatch);

        // record allocation for this batch
        const productSubTotalCost = money(item.price * takeFromThisBatch);
        const productTotalCost = money(item.price * takeFromThisBatch * (1 + item.VAT / 100) - item.discount);

        allocations.push({
          supplier_products_id: item.supplier_products_id,
          batch_inventory_id: nextBatch.batch_inventory_id,
          quantity: takeFromThisBatch,
          productName: item.productName,
          price: item.price,
          VAT: Number(item.VAT),
          discount: Number(item.discount),
          productSubTotalCost,
          productTotalCost,
          transactionId
        });

        remainingQuantity -= takeFromThisBatch;
        // continue loop to fetch next pending batch if remainingQuantity > 0
        continue;
      }

      // If the batch has more units than we need -> partial consumption
      // We will:
      //  - set the batch to ACTIVE and reduce its total_units to the leftover (total_units - take)
      //  - set the ACTIVE inventory stock_quantity to leftover
      // This preserves the batch as ACTIVE with remaining units available in inventory.
      const leftoverUnits = nextBatch.total_units - takeFromThisBatch;

      // Update the batch: set it ACTIVE and adjust total_units to leftover
      const updatedBatch = await tx.batchInventory.update({
        where: { batch_inventory_id: nextBatch.batch_inventory_id },
        data: {
          status: 'ACTIVE', // it remains active since we loaded it
          total_units: leftoverUnits
        }
      });

      // Update inventory for the active batch to reflect leftover units
      await tx.inventory.update({
        where: { supplier_products_id: item.supplier_products_id, status: 'ACTIVE' },
        data: { stock_quantity: leftoverUnits }
      });

      updatedBatches.push(updatedBatch);

      // Record the allocation for the portion we consumed
      const productSubTotalCost = money(item.price * takeFromThisBatch);
      const productTotalCost = money(item.price * takeFromThisBatch * (1 + item.VAT / 100) - item.discount);

      allocations.push({
        supplier_products_id: item.supplier_products_id,
        batch_inventory_id: nextBatch.batch_inventory_id,
        quantity: takeFromThisBatch,
        productName: item.productName,
        price: item.price,
        VAT: Number(item.VAT),
        discount: Number(item.discount),
        productSubTotalCost,
        productTotalCost,
        transactionId
      });

      // we've satisfied the required quantity
      remainingQuantity = 0;
      break;
    } // end while

    // ===================================================
    // 4. Final product summary update (same as the non-batch path)
    //    - total_received remains as earlier logic (you can keep it or adapt)
    //    - increment total_sold by the original requested quantity
    // ===================================================
    await tx.productSummary.update({
      where: { supplier_products_id: item.supplier_products_id },
      data: {
        // total_received: item.total_stock_quantity - Number(item.stock_quantity),
        total_sold: { increment: item.quantity }
      }
    });

    // ===================================================
    // 5. Return a shape the caller can merge into txProductsData
    //    allocations[] contains per-batch lines (one per consumed portion).
    // ===================================================
    const totalAllocated = item.quantity - remainingQuantity;

    return {
      totalAllocated,
      remainingQuantity,
      allocations,
      updatedBatches,
      updatedInventories
    };
  }

  // fetch customer receivables

  public async getCustomerReceivables(req: Request, res: Response): Promise<void> {
    // const customerId = req.params.customerId;

    const receivables = await prisma.customerReceivable.findMany({
      where: { payment_status: 'unsettled' },
      select: {
        customer_receivable_id: true,
        customer_id: true,
        total_Amount: true,
        total_paid: true,
        balance_due: true,
        transaction_id: true
        // created_at: true
      }
      // orderBy: { created_at: 'desc' }
    });

    const message = utilMessage.fetchedMessage('customer receivables');
    res.json({ message, receivables });
  }

  public async handleCustomerReceivablePayment(req: Request, res: Response): Promise<void> {
    const { transactionId, paymentAmount } = req.body;

    const receivable = await prisma.customerReceivable.findUnique({
      where: { transaction_id: transactionId }
    });

    if (!receivable) {
      throw new BadRequestError('Customer receivable not found');
    }

    if (receivable.payment_status === 'settled') {
      throw new BadRequestError('This receivable is already settled');
    }

    if (paymentAmount > Number(receivable.balance_due)) {
      throw new BadRequestError('Payment amount exceeds balance due');
    }

    const newTotalPaid = money(Number(receivable.total_paid) + paymentAmount);
    const newBalanceDue = money(Number(receivable.balance_due) - paymentAmount);

    let newPaymentStatus: PayableStatus = 'unsettled';
    if (newBalanceDue <= 0) {
      newPaymentStatus = 'settled';
    }

    const results = await prisma.$transaction(async (tx) => {
      // Update the customer receivable
      const updatedReceivable = await tx.customerReceivable.update({
        where: { transaction_id: transactionId },
        data: {
          total_paid: newTotalPaid,
          balance_due: newBalanceDue,
          payment_status: newPaymentStatus
        }
      });
      return updatedReceivable;
    });

    // const message = utilMessage.updated('customer receivable');
    // res.json({ message, updatedReceivable });

    res.json({ message: 'receivable payment processed successfully', results });
  }

  public async getTransactionsReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDateCreated: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        Sales: true,
        customer: true
      },
      orderBy: { transactionDateCreated: 'desc' }
    });

    const message = utilMessage.fetchedMessage('transactions report');
    res.json({ message, transactions });
  }
}
