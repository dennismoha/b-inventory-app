// controllers/purchase.controller.ts
import { Request, Response } from 'express';
import prisma, { PrismaTransactionalClient } from '@src/shared/prisma/prisma-client';
import { createPurchaseSchema } from '../schema/purchase-schema';
import { CreatePurchaseRequest, PaymentType, ReferenceTypes } from '../interface/purchase.interface';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountController } from '@src/features/accounting/controller/accounts-controller';
import { Account_Inventory } from '@src/constants';
import { JournalService } from '@src/features/accounting/controller/journals-controller';

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
    const result: CreatePurchaseRequest[] = purchases.map((purchase) => ({
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
    return res.status(200).json({ data: result });
  }
}
