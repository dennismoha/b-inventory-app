// controllers/purchase.controller.ts
import { Request, Response } from 'express';
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client';
import { createPurchaseSchema } from '../schema/purchase-schema';
import { CreatePurchaseRequest, PaymentType, purchaseList, ReferenceTypes } from '../interface/purchase.interface';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Inventory, Account_Bank } from '@src/constants';
import { JournalService } from '@src/features/accounting/controller/journals-controller';
import { StatusCodes } from 'http-status-codes';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';

// type Tx = Parameters<typeof prisma.$transaction>[0] extends (cb: infer Cb) => any ? Cb extends (tx: infer T) => any ? T : never : never;

// Enum helpers (keep aligned with your Prisma enums)
// type PaymentType = 'full' | 'partial' | 'credit' | 'full_split';
// type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';
// type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

// type CreatePurchaseWithDiscount = CreatePurchaseRequest & {
//   purchase_id: string;
// };

export class PurchaseController {
  /**
   * Public entry point hit by router
   */

  static opening_closing_balance: string | '';

  @joiValidation(createPurchaseSchema)
  public async create(req: Request, res: Response) {
    console.log('req.headers ', req.headers);
    const passedPosSessionId = Array.isArray(req.headers['pos_session'])
      ? req.headers['pos_session'][0] // take the first if multiple
      : req.headers['pos_session'] || ''; // fallback to empty string if undefined

    console.log('passedPosSessionId is ', passedPosSessionId);

    const posid = await prisma.openingClosingBalance.findFirst({
      where: { pos_session_id: passedPosSessionId, status: 'PREV' },
      select: { cash_bank_ledger_id: true }
    });

    console.log(' pos id is ', posid);
    PurchaseController.opening_closing_balance = posid?.cash_bank_ledger_id ? posid.cash_bank_ledger_id : '';

    const data: CreatePurchaseRequest = req.body;

    // Domain validations (quantity vs damaged)
    if (data.damaged_units > data.quantity) {
      throw new BadRequestError('damaged_units cannot exceed quantity.');
    }

    // Compute undamaged units
    const undamaged_units = data.quantity - data.damaged_units;

    // try {
    const result = await prisma.$transaction(async (tx) => {
      // Ensure unique batch (early exit in txn to avoid race)
      const existing = await tx.purchase.findUnique({ where: { batch: data.batch } });
      if (existing) {
        throw new BadRequestError('Batch already exists');
      }

      const inventoryAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type });
      if (inventoryAccount.account_id === data.account_id) {
        throw new BadRequestError('credit account cannot be equal to debit account');
      }
      console.log('inventory account is ', inventoryAccount);

      const journalEntry = await JournalService.createJournalEntry(tx, {
        transactionId: 'purchase_payment',
        description: 'purchase payment',
        lines: [
          {
            account_id: data.account_id!,
            credit: data.total_purchase_cost
          },
          {
            account_id: inventoryAccount.account_id,
            debit: data.total_purchase_cost
          }
        ]
      });

      console.log('journal entry is ', journalEntry);

      // Route by payment type
      let purchase;
      switch (data.payment_type as PaymentType) {
        case 'full':
          purchase = await PurchaseController.handleFullPayment(data, undamaged_units, tx);
          break;
        // case 'partial':
        //     purchase = await this.handlePartialPayment(data, undamaged_units, tx);
        //     break;
        case 'credit':
          purchase = await PurchaseController.handleCreditPayment(data, undamaged_units, tx);
          break;
        // case 'full_split':
        //     purchase = await this.handleFullSplitPayment(data, undamaged_units, tx);
        //     break;
        default:
          throw new Error(`Unsupported payment_type: ${data.payment_type}`);
      }

      return {
        message: 'Purchase created successfully',
        data: {
          purchase_id: purchase.purchase_id,
          batch: purchase.batch,
          total_purchase_cost: purchase.total_purchase_cost,
          damaged_units: purchase.damaged_units,
          undamaged_units: purchase.undamaged_units,
          payment_type: purchase.payment_type,
          payment_status: purchase.payment_status
        }
      };
    });

    return res.status(201).json(result);
    // } catch (err: any) {
    //     return res.status(400).json({ error: err.message || 'Failed to create purchase' });
    // }
  }

  // ========== Payment type handlers ==========

  private static async handleFullPayment(data: CreatePurchaseRequest, undamaged_units: number, tx: PrismaTransactionalClient) {
    // Require account_id when recording a payment leg (to hit cashbook)
    // optional since we check it on the joi validator
    if (!data.account_id) throw new Error('account_id is required for full payment');
    if (!data.payment_method) throw new Error('payment_method is required for full payment');

    // Create Purchase (fields EXACTLY as your model)
    const purchase = await tx.purchase.create({
      data: {
        batch: data.batch,
        supplier_products_id: data.supplier_products_id,
        quantity: data.quantity,
        damaged_units: data.damaged_units,
        reason_for_damage: data.reason_for_damage ?? null,
        undamaged_units,
        unit_id: data.unit_id,
        purchase_cost_per_unit: data.purchase_cost_per_unit,
        total_purchase_cost: data.total_purchase_cost,
        discounts: data.discounts,
        tax: data.tax,
        payment_type: 'full',
        payment_method: data.payment_method as PaymentMethod,
        payment_status: 'paid',
        payment_date: new Date(),
        account_id: data.account_id,
        payment_reference: data.payment_reference ?? null,
        arrival_date: data.arrival_date
      }
    });

    console.log('purchase is ', purchase);

    // Post-create utilities
    await this.recordDamageIfAny(purchase, tx);
    await this.createBatchInventory(purchase, tx);
    // await AccountController.adjustBalance({
    //     tx,
    //     account_id: data.account_id,
    //     amount: data.total_purchase_cost,
    //     action: 'debit',
    //     pos_session_id: PurchaseController.opening_closing_balance,
    //     user: 'user' // or req.user.name, etc.
    // });

    // Cashbook entry (single leg, full)
    await this.logCashbookEntry({
      tx,
      // purchase: purchase.total_purchase_cost,
      account_id: data.account_id,
      amount: data.total_purchase_cost,
      payment_method: data.payment_method,
      payment_reference: 'PURCHASE_PAYMENT'
    });

    return purchase;
  }

  // private static async handlePartialPayment(data: CreatePurchaseRequest, undamaged_units: number, tx: PrismaTransactionalClient) {
  //     // Validate payments present
  //     if (!Array.isArray(data.payments) || data.payments.length === 0) {
  //         throw new Error('At least one partial payment is required.');
  //     }
  //     // Sum & check equals total
  //     const totalPaid = data.payments.reduce((s: number, p: any) => s + Number(p.amount_paid), 0);
  //     if (Number(totalPaid.toFixed(2)) !== Number(Number(data.total_purchase_cost).toFixed(2))) {
  //         throw new Error('Total partial payments do not match the total purchase cost.');
  //     }

  //     // Create Purchase
  //     const purchase = await tx.purchase.create({
  //         data: {
  //             batch: data.batch,
  //             supplier_products_id: data.supplier_products_id,
  //             quantity: data.quantity,
  //             damaged_units: data.damaged_units,
  //             reason_for_damage: data.reason_for_damage ?? null,
  //             undamaged_units,
  //             unit_id: data.unit_id,
  //             purchase_cost_per_unit: data.purchase_cost_per_unit,
  //             total_purchase_cost: data.total_purchase_cost,
  //             discounts: data.discounts,
  //             tax: data.tax,
  //             payment_type: 'partial',
  //             payment_method: data.payment_method, // split legs carry their own method
  //             payment_status: 'paid', // because your pseudocode: fully equals total => paid
  //             payment_date: new Date(),
  //             account_id: null,
  //             payment_reference: data.payment_reference ?? null,
  //             arrival_date: data.arrival_date
  //         }
  //     });

  //     // Post-create utilities
  //     await this.recordDamageIfAny(purchase, tx);
  //     await this.createBatchInventory(purchase, tx);

  //     // Create payment legs + cashbook entries
  //     for (const leg of data.payments) {
  //         if (!leg.account_id) throw new Error('account_id is required on each partial payment leg');
  //         if (!leg.payment_method) throw new Error('payment_method is required on each partial payment leg');

  //         await tx.purchasePayment.create({
  //             data: {
  //                 purchase_id: purchase.purchase_id,
  //                 account_id: leg.account_id,
  //                 amount_paid: leg.amount_paid,
  //                 payment_method: leg.payment_method,
  //                 payment_reference: leg.payment_reference ?? null,
  //                 payment_date: leg.payment_date ? new Date(leg.payment_date) : new Date()
  //             }
  //         });

  // should also be sent to batchPayables. that is total -what is paid. what is left is debt.

  //         await this.logCashbookEntry({
  //             tx,
  //             purchase,
  //             account_id: leg.account_id,
  //             amount: leg.amount_paid,
  //             payment_method: leg.payment_method,
  //             payment_reference: leg.payment_reference
  //         });
  //     }

  //     // No payables since fully covered by partial legs
  //     return purchase;
  // }

  private static async handleCreditPayment(data: CreatePurchaseRequest, undamaged_units: number, tx: PrismaTransactionalClient) {
    // Create Purchase
    const purchase = await tx.purchase.create({
      data: {
        batch: data.batch,
        supplier_products_id: data.supplier_products_id,
        quantity: data.quantity,
        damaged_units: data.damaged_units,
        reason_for_damage: data.reason_for_damage ?? null,
        undamaged_units,
        unit_id: data.unit_id,
        purchase_cost_per_unit: data.purchase_cost_per_unit,
        total_purchase_cost: data.total_purchase_cost,
        discounts: data.discounts,
        tax: data.tax,
        payment_type: 'credit',
        payment_method: 'BANK',
        payment_status: 'unpaid',
        payment_date: null,
        account_id: null,
        payment_reference: data.payment_reference ?? null,
        arrival_date: data.arrival_date
      }
    });

    // Post-create utilities
    await this.recordDamageIfAny(purchase, tx);
    await this.createBatchInventory(purchase, tx);

    // Create BatchPayables
    await tx.batchPayables.create({
      data: {
        purchase_id: purchase.purchase_id,
        amount_due: purchase.total_purchase_cost,
        total_paid: 0, // total to be paid.
        status: 'unsettled', // your PayableStatus enum
        payment_type: 'credit', // matches PaymentType in your schema
        balance_due: purchase.total_purchase_cost,
        settlement_date: null
      }
    });

    return purchase;
  }

  // private static async handleFullSplitPayment(data: CreatePurchaseRequest, undamaged_units: number, tx: PrismaTransactionalClient) {
  //     if (!Array.isArray(data.payments) || data.payments.length === 0) {
  //         throw new Error('At least one split payment is required.');
  //     }
  //     const totalSplit = data.payments.reduce((s: number, p: any) => s + Number(p.amount_paid), 0);
  //     if (Number(totalSplit.toFixed(2)) !== Number(Number(data.total_purchase_cost).toFixed(2))) {
  //         throw new Error('Total split payments do not match the total purchase cost.');
  //     }

  //     const purchase = await tx.purchase.create({
  //         data: {
  //             batch: data.batch,
  //             supplier_products_id: data.supplier_products_id,
  //             quantity: data.quantity,
  //             damaged_units: data.damaged_units,
  //             reason_for_damage: data.reason_for_damage ?? null,
  //             undamaged_units,
  //             unit_id: data.unit_id,
  //             purchase_cost_per_unit: data.purchase_cost_per_unit,
  //             total_purchase_cost: data.total_purchase_cost,
  //             discounts: data.discounts,
  //             tax: data.tax,
  //             payment_type: 'full_split',
  //             payment_method: null,
  //             payment_status: 'paid',
  //             payment_date: new Date(),
  //             account_id: null,
  //             payment_reference: data.payment_reference ?? null,
  //             arrival_date: data.arrival_date
  //         }
  //     });

  //     await this.recordDamageIfAny(purchase, tx);
  //     await this.createBatchInventory(purchase, tx);

  //     for (const leg of data.payments) {
  //         if (!leg.account_id) throw new Error('account_id is required on each split payment leg');
  //         if (!leg.payment_method) throw new Error('payment_method is required on each split payment leg');

  //         await tx.purchasePayment.create({
  //             data: {
  //                 purchase_id: purchase.purchase_id,
  //                 account_id: leg.account_id,
  //                 amount_paid: leg.amount_paid,
  //                 payment_method: leg.payment_method,
  //                 payment_reference: leg.payment_reference ?? null,
  //                 payment_date: leg.payment_date ? new Date(leg.payment_date) : new Date()
  //             }
  //         });

  //         await this.logCashbookEntry({
  //             tx,
  //             purchase,
  //             account_id: leg.account_id,
  //             amount: leg.amount_paid,
  //             payment_method: leg.payment_method,
  //             payment_reference: leg.payment_reference
  //         });
  //     }

  //     return purchase;
  // }

  // ========== Utilities ==========

  private static async recordDamageIfAny(purchase: CreatePurchaseRequest & { purchase_id: string }, tx: PrismaTransactionalClient) {
    if (!purchase.damaged_units || purchase.damaged_units <= 0) return;

    await tx.purchaseDamage.create({
      data: {
        purchase_id: purchase.purchase_id,
        quantity: purchase.damaged_units,
        reason: purchase.reason_for_damage ?? '',
        damage_date: new Date()
      }
    });
  }

  private static async createBatchInventory(purchase: CreatePurchaseRequest & { purchase_id: string }, tx: PrismaTransactionalClient) {
    await tx.batchInventory.create({
      data: {
        batch_name: purchase.batch,
        supplier_products_id: purchase.supplier_products_id,
        purchase_id: purchase.purchase_id,
        total_units: purchase.quantity - purchase.damaged_units,
        status: 'PENDING'
      }
    });

    await tx.productSummary.upsert({
      update: {
        supplier_products_id: purchase.supplier_products_id,
        total_received: {
          increment: purchase.quantity - purchase.damaged_units
        },
        total_cost_value: {
          increment: (purchase.quantity - purchase.damaged_units) * Number(purchase.purchase_cost_per_unit)
        }
      },
      create: {
        supplier_products_id: purchase.supplier_products_id,
        total_received: purchase.quantity - purchase.damaged_units,
        total_sold: 0,
        reorder_level: 0,
        total_cost_value: (purchase.quantity - purchase.damaged_units) * Number(purchase.purchase_cost_per_unit)
      },
      where: {
        supplier_products_id: purchase.supplier_products_id
      }
    });
  }

  private static async logCashbookEntry(args: {
    tx: PrismaTransactionalClient;
    // purchase: number | Decimal;
    account_id: string;
    amount: number | Decimal;
    payment_method: PaymentMethod;
    payment_reference?: ReferenceTypes;
  }) {
    console.log('args ', args.account_id);
    const { tx, amount, account_id, payment_method } = args;

    console.log('amount is ', amount);

    // Optional: ensure sufficient balance before spending (if you maintain live balances)
    // const account = await tx.account.findUnique({ where: { account_id } });
    // if (account && account.balance < amount) throw new Error('Insufficient account balance');

    // await tx.cashBookLedger.create({
    //     data: {
    //         opening_closing_balance_id: null,
    //         transaction_type: 'DEBIT', // money out for purchase
    //         amount,
    //         method: payment_method,
    //         reference_type: 'PURCHASE',
    //         reference_id: purchase.purchase_id,
    //         description: `Purchase ${purchase.batch}`,
    //         account_id,
    //         // balance_after: ... // set if you keep rolling balance here
    //     }
    // });
    console.log('purchase controller ', PurchaseController.opening_closing_balance);

    if (PurchaseController.opening_closing_balance !== '') {
      await tx.cashBookLedger.create({
        data: {
          transaction_type: TransactionType.OUTFLOW,
          opening_closing_balance_id: PurchaseController.opening_closing_balance,
          amount: amount,
          method: payment_method,
          reference_type: 'PURCHASE_PAYMENT',
          // reference_id: 'REF',
          account_id: account_id // just set FK directly
          // CashBookLedgers: {
          //     connect: { account_id: account_id! }
          // }
        }
      });
    } else {
      throw new BadRequestError('opening and closing balance cannot be undefined');
    }

    // Optional: update account running balance
    // await tx.account.update({ where: { account_id }, data: { balance: new Prisma.Decimal(account.balance).minus(amount) } });
  }

  // fetch all purchase
  public async getAll(req: Request, res: Response) {
    const purchases = await prisma.purchase.findMany();
    const result: purchaseList[] = purchases.map((purchase) => ({
      purchase_id: purchase.purchase_id,
      batch: purchase.batch,
      supplier_products_id: purchase.supplier_products_id,
      quantity: purchase.quantity,
      damaged_units: purchase.damaged_units,
      reason_for_damage: purchase.reason_for_damage,
      unit_id: purchase.unit_id,
      purchase_cost_per_unit: purchase.purchase_cost_per_unit,
      total_purchase_cost: purchase.total_purchase_cost,
      discounts: purchase.discounts,
      tax: purchase.tax,
      payment_type: purchase.payment_type,
      payment_method: purchase.payment_method,
      payment_status: purchase.payment_status,
      payment_date: purchase.payment_date,
      account_id: purchase.account_id,
      payment_reference: purchase.payment_reference,
      arrival_date: purchase.arrival_date
      // Add other fields from CreatePurchaseRequest if needed
    }));

    return res.status(StatusCodes.ACCEPTED).send(GetSuccessMessage(StatusCodes.ACCEPTED, result, 'purchases fetched successfully'));
  }

  /***
   * edit purchase
   */

  public async editPurchase(req: Request, res: Response) {
    const { field, value, purchase_id, batch } = req.body;

    if (!purchase_id || !batch) {
      throw new BadRequestError('purchase_id and batch are required');
    }

    let result;

    switch (field) {
      case 'supplier_products_id':
        result = await PurchaseController.updateSupplierProduct(purchase_id, value);
        break;

      case 'batch':
        result = await PurchaseController.updateBatchName(purchase_id, value);
        break;

      case 'damaged_units':
        result = await PurchaseController.updateDamagedUnits(purchase_id, Number(value));
        break;

      case 'quantity':
        result = await PurchaseController.updateQuantity(purchase_id, Number(value));
        break;

      // Simple direct updates (no heavy logic)
      case 'arrival_date':
      case 'discounts':
      case 'purchase_cost_per_unit':
      case 'total_purchase_cost':
      case 'tax':
      case 'reason_for_damage':
        result = await PurchaseController.simplePurchaseUpdate(purchase_id, field, value);
        break;

      default:
        throw new BadRequestError(`Unknown or uneditable field: ${field}`);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
      data: result || null
    });
  }

  public static async updateSupplierProduct(purchase_id: string, newSupplierProductId: string) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { purchase_id },
        include: { BatchInventory: true }
      });

      if (!purchase) throw new BadRequestError('Purchase not found');

      const batchInventory = purchase.BatchInventory;
      const oldSupplierProductId = purchase.supplier_products_id;

      // Check if already sold
      const sold = await tx.sales.findFirst({
        where: { BatchInventoryId: batchInventory?.batch_inventory_id }
      });
      if (sold) throw new BadRequestError('Product units already sold, cannot change supplier.');

      // Update supplier_products_id in Purchase, Inventory, BatchInventory
      await tx.purchase.update({
        where: { purchase_id },
        data: { supplier_products_id: newSupplierProductId }
      });

      if (batchInventory) {
        await tx.batchInventory.update({
          where: { batch_inventory_id: batchInventory.batch_inventory_id },
          data: { supplier_products_id: newSupplierProductId }
        });
      }

      await tx.inventory.updateMany({
        where: { supplier_products_id: oldSupplierProductId },
        data: { supplier_products_id: newSupplierProductId }
      });

      // Update productSummary adjustments
      const undamagedUnits = purchase.undamaged_units;

      // Subtract from old supplier summary
      await tx.productSummary.updateMany({
        where: { supplier_products_id: oldSupplierProductId },
        data: {
          total_received: { decrement: undamagedUnits },
          total_cost_value: {
            decrement: undamagedUnits * Number(purchase.purchase_cost_per_unit)
          }
        }
      });

      // Add to new supplier summary
      await tx.productSummary.updateMany({
        where: { supplier_products_id: newSupplierProductId },
        data: {
          total_received: { increment: undamagedUnits },
          total_cost_value: {
            increment: undamagedUnits * Number(purchase.purchase_cost_per_unit)
          }
        }
      });

      // Set undamaged_units in purchase to 0
      await tx.purchase.update({
        where: { purchase_id },
        data: { undamaged_units: 0 }
      });

      return {
        message: 'Supplier product updated successfully.'
      };
    });
  }

  public static async updateBatchName(purchase_id: string, newBatch: string) {
    console.log('updaing batch name', newBatch);
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.batchInventory.findUnique({
        where: { batch_name: newBatch }
      });

      if (existing) throw new BadRequestError('Batch name already exists.');

      await tx.batchInventory.update({
        where: { purchase_id },
        data: { batch_name: newBatch }
      });

      await tx.purchase.update({
        where: { purchase_id },
        data: { batch: newBatch }
      });

      return {
        message: 'Batch name updated successfully.'
      };
    });
  }

  public static async updateDamagedUnits(purchase_id: string, newDamagedUnits: number) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { purchase_id },
        include: { BatchInventory: true }
      });
      if (!purchase) throw new BadRequestError('Purchase not found');

      if (newDamagedUnits > purchase.quantity) throw new BadRequestError('Damaged units cannot be greater than quantity.');

      const totalUnits = purchase.quantity - newDamagedUnits;
      const oldUndamagedUnits = purchase.undamaged_units;
      const supplier_products_id = purchase.supplier_products_id;

      // Update damaged_units and undamaged_units
      await tx.purchase.update({
        where: { purchase_id },
        data: {
          damaged_units: newDamagedUnits,
          undamaged_units: totalUnits
        }
      });

      // Update batchInventory total_units
      await tx.batchInventory.updateMany({
        where: { purchase_id },
        data: { total_units: totalUnits }
      });

      // Update inventory
      await tx.inventory.updateMany({
        where: { supplier_products_id },
        data: { stock_quantity: totalUnits }
      });

      // Adjust productSummary totals
      await tx.productSummary.updateMany({
        where: { supplier_products_id },
        data: {
          total_received: {
            decrement: oldUndamagedUnits
          }
        }
      });

      await tx.productSummary.updateMany({
        where: { supplier_products_id },
        data: {
          total_received: { increment: totalUnits },
          total_cost_value: {
            increment: totalUnits * Number(purchase.purchase_cost_per_unit)
          }
        }
      });

      return {
        message: 'Damaged units updated successfully.'
      };
    });
  }

  public static async updateQuantity(purchase_id: string, newQuantity: number) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { purchase_id },
        include: { BatchInventory: true }
      });
      if (!purchase) throw new BadRequestError('Purchase not found');

      if (newQuantity <= 0) throw new BadRequestError('Quantity must be greater than 0.');

      const totalUnits = newQuantity - purchase.damaged_units;
      const oldUndamagedUnits = purchase.undamaged_units;
      const supplier_products_id = purchase.supplier_products_id;

      // Update purchase quantity and undamaged_units
      await tx.purchase.update({
        where: { purchase_id },
        data: {
          quantity: newQuantity,
          undamaged_units: totalUnits
        }
      });

      // Update batchInventory total_units
      await tx.batchInventory.updateMany({
        where: { purchase_id },
        data: { total_units: totalUnits }
      });

      // Update inventory
      await tx.inventory.updateMany({
        where: { supplier_products_id },
        data: { stock_quantity: totalUnits }
      });

      // Adjust productSummary
      await tx.productSummary.updateMany({
        where: { supplier_products_id },
        data: {
          total_received: {
            decrement: oldUndamagedUnits
          }
        }
      });

      await tx.productSummary.updateMany({
        where: { supplier_products_id },
        data: {
          total_received: { increment: totalUnits },
          total_cost_value: {
            increment: totalUnits * Number(purchase.purchase_cost_per_unit)
          }
        }
      });

      return {
        message: 'Quantity updated successfully.'
      };
    });
  }

  public static async simplePurchaseUpdate(purchase_id: string, field: string, value: string) {
    console.log('simple purchase updating reason for damage', field, value);
    const purchase = await prisma.purchase.update({
      where: { purchase_id },
      data: { [field]: value }
    });

    return {
      message: `${field.replace('_', ' ')} updated successfully.`,
      data: purchase
    };
  }

  // end of purchae edit

  // delete purchase
  public async deletePurchase(req: Request, res: Response) {
    const { purchase_id, batch } = req.body;

    if (!purchase_id || !batch) {
      throw new BadRequestError('purchase_id and batchInventoryId are required');
    }

    // Check if purchase exists
    const purchase = await prisma.batchInventory.findFirst({
      where: { purchase_id, batch_name: batch },
      select: {
        purchase_id: true,
        batch_inventory_id: true,
        supplier_products_id: true,
        total_units: true
      }
    });

    if (!purchase) {
      throw new BadRequestError('Purchase not found');
    } else {
      console.log('purchase found...... is ', purchase);
    }

    // fetch purchase total units for each
    const purchaseProduct = await prisma.purchase.findUnique({
      where: { purchase_id },
      select: {
        purchase_cost_per_unit: true,
        payment_type: true,
        total_purchase_cost: true
      }
    });

    if (!purchaseProduct) {
      throw new BadRequestError('Purchase not found');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if the purchase has been sold
      const salesRecord = await tx.sales.findFirst({
        where: { BatchInventoryId: purchase.batch_inventory_id }
      });

      if (salesRecord) {
        throw new BadRequestError('Cannot delete an already sold item');
      }

      // Delete from batchInventory
      await tx.batchInventory.delete({
        where: { batch_inventory_id: purchase.batch_inventory_id }
      });

      // update the batch lifecycle
      await tx.batchLifecycle.updateMany({
        where: { batch_id: purchase.batch_inventory_id },
        // data: { status: 'DELETED' }
        data: { ended_at: new Date() }
      });

      // Fetch total_units from purchase table
      const purchaseRecord = await tx.productSummary.findUnique({
        where: { supplier_products_id: purchase.supplier_products_id }
      });

      if (!purchaseRecord) {
        throw new BadRequestError('Purchase record not found');
      }

      await tx.productSummary.update({
        where: { supplier_products_id: purchase.supplier_products_id },
        data: {
          total_received: {
            decrement: purchaseRecord.total_received - purchase.total_units
          },
          total_cost_value: {
            decrement: (purchaseRecord.total_received - purchase.total_units) * Number(purchaseProduct.purchase_cost_per_unit)
          }
        }
      });

      // check for payment types. full, credi

      switch (purchaseProduct.payment_type) {
        case 'full':
          // Delete from expenses table if exists
          await PurchaseController.deletePurchasePayment(purchase_id, purchaseProduct.total_purchase_cost, tx);
          console.log('payment is full');
          break;
        case 'credit':
          console.log('payment is credit');
          break;

        default:
          throw new BadRequestError('Unsupported payment type for deletion');
      }

      return { message: 'Purchase deleted successfully', purchase_id, batch_inventory_id: purchase.batch_inventory_id };
    });

    return res.status(StatusCodes.ACCEPTED).json({ message: 'deketed succesfully', result });

    /**
     * tables
     */

    /**
     * delete for payment_type full
     *
     * click on delete. payload purchase_id, batchInventoryId.
     * first check in purchase table if both exists. if not throw an error. else continue
     * query the sales tahble to check if batchInventoryId exists and is equal to the batchInventoryId in our req.
     * if yes. throw an error, cannot delete an arleady sold item.
     * if none, check the invetnroy table if the batchInventoryId exists.. if yes delete it since no record of it in sales table then it has not been sold.
     * also update the batchLifecycle.
     * if non e continue.
     * fetcg total_units from the records of total units returned from fetching the purchase table,
     * gi to productSummary table and update the total received by subtracting the total_units from the total received of using the supplier_products_id key
     * if done.
     * check the expenses table and delete the record of the purchase_id if it exists. use purchase_id field
     * if sucecessful
     * go to the Purchase table and delete the record of the purchase_id. also on delete cascade so this should also delete this respective unit on batchInventory ttable.
     * then go to the journals and credit and debit from the respective records.
     * once done return deleted successfully.
     *
     *
     * deelte for payment type credit.
     * rhis will go on as avoce ecept that  on journals we will skip since it is not ssved on journal yet.
     * we will have to fetch from batchPayables table and delete the record of the purchase_id.
     * check if any payments was done and also willl have to adjust the journals for this respectivelu.
     * this feature willl be fully done once batchpayables auments has been done.
     */
  }

  private static async deletePurchasePayment(purchase_id: string, total: Decimal, tx: PrismaTransactionalClient) {
    const inventoryAccount = await AccountController.findAccount({ tx, name: Account_Inventory.name, type: Account_Inventory.acc_type }); //
    const bankAccount = await AccountController.findAccount({ tx, name: Account_Bank.name, type: Account_Bank.acc_type });

    const journalEntry = await JournalService.createJournalEntry(tx, {
      transactionId: 'purchase_delete',
      description: 'purchase delete',
      lines: [
        {
          account_id: inventoryAccount.account_id!,
          credit: total
        },
        {
          account_id: bankAccount.account_id,
          debit: total
        }
      ]
    });
    console.log('journal entry is ', journalEntry);

    await tx.purchase.delete({
      where: { purchase_id }
    });

    // Delete related batch payables, damages, and cashbook entries
    // await this.deleteBatchPayables(purchase_id, tx);
    // await this.deletePurchaseDamage(purchase_id, tx);
    // await this.deleteCashbookEntries(purchase_id, tx);

    // Optionally delete journal entries if needed
    // await this.deleteJournalEntries(purchase_id, tx);

    console.log('purchase deleted successfully');
    // Return the journal entry or any other relevant data
    console.log('journal entry is ', journalEntry);

    return journalEntry;
  }

  private async deleteBatchPayables(purchase_id: string, tx: PrismaTransactionalClient) {
    // Delete all batch payables related to this purchase
    await tx.batchPayables.deleteMany({
      where: { purchase_id }
    });
  }

  private async deletePurchaseDamage(purchase_id: string, tx: PrismaTransactionalClient) {
    // Delete all damages related to this purchase
    await tx.purchaseDamage.deleteMany({
      where: { purchase_id }
    });
  }

  private async deleteCashbookEntries(purchase_id: string, tx: PrismaTransactionalClient) {
    // Delete all cashbook entries related to this purchase
    await tx.cashBookLedger.deleteMany({
      where: { reference_id: purchase_id, reference_type: 'PURCHASE_PAYMENT' }
    });
  }

  // private async deleteJournalEntries(purchase_id: string, tx: PrismaTransactionalClient) {
  //   // Delete all journal entries related to this purchase
  //     const journalEntry = await JournalService.createJournalEntry(tx, {
  //       transactionId: 'purchase_payment',
  //       description: 'purchase payment',
  //       lines: [
  //         {
  //           account_id: data.account_id!,
  //           credit: data.total_purchase_cost
  //         },
  //         {
  //           account_id: inventoryAccount.account_id,
  //           debit: data.total_purchase_cost
  //         }
  //       ]
  //     });

  // }

  // PaymentService.ts

  public async updatePaymentType(req: Request, res: Response) {
    console.log('req is ', req);
    console.log(' req body si s', req.body);

    const { purchase_id, payment_type } = req.body;
    const data: purchaseList = req.body;
    // 🔹 Fetch existing purchase
    const existingPurchase = await prisma.purchase.findUnique({
      where: { purchase_id },
      select: { payment_type: true }
    });

    if (!existingPurchase) {
      throw new BadRequestError('Purchase record not found');
    }

    // 🔹 Prevent redundant updates
    if (existingPurchase.payment_type === payment_type) {
      throw new BadRequestError(`Payment type is already ${payment_type}`);
    }

    const oldPaymentType = existingPurchase.payment_type;

    // 🔹 Delegate to type-specific handler
    const result = await prisma.$transaction(async (tx) =>
      PurchaseController.handlePaymentTypeUpdate(tx, oldPaymentType, payment_type, data)
    );
    res.json(result);
  }

  static async handlePaymentTypeUpdate(
    tx: PrismaTransactionalClient,
    // purchase: Partial<PaymentType>,
    oldPaymentType: Partial<PaymentType>,
    newPaymentType: Partial<PaymentType>,
    payload: purchaseList
  ) {
    switch (oldPaymentType) {
      case 'credit':
        if (newPaymentType === 'full') {
          return this.handleFullPaymentTypeUpdate(tx, payload);
        } else if (newPaymentType === 'partial') {
          return 'this is not completed yet';
          // return this.handlePartialPaymentTypeUpdate(tx, payload);
        }
        break;

      case 'full':
        if (newPaymentType === 'credit') {
          return this.handleCreditPaymentTypeUpdate(tx, payload);
        }
        break;

      default:
        throw new BadRequestError(`Unsupported payment type transition: ${oldPaymentType} → ${newPaymentType}`);
    }
  }

  // =======================================================
  // CREDIT → FULL
  // =======================================================
  static async handleFullPaymentTypeUpdate(tx: PrismaTransactionalClient, payload: purchaseList) {
    const payable = await tx.batchPayables.findUnique({
      where: { purchase_id: payload.purchase_id }
    });

    if (!payable) {
      throw new BadRequestError('Credit -> Full payment Batch payable not found for this purchase');
    }

    const now = new Date();

    //  Update BatchPayables
    await tx.batchPayables.update({
      where: { purchase_id: payload.purchase_id },
      data: {
        payment_type: 'full',
        total_paid: payable.amount_due,
        balance_due: 0,
        status: 'settled',
        settlement_date: now,
        updated_at: now
      }
    });

    //  Update Purchase
    const updatedPurchase = await tx.purchase.update({
      where: { purchase_id: payload.purchase_id },
      data: {
        payment_type: 'full',
        payment_status: 'paid',
        total_purchase_cost: payload.total_purchase_cost,
        purchase_cost_per_unit: payload.purchase_cost_per_unit,
        payment_date: now,
        account_id: payload.account_id,
        payment_reference: payload.payment_reference,
        updated_at: now
      }
    });

    const InventoryAccount = await AccountController.findAccount({
      tx,
      name: Account_Inventory.name,
      type: Account_Inventory.acc_type
    });

    await JournalService.createJournalEntry(tx, {
      transactionId: 'purchase_payment_full',
      description: `Full payment for purchase ${payload.batch}`,
      lines: [
        {
          account_id: InventoryAccount.account_id, // Debit Inventory
          debit: payable.amount_due
        },
        {
          account_id: payload.account_id!, // Credit Bank
          credit: payable.amount_due
        }
      ]
    });

    // Create Journal Entry
    return { message: 'Payment type updated from credit to full', purchase: updatedPurchase };
  }

  // =======================================================
  // FULL → CREDIT
  // =======================================================
  static async handleCreditPaymentTypeUpdate(tx: PrismaTransactionalClient, purchase: purchaseList) {
    // const payable = await tx.batchPayables.findUnique({
    //   where: { purchase_id: purchase.purchase_id },
    // });

    // if (!payable) {
    //   throw new BadRequestError('Full -> CreditBatch payable not found for this purchase');
    // }

    const now = new Date();

    await tx.batchPayables.upsert({
      where: { purchase_id: purchase.purchase_id },
      create: {
        purchase_id: purchase.purchase_id,
        amount_due: purchase.total_purchase_cost,
        total_paid: 0,
        status: 'unsettled',
        payment_type: 'credit',
        balance_due: purchase.total_purchase_cost,
        settlement_date: null,
        created_at: now,
        updated_at: now
      },
      update: {
        payment_type: 'credit',
        total_paid: 0,
        amount_due: purchase.total_purchase_cost,
        balance_due: purchase.total_purchase_cost,
        status: 'unsettled',
        settlement_date: null,
        updated_at: now
      }
    });

    const updatedPurchase = await tx.purchase.update({
      where: { purchase_id: purchase.purchase_id },
      data: {
        payment_type: 'credit',
        payment_status: 'unpaid',
        payment_date: null,
        total_purchase_cost: 0,
        account_id: null,
        payment_reference: null,
        updated_at: now
      }
    });

    const InventoryAccount = await AccountController.findAccount({
      tx,
      name: Account_Inventory.name,
      type: Account_Inventory.acc_type
    });

    // if (!payable) {
    //   await JournalService.createJournalEntry(tx, {
    //   transactionId: 'credit',
    //   description: `from Full to credit payment for purchase ${purchase.batch}`,
    //   lines: [
    //     {
    //       account_id:  purchase.account_id!, // Debit Inventory
    //       debit: payable.amount_due
    //     },
    //     {
    //       account_id: InventoryAccount.account_id, // Credit Bank
    //       credit: payable.amount_due
    //     }
    //   ]
    // });
    // }else {
    //    await JournalService.createJournalEntry(tx, {
    //   transactionId: 'credit',
    //   description: `from Full to credit payment for purchase ${purchase.batch}`,
    //   lines: [
    //     {
    //       account_id:  purchase.account_id!, // Debit Inventory
    //       debit: payable.amount_due
    //     },
    //     {
    //       account_id: InventoryAccount.account_id, // Credit Bank
    //       credit: payable.amount_due
    //     }
    //   ]
    // });
    // }

    await JournalService.createJournalEntry(tx, {
      transactionId: 'credit',
      description: `from Full to credit payment for purchase ${purchase.batch}`,
      lines: [
        {
          account_id: purchase.account_id!, // Debit Inventory
          debit: purchase.total_purchase_cost
        },
        {
          account_id: InventoryAccount.account_id, // Credit Bank
          credit: purchase.total_purchase_cost
        }
      ]
    });

    return { message: 'Payment type updated from full to credit', purchase: updatedPurchase };
  }

  // =======================================================
  // CREDIT → PARTIAL (for completeness)
  // =======================================================
  // static async handlePartialPaymentTypeUpdate(tx: PrismaTransactionalClient, payload: any) {
  //   const payable = await tx.batchPayables.findUnique({
  //     where: { purchase_id: payload.purchase_id },
  //   });

  //   if (!payable) {
  //     throw new BadRequestError('Batch payable not found for this purchase');
  //   }

  //   const now = new Date();

  //   const { partialPaymentAmount } = payload;

  //   if (partialPaymentAmount <= 0 || partialPaymentAmount > Number(payable.amount_due)) {
  //     throw new BadRequestError('Invalid partial payment amount');
  //   }

  //   await tx.batchPayables.update({
  //     where: { purchase_id: purchase.purchase_id },
  //     data: {
  //       payment_type: 'partial',
  //       total_paid: partialPaymentAmount,
  //       balance_due: Number(payable.amount_due) - partialPaymentAmount,
  //       status: partialPaymentAmount === Number(payable.amount_due) ? 'paid' : 'partially_paid',
  //       settlement_date: partialPaymentAmount === Number(payable.amount_due) ? now : null,
  //       updated_at: now,
  //     },
  //   });

  //   const updatedPurchase = await tx.purchase.update({
  //     where: { purchase_id: purchase.purchase_id },
  //     data: {
  //       payment_type: 'partial',
  //       payment_status: partialPaymentAmount === Number(payable.amount_due) ? 'paid' : 'partially_paid',
  //       payment_date: now,
  //       updated_at: now,
  //     },
  //   });

  //   await JournalService.createJournalEntry(tx, {
  //     type: 'PartialPayment',
  //     debitAccount: 'Inventory',
  //     creditAccount: 'Bank',
  //     amount: partialPaymentAmount,
  //     description: `Partial payment made for batch ${purchase.batch}`,
  //   });

  //   return { message: 'Payment type updated from credit to partial', purchase: updatedPurchase };
  // }
}
