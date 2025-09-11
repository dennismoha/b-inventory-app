import { Request, Response } from 'express';
import { transactionSchema } from '@src/features/transactions/schema/transactions-schema';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { StatusCodes } from 'http-status-codes';
import { utilMessage } from '@src/shared/globals/helpers/utils';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client'; // Prisma client to interact with the database
import { Transaction, TransactionProduct, TransactionProductItems } from '@src/features/transactions/interfaces/transaction.interface';
// import { Decimal } from '@prisma/client/runtime/library';

import crypto from 'crypto';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Cash, Account_Inventory } from '@src/constants';
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
  return Math.round((v + Number.EPSILON) * 100) / 100;  // round to 2dp to avoid floating noise
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
    const {
      cartProducts,
      customerId,
      paymentMethod,
      totalCost,
    }: TransactionProductItems = req.body;

    // POS session check
    const posSession = req.headers['pos_session'];
    if (!posSession || typeof posSession !== 'string') {
      throw new BadRequestError('No active POS session');
    }

    // Resolve opening/closing balance
    const ocb = await prisma.openingClosingBalance.findFirst({
      where: { pos_session_id: posSession },
      select: { cash_bank_ledger_id: true, id: true },
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
          paymentMethod: 'CASH',
        },
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

        if (item.needsBatchLoad) {
          await TransactionsController.allocateNextBatch(tx, item, transactionId);
          // FIFO batch allocation
          // we subtract items.stock_quantity from inventory.stock_quantity to get second_batch for example
          // 
          // we update the proper tables with that action. productSummary.total_sold for that respective supplier_product_id
          // we log that batch in the  batchLifecyles with end time
          // we find , fetch the next batch from batchInventorystock with status pending order by dates and updated it to 'Active' and also update the state of the previous batch to finished
          // we update the Inventorystock for that supplier_products_id with the new batch and total
          // we update the batchLifeCycle with the details of the new batch and start_date
          //  we subtract the second batch from that inventory
          // then we update the resepctive tables with the new subtractions. that is the productSummary. then we continue

          // we subtract items.stock_quantity from inventory.stock_quantity to get second_batch for example
          // const remaining_quantity = Number(item.stock_quantity) - item.quantity;


          // // we log that batch in the  batchLifecyles with end time
          // const lifecycleUpdate = await tx.batchLifecycle.update({
          //     where: { batch_id: item.batch_inventory_id },
          //     data:{ended_at: new Date()}
          //   });

          // we find , fetch the next batch from batchInventorystock with status pending order by dates and updated it to 'Active' and also update the state of the previous batch to finished

          // const updatePreviousBatchStateToFinished = await tx.batchInventory.update({
          //   where: {batch_inventory_id: item.batch_inventory_id},
          //   data: {status:'FINISHED'}
          // });

          // // fetch the next batch from batch inventoryStock
          // const batches = await tx.batchInventory.findFirst({
          //   where :{
          //     supplier_products_id: item.supplier_products_id,
          //     status: 'PENDING'
          //   },
          //   orderBy: {created_at:'asc'}
          // });


          // if (!batches) {
          //   throw new BadRequestError(
          //     `No active batches available for product: ${item.productName}`
          //   );
          // }

          // we update the Inventorystock for that supplier_products_id with the new batch and total
          // const updateInventoryWithNewBatch = await tx.inventory.update({
          //   where:{supplier_products_id: item.supplier_products_id},
          //   data:{stock_quantity: batches?.total_units, status:'ACTIVE', batch_inventory_id: batches?.batch_inventory_id}
          // });

          // // we update the batchLifeCycle with the details of the new batch and start_date
          // const updateBatchLifeCycleWithNewBatch = await tx.batchLifecycle.create({            
          //   data:{batch_id: batches!.batch_inventory_id, started_at: new Date()}
          // });

          //  //  we subtract the second batch from that inventory
          // const newBatchInventoryUpdates = await tx.inventory.update({
          //   where: {supplier_products_id: item.supplier_products_id},
          //   data:{stock_quantity: batches!.total_units - remaining_quantity}
          // });

          //    // we update the proper tables with that action. productSummary.total_sold for that respective supplier_product_id
          // const logLastBatchItems = await tx.productSummary.update({
          //   where: { supplier_products_id: item.supplier_products_id },
          //   data: { total_received: item.total_stock_quantity - Number(item.stock_quantity) },        
          // });


          // const batches = await tx.batchInventory.findMany({
          //   where: {
          //     supplier_products_id: item.supplier_products_id,
          //     remaining_quantity: { gt: 0 },
          //     status: 'ACTIVE',
          //   },
          //   orderBy: [{ arrival_date: 'asc' }, { created_at: 'asc' }],
          //   select: { id: true, remaining_quantity: true, status: true },
          // });


          // let need = item.quantity;
          // for (const b of batches) {
          //   if (need <= 0) break;

          //   const take = Math.min(Number(b.remaining_quantity), need);

          //   await tx.batchInventory.update({
          //     where: { id: b.id },
          //     data: { remaining_quantity: { decrement: take } },
          //   });

          //   await tx.batchLifecycle.upsert({
          //     where: { batch_id: b.id },
          //     update: {},
          //     create: { batch_id: b.id },
          //   });

          //   const post = await tx.batchInventory.findUnique({
          //     where: { id: b.id },
          //     select: { remaining_quantity: true },
          //   });

          //   if (post && Number(post.remaining_quantity) === 0) {
          //     await tx.batchInventory.update({
          //       where: { id: b.id },
          //       data: { status: 'FINISHED' },
          //     });
          //     await tx.batchLifecycle.update({
          //       where: { batch_id: b.id },
          //       data: { ended_at: new Date() },
          //     });
          //   }

          //   const productSubTotalCost = money(item.price * take);
          //   const productTotalCost = money(
          //     item.price * take * (1 + item.VAT / 100) - item.discount
          //   );

          //   txProductsData.push({
          //     inventoryId: item.inventoryId,
          //     supplier_products_id: item.supplier_products_id,
          //     batch_id: b.id,
          //     quantity: take,
          //     productName: item.productName,
          //     price: item.price,
          //     VAT: Number(item.VAT),
          //     discount: Number(item.discount),
          //     productSubTotalCost,
          //     productTotalCost,
          //     transactionId,
          //   });

          //   need -= take;
          //   totalAllocated += take;
          // }
        } else {
          // No batch allocation needed (pull directly from inventory)
          totalAllocated = item.quantity;

          const productSubTotalCost = money(item.price * item.quantity);
          const productTotalCost = money(
            item.price * item.quantity * (1 + item.VAT / 100) - item.discount
          );

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
            transactionId,
          });
        }

        // Update inventory & product summary
        await tx.inventory.update({
          where: { supplier_products_id: item.supplier_products_id },
          data: { stock_quantity: { decrement: totalAllocated } },
        });

        await tx.productSummary.update({
          where: { supplier_products_id: item.supplier_products_id },
          data: {
            total_sold: { increment: totalAllocated },
          },
        });
      }

      // Insert all product lines
      if (txProductsData.length > 0) {
        await tx.sales.createMany({ data: txProductsData });
      }

      // Handle payments
      if (paymentMethod === 'CASH') {
        console.log('WE ARE IN THE CASH ACCOUNT ');
        const inventoryAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type });
        const cashAccount = await AccountController.findAccount({tx, name: Account_Cash.name , type:Account_Cash.acc_type });
        if (!inventoryAccount && !cashAccount ) {
          throw new BadRequestError('Account not configured');
        }
        console.log('inventory account is ', inventoryAccount);

        const journalEntry = await JournalService.createJournalEntry(tx, {
          transactionId: 'purchase_payment', description: 'purchase payment', lines: [{
            account_id: inventoryAccount.account_id!,
            credit: new Decimal(totalCost.total)
          }, {
            account_id: cashAccount.account_id,
            debit: new Decimal(totalCost.total),
          }]
        });


        console.log('journal entry is ', journalEntry);

        // const cashAccount = await tx.account.findFirst({
        //   where: { type: 'INCOME', account_status: 'ACTIVE', deleted: false },
        //   select: { account_id: true, running_balance: true },
        // });
        // if (!cashAccount) throw new BadRequestError('No active cash account configured');

        // const newBalance = money(Number(cashAccount.running_balance) + totalCost.total);






        // // await tx.account.update({
        // //   where: { account_id: cashAccount.account_id },
        // //   data: { running_balance: newBalance },
        // // });

        // const account = await tx.account.findFirst({
        //   where: { account_status: 'ACTIVE', name: 'kcb' },
        //   select: { name: true, account_id: true },
        // });

        // if (!account) {
        //   throw new BadRequestError('account not found');
        // }

        // await AccountController.adjustBalance({
        //   tx, account_id: account.account_id,
        //   amount: money(totalCost.total),
        //   action: 'credit',
        //   pos_session_id: posSession,
        //   user: req.currentUser!.email
        // });



        // await tx.cashBookLedger.create({
        //   data: {
        //     opening_closing_balance_id: ocb.cash_bank_ledger_id,
        //     transaction_date: new Date(),
        //     transaction_type: 'INFLOW',
        //     amount: money(totalCost.total),
        //     method: 'CASH',
        //     reference_type: 'CUSTOMER_PAYMENT',
        //     reference_id: transaction.transactionId,
        //     balance_after: newBalance,
        //     description: `POS sale ${transaction.transactionId}: ${txProductsData.length} items`,
        //     account_id: cashAccount.account_id,
        //   },
        // });
      } else if (paymentMethod === 'CREDIT') {
        if (!customerId) {
          throw new BadRequestError('Credit sales require a customer');
        }

        // const account = await tx.account.upsert({
        //   where: { customer_id: customerId },
        //   create: {
        //     customer_id: customerId,
        //     opening_balance: money(totalCost.total),
        //     running_balance: money(totalCost.total),
        //     status: 'ACTIVE',
        //   },
        //   update: { running_balance: { increment: money(totalCost.total) } },
        //   select: { id: true },
        // });



        await tx.customerReceivable.create({
          data: {
            customer_id: customerId,
            total_Amount: money(totalCost.total),
            transaction_id: transactionId
          },
        });
      }



      // await tx.auditLog.create({
      //   data: {
      //     action: 'POS_SALE',
      //     ref_id: transaction.transactionId,
      //     details: JSON.stringify({
      //       pos_session: posSession,
      //       items: txProductsData.map((t) => ({
      //         p: t.supplier_products_id,
      //         b: t.batch_id,
      //         q: t.quantity,
      //       })),
      //       paymentMethod,
      //       total: totalCost.total,
      //     }),
      //   },
      // });

      return { transaction, products: txProductsData };
    });

    const message = utilMessage.created('transaction');
    res.json({ message, result });
    // res
    //   .status(StatusCodes.CREATED)
    //   .send(GetSuccessMessage(StatusCodes.CREATED, result, message));
  }


  /**
     * Handles FIFO batch allocation when a product needs a new batch load.
     * Covers edge cases and ensures data consistency.
     */
  static async allocateNextBatch(
    tx: PrismaTransactionalClient,
    item: TransactionProduct,
    transactionId: string

  ) {
    // ===================================================
    // 1. Calculate remaining quantity after deduction
    // ===================================================
    const remainingQuantity = item.quantity - Number(item.stock_quantity);
    const txProductsData: Array<{
      inventoryId: string;
      supplier_products_id: string;
      batch_id: string;
      quantity: number;
      productName: string;
      price: number;
      VAT: number;
      discount: number;
      productSubTotalCost: number;
      productTotalCost: number;
      transactionId: string;
    }> = [];

    if (remainingQuantity < 0) {
      throw new BadRequestError(
        `Invalid calculation: remaining quantity for ${item.productName} is negative.`
      );
    }

    // ===================================================
    // 2. End lifecycle of current active batch
    // ===================================================
    await tx.batchLifecycle.updateMany({
      where: { batch_id: item.batch_inventory_id, ended_at: null },
      data: { ended_at: new Date() },
    });

    // ===================================================
    // 3. Mark current batch as FINISHED
    // ===================================================
    await tx.batchInventory.updateMany({
      where: {
        batch_inventory_id: item.batch_inventory_id,
        status: 'ACTIVE',
      },
      data: { status: 'FINISHED' },
    });

    // ===================================================
    // 4. Fetch the next FIFO batch (must exist & PENDING)
    // ===================================================
    const nextBatch = await tx.batchInventory.findFirst({
      where: {
        supplier_products_id: item.supplier_products_id,
        status: 'PENDING',
      },
      orderBy: { created_at: 'asc' },
    });

    if (!nextBatch) {
      throw new BadRequestError(
        `No pending batch available for product: ${item.productName}`
      );
    }

    // ===================================================
    // 5. Activate the new batch in inventory
    // ===================================================
    const loadNewBatch = await tx.inventory.update({
      where: { supplier_products_id: item.supplier_products_id },
      data: {
        stock_quantity: nextBatch.total_units,
        status: 'ACTIVE',
        batch_inventory_id: nextBatch.batch_inventory_id,
      },
    });

    if (Number(loadNewBatch.stock_quantity) <= 0) {
      throw new BadRequestError(
        `Next batch for ${item.productName} has no stock units.`
      );
    }

    // ===================================================
    // 6. Start lifecycle record for new batch
    // ===================================================
    await tx.batchLifecycle.create({
      data: {
        batch_id: nextBatch.batch_inventory_id,
        started_at: new Date(),
      },
    });

    // ===================================================
    // 7. Deduct the carry-over quantity from new batch
    // ===================================================
    const finalQuantity = nextBatch.total_units - remainingQuantity;
    console.log('final Quantity is ', finalQuantity);

    if (finalQuantity < 0) {
      throw new BadRequestError(
        `Next batch for ${item.productName} does not have enough to cover carry-over.`
      );
    }

    await tx.inventory.update({
      where: { supplier_products_id: item.supplier_products_id },
      data: { stock_quantity: finalQuantity },
    });

    // ===================================================
    // 8. Update product summary (tracking totals)
    // ===================================================
    await tx.productSummary.update({
      where: { supplier_products_id: item.supplier_products_id },
      data: {
        total_received:
          item.total_stock_quantity - Number(item.stock_quantity),
        total_sold: { increment: item.quantity },
      },
    });


    const productSubTotalCost = money(item.price * Number(item.stock_quantity));
    const productTotalCost = money(
      item.price * Number(item.stock_quantity) * (1 + item.VAT / 100) - item.discount
    );

    txProductsData.push({
      inventoryId: item.inventoryId,
      supplier_products_id: item.supplier_products_id,
      batch_id: item.batch_inventory_id,
      quantity: item.quantity,
      productName: item.productName,
      price: item.price,
      VAT: Number(item.VAT),
      discount: Number(item.discount),
      productSubTotalCost,
      productTotalCost,
      transactionId,
    });
  }


  // @joiValidation(transactionSchema)
  // public async createTransaction(req: Request, res: Response): Promise<void> {
  //   const {
  //     cartProducts, // Array of cartProducts
  //     customerId,
  //     paymentMethod,
  //     totalCost
  //   }: TransactionProductItems = req.body; // Typecasting the request body to ProductItems

  //   // Step 1: Generate a unique transaction ID
  //   const transactionId = crypto.randomUUID();

  //   // Step 2: Initialize transaction-related data
  //   let transaction: Transaction;

  //   // Step 3: Check if customer exists (if provided), otherwise handle as a generic transaction
  //   if (customerId) {
  //     // Step : Create a new transaction record for the customer
  //     transaction = await prisma.transaction.create({
  //       data: {
  //         transactionId,
  //         customerId,
  //         totalCost: totalCost.total, // Total cost (after VAT & discounts)
  //         paymentMethod,
  //         subtotal: totalCost.subtotal
  //       }
  //     });
  //   } else {
  //     transaction = await prisma.transaction.create({
  //       data: {
  //         transactionId,
  //         totalCost: totalCost.total, // Total cost (after VAT & discounts)
  //         paymentMethod,
  //         subtotal: totalCost.subtotal
  //       }
  //     });
  //   }

  //   //  Process each cart product and check inventory
  //   const transactionProducts = [];

  //   for (const product of cartProducts) {
  //     //  Check stock availability for each product
  //     const inventory = await prisma.inventory.findUnique({
  //       where: { supplier_products_id: product.supplier_products_id }
  //     });

  //     console.log('this new ============== ', inventory);

  //     if (!inventory || Number(inventory.stock_quantity) < product.quantity) {
  //       throw new BadRequestError(
  //         `Insufficient stock for product: ${product.productName} ${inventory?.stock_quantity} ${product.quantity}`
  //       );
  //     }

  //     // Step Deduct the quantity from the inventory
  //     await prisma.inventory.update({
  //       where: { supplier_products_id: product.supplier_products_id },
  //       data: {
  //         stock_quantity: Number(inventory.stock_quantity) - product.quantity
  //       }
  //     });

  //     // Step Calculate total cost for this product (taking VAT and discount into account)
  //     const productTotalCost = product.price * product.quantity * (1 + product.VAT / 100) - product.discount;
  //     const productSubTotalCost = product.price * product.quantity;

  //     // Step Prepare the transaction product data
  //     transactionProducts.push({
  //       inventoryId: product.inventoryId,
  //       stock_quantity: product.stock_quantity,
  //       VAT: Number(product.VAT),
  //       supplier_products_id: product.supplier_products_id,
  //       quantity: product.quantity,
  //       productName: product.productName,        
  //       price: product.price,
  //       discount: Number(product.discount),
  //       productSubTotalCost,
  //       productTotalCost,
  //       transactionId // Link to the current transaction
  //     });
  //   }

  //   // Step  Create the transaction products in the database
  //   await prisma.sales.createMany({
  //     data: transactionProducts
  //   });

  //   // Step 6: Send response with success message
  //   const message = utilMessage.created('transaction');
  //   res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, transaction, message));
  // }

  // @joiValidation(transactionSchema)
  // public async createTransaction(req: Request, res: Response): Promise<void> {
  //   const {
  //     supplierProductId,
  //     quantity,
  //     productName,
  //     price,
  //     discount,
  //     vat,
  //     customerId,
  //     totalCost,
  //     paymentMethod,
  //     subtotal
  //   } = req.body;

  //     // Step 1: Generate a unique transaction ID
  //     const transactionId = crypto.randomUUID();

  //     // Step 2: Check if the quantity is available in stock
  //     const inventory = await prisma.inventory.findUnique({
  //       where: { supplier_products_id: supplierProductId }
  //     });

  //     if (!inventory || inventory.stock_quantity < quantity) {
  //      throw new BadRequestError('insufficient stock');
  //     }

  //     // Step 3: Deduct the quantity from the inventory
  //     await prisma.inventory.update({
  //       where: { supplier_products_id: supplierProductId },
  //       data: {
  //         stock_quantity: Number(inventory.stock_quantity) - quantity
  //       }
  //     });

  //     // add customers update the customer details with the transaction details. we will need a customer transaction table
  //     let transaction ;
  //     if(!customerId) {
  //          // Create the new transaction entry in the database
  //    transaction = await prisma.transaction.create({
  //     data: {
  //       transactionId ,
  //       supplierProductId,
  //       quantity: quantity,
  //       productName,
  //       price: price,
  //       discount: discount,
  //       vat: vat,
  //       totalCost,
  //       paymentMethod,
  //       subtotal // Subtotal before VAT
  //     }
  //   });
  //     }else {
  //          // Create the new transaction entry in the database
  //    transaction = await prisma.transaction.create({
  //     data: {
  //       transactionId ,
  //       supplierProductId,
  //       quantity: quantity,
  //       productName,
  //       price: price,
  //       discount: discount,
  //       vat: vat,
  //       customerId,

  //       totalCost,
  //       paymentMethod,
  //       subtotal // Subtotal before VAT
  //     }
  //   });
  //     }

  //   const message = utilMessage.created('transaction');
  //   res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, transaction, message));
  // }

  // /**
  //  * Update an existing transaction.
  //  * @param req The Express request object containing the transaction ID in the params and updated details in the body.
  //  * @param res The Express response object used to send the response back to the client.
  //  */
  // @joiValidation(transactionSchema)
  // public async updateTransaction(req: Request, res: Response): Promise<void> {
  //   const { transactionId } = req.params; // Extract the transaction ID from the URL params
  //   const { supplier_products_id, quantity, productName, price, discount, vat, customerId, transactionDateCreated } = req.body;

  //   // Update the existing transaction entry in the database
  //   const updatedTransaction = await prisma.transaction.update({
  //     where: { transactionId },
  //     data: {
  //       supplier_products_id,
  //       quantity: new Decimal(quantity),
  //       productName,
  //       price: new Decimal(price),
  //       discount: new Decimal(discount),
  //       vat: new Decimal(vat),
  //       customerId,
  //       transactionDateCreated: new Date(transactionDateCreated),
  //       totalCost: new Decimal(price * quantity).minus(new Decimal(discount)).plus(new Decimal(vat)),
  //       paymentMethod: req.body.paymentMethod || null,
  //       subtotal: new Decimal(price * quantity).minus(new Decimal(discount))
  //     }
  //   });

  //   const message = utilMessage.updateMessage('transaction');
  //   res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedTransaction, message));
  // }

  /**
   * Delete an existing transaction.
   * @param req The Express request object containing the transaction ID in the params.
   * @param res The Express response object used to send the response back to the client.
   */
  // public async deleteTransaction(req: Request, res: Response): Promise<void> {
  //   const { transactionId } = req.params;

  //   // Delete the transaction entry from the database
  //   await prisma.transaction.delete({
  //     where: { transactionId }
  //   });

  //   res.status(StatusCodes.NO_CONTENT).send();
  // }
}


