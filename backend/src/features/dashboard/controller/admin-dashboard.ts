import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { AdminDashboardResponse } from '../interfaces/dashboard.interfaces';
// import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
// types/adminDashboard.ts

export class SalesController {
  /**
   * Sales dashboard summary with optional date filtering
   */
  public async getSalesDashboard(req: Request, res: Response): Promise<void> {
    // Parse query params
    const { startDate, endDate } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      // Default: yesterday -> today
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      start = yesterday;
      end = today;
    }

    // Top 10 selling products (within date range)
    const topSellingProducts = await prisma.sales.groupBy({
      by: ['productName', 'supplier_products_id'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: { quantity: true, productTotalCost: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    // Recent 10 sales
    const recentSales = await prisma.sales.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: true,
        supplierProduct: true
      }
    });

    // Sales by payment method
    const salesByPaymentMethod = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: {
        transactionDateCreated: {
          gte: start,
          lte: end
        }
      },
      _sum: { totalCost: true },
      _count: { transactionId: true }
    });

    // Daily sales totals (within range)
    const dailySales = await prisma.sales.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: { productTotalCost: true },
      orderBy: { createdAt: 'desc' }
    });

    // Total revenue
    const totalRevenue = await prisma.sales.aggregate({
      _sum: { productTotalCost: true },
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // return res.status(StatusCodes.OK).json(
    //   GetSuccessMessage(200, {
    //     filters: { startDate: start, endDate: end },
    //     topSellingProducts,
    //     recentSales,
    //     salesByPaymentMethod,
    //     dailySales,
    //     totalRevenue: totalRevenue._sum.productTotalCost || 0,
    //   }, 'Sales dashboard data returned successfully')
    // );

    res.json({
      message: 'success',
      filters: { startDate: start, endDate: end },
      topSellingProducts,
      recentSales,
      salesByPaymentMethod,
      dailySales,
      totalRevenue: totalRevenue._sum.productTotalCost || 0
    });
  }

  public async adminDashboard(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 7)); // default = last 7 days
    const end = endDate ? new Date(endDate as string) : new Date(); // default = today

    /**
     * POS Sessions
     */
    const posSessions = await prisma.posSession.findMany({
      where: { openedAt: { gte: start, lte: end } },
      include: { openedUser: true, closedUser: true, balances: true }
    });

    /**
     * Totals
     */
    const [totalSuppliers, totalCustomers, employees] = await Promise.all([
      prisma.suppliers.count(),
      prisma.customer.count(),
      prisma.employee.count()
    ]);

    const customerReceivables = await prisma.customerReceivable.aggregate({
      _sum: { total_Amount: true },
      where: {
        Transactions: { transactionDateCreated: { gte: start, lte: end } }
      }
    });

    const sales = await prisma.sales.aggregate({
      _count: { SalesId: true },
      _sum: { productTotalCost: true },
      where: { createdAt: { gte: start, lte: end } }
    });

    const purchases = await prisma.purchase.aggregate({
      _count: { purchase_id: true },
      _sum: { total_purchase_cost: true },
      where: { created_at: { gte: start, lte: end } }
    });

    const expenses = await prisma.expense.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: { expenseDate: { gte: start, lte: end } }
    });

    const payables = await prisma.batchPayables.aggregate({
      _count: { payable_id: true },
      _sum: { amount_due: true },
      where: { settlement_date: { gte: start, lte: end } }
    });

    /**
     * Grouped by Day (for graphs)
     */
    const salesByDay = await prisma.sales.groupBy({
      by: ['createdAt'],
      _sum: { productTotalCost: true },
      _count: { SalesId: true },
      where: { createdAt: { gte: start, lte: end } }
    });

    const purchasesByDay = await prisma.purchase.groupBy({
      by: ['created_at'],
      _sum: { total_purchase_cost: true },
      _count: { purchase_id: true },
      where: { created_at: { gte: start, lte: end } }
    });

    const expensesByDay = await prisma.expense.groupBy({
      by: ['expenseDate'],
      _sum: { amount: true },
      _count: { id: true },
      where: { expenseDate: { gte: start, lte: end } }
    });

    const payablesByDay = await prisma.batchPayables.groupBy({
      by: ['settlement_date'],
      _sum: { amount_due: true },
      _count: { payable_id: true },
      where: { settlement_date: { gte: start, lte: end } }
    });

    // Normalize date to YYYY-MM-DD for frontend charting
    const normalize = (date: Date) => date.toISOString().split('T')[0];

    const salesSeries = salesByDay.map((s) => ({
      date: normalize(s.createdAt),
      count: s._count.SalesId,
      total: s._sum.productTotalCost ?? 0
    }));

    const purchasesSeries = purchasesByDay.map((p) => ({
      date: normalize(p.created_at),
      count: p._count.purchase_id,
      total: p._sum.total_purchase_cost ? Number(p._sum.total_purchase_cost) : 0
    }));

    const expensesSeries = expensesByDay.map((e) => ({
      date: normalize(e.expenseDate),
      count: e._count.id,
      total: e._sum.amount ? Number(e._sum.amount) : 0
    }));

    const payablesSeries = payablesByDay.map((p) => ({
      date: p.settlement_date ? normalize(p.settlement_date) : '',
      count: p._count.payable_id,
      total: p._sum.amount_due ? Number(p._sum.amount_due) : 0
    }));

    const adminDashboardResponse: AdminDashboardResponse = {
      filters: { start, end },
      posSessions,
      totals: {
        suppliers: totalSuppliers,
        customers: totalCustomers,
        employees,
        receivables: Number(customerReceivables._sum.total_Amount) || 0,
        sales: { count: sales._count.SalesId || 0, total: sales._sum.productTotalCost || 0 },
        purchases: { count: purchases._count.purchase_id || 0, total: Number(purchases._sum.total_purchase_cost) || 0 },
        expenses: { count: expenses._count.id || 0, total: expenses._sum.amount || 0 },
        payables: { count: payables._count.payable_id || 0, total: Number(payables._sum.amount_due) || 0 }
      },
      series: {
        sales: salesSeries,
        purchases: purchasesSeries,
        expenses: expensesSeries,
        payables: payablesSeries
      }
    };

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, adminDashboardResponse, 'dashboard admin details'));

    // return res.status(StatusCodes.OK).json({
    //   filters: { start, end },
    //   posSessions,
    //   totals: {
    //     suppliers: totalSuppliers,
    //     customers: totalCustomers,
    //     employees,
    //     receivables: customerReceivables._sum.total_Amount || 0,
    //     sales: { count: sales._count.SalesId || 0, total: sales._sum.productTotalCost || 0 },
    //     purchases: { count: purchases._count.purchase_id || 0, total: purchases._sum.total_purchase_cost || 0 },
    //     expenses: { count: expenses._count.id || 0, total: expenses._sum.amount || 0 },
    //     payables: { count: payables._count.payable_id || 0, total: payables._sum.amount_due || 0 }
    //   },
    //   series: {
    //     sales: salesSeries,
    //     purchases: purchasesSeries,
    //     expenses: expensesSeries,
    //     payables: payablesSeries
    //   }
    // });
  }

  //   public async AdminDashboard(req: Request, res:Response):Promise<void>{
  //     /**
  //      *
  //      * we user date filters for this
  //      *
  //      * we use this to display who openend the possession. model PosSession {
  //   pos_session_id String                @id @default(uuid())
  //   posId          String
  //   openedBy       String
  //   openedAt       DateTime              @default(now())
  //   closedBy       String?
  //   closedAt       DateTime?
  //   status         TerminalSessionStatus @default(CLOSED)
  //   createdAt      DateTime              @default(now())

  //   openedUser User                    @relation("OpenedSessions", fields: [openedBy], references: [email], onDelete: Cascade)
  //   closedUser User?                   @relation("ClosedSessions", fields: [closedBy], references: [email], onDelete: Cascade)
  //   balances   OpeningClosingBalance[]
  //   // ledgerEntries CashBookLedger[]
  // }
  //      *
  //      *
  //      * we match the opener of this with the following this table to get session opening date, closing date, total_for_Accounts
  //      * model OpeningClosingBalance {
  //   id                  String        @id @default(uuid()) @db.Uuid
  //   pos_session_id      String
  //   cash_bank_ledger_id String        @unique @db.Uuid // Nullable if not linked to a specific cash bank ledger
  //   opening_date        DateTime      @default(now())
  //   closing_date        DateTime?
  //   status              SessionStatus @default(PREV) // e.g. PREV, CLOSED
  //   opening_balance     Decimal       @db.Decimal(14, 2)
  //   closing_balance     Decimal?      @db.Decimal(14, 2)
  //   total_for_accounts  Decimal?      @db.Decimal(14, 2)

  //   // Link to account snapshot
  //   account_collection_id String?            @db.Uuid
  //   accountCollection     AccountCollection? @relation(fields: [account_collection_id], references: [collection_id])
  //   cashBookLedgers       CashBookLedger[]
  //   session               PosSession         @relation(fields: [pos_session_id], references: [pos_session_id])
  //   // account         Account   @relation(fields: [accountId], references: [account_id])
  // }
  //      *
  // fetch the total number of suppliers
  // model Suppliers {
  //   supplier_id      String             @id @default(uuid()) @db.Uuid
  //   name             String             @unique
  //   address          String
  //   contact          String
  //   created_at       DateTime           @default(now()) @db.Timestamp(6)

  //   @@map("Suppliers")
  // }

  // fwtch the total number of customers.
  // model Customer {
  //   customerId  String  @id @default(uuid())
  //   firstName   String
  //   lastName    String

  //   country                String?
  //   createdAt              DateTime @default(now()) // Date when the customer was added
  //   updatedAt              DateTime @updatedAt
  //   status                 String? // Customer status: "active", "inactive", etc.

  //   @@index([email], name: "customer_email_idx") // Index for email for quick searches
  // }

  // sum the total_amount of customer receivables on that date.
  // model CustomerReceivable {
  //   customer_receivable_id String        @id @default(cuid())
  //   customer_id            String
  //   total_Amount           Decimal
  //   transaction_id         String        @unique
  //   status                 AccountStatus @default(ACTIVE)

  //   // Relations
  //   customer     Customer    @relation(fields: [customer_id], references: [customerId])
  //   Transactions Transaction @relation(fields: [transaction_id], references: [transactionId])
  // }

  //   sum the thtoal number of sales for that day.
  //   model Sales {
  //   SalesId              String           @id @default(uuid())
  //   supplier_products_id String           @db.Uuid
  //   inventoryId          String
  //   // unit String
  //   stock_quantity       Decimal
  //   quantity             Int
  //   productName          String
  //   price                Float
  //   discount             Float
  //   VAT                  Float
  //   // totalCost       Float
  //   productSubTotalCost  Float
  //   productTotalCost     Float
  //   transactionId        String
  //   BatchInventoryId     String
  //   createdAt            DateTime         @default(now()) // Date when the customer was added
  //   InventoryItemID      Inventory?       @relation(fields: [inventoryId], references: [inventoryId])
  //   supplierProduct      SupplierProducts @relation(fields: [supplier_products_id], references: [supplier_products_id]) // Link to supplier product
  //   transaction          Transaction      @relation(fields: [transactionId], references: [transactionId])
  // }

  // find the total umber of purchases. and costs
  // model Purchase {
  //   purchase_id            String        @id @default(uuid()) @db.Uuid
  //   batch                  String        @unique
  //   supplier_products_id   String        @db.Uuid
  //   quantity               Int
  //   damaged_units          Int
  //   reason_for_damage      String?
  //   undamaged_units        Int
  //   unit_id                String        @db.Uuid
  //   purchase_cost_per_unit Decimal       @db.Decimal(10, 2)
  //   total_purchase_cost    Decimal       @db.Decimal(12, 2)
  //   discounts              Decimal       @db.Decimal(10, 2)
  //   tax                    Decimal       @db.Decimal(10, 2)
  //   payment_type           PaymentType
  //   payment_method         PaymentMethod
  //   payment_status         PaymentStatus
  //   payment_date           DateTime?
  //   account_id             String?       @db.Uuid // Nullable if not paid via account
  //   payment_reference      String?
  //   arrival_date           DateTime
  //   created_at             DateTime      @default(now())
  //   updated_at             DateTime      @updatedAt

  //   @@map("Purchase")
  // }

  //   find the total number of expenses and total amount.
  //   model Expense {
  //   id            String          @id @default(uuid())
  //   description   String
  //   amount        Float
  //   category      ExpenseCategory // e.g., "Transport", "Import Duty", "General", etc.
  //   expenseDate   DateTime        @default(now())
  //   accountId     String          @db.Uuid
  //   // Link to Purchase (optional)
  //   purchaseId    String?         @db.Uuid
  //   purchase      Purchase?       @relation(fields: [purchaseId], references: [purchase_id], onDelete: Cascade)
  //   paymentMethod PaymentMethod
  //   referenceNo   String? // e.g., receipt number, invoice number
  //   vendor        String? // who you paid
  //   // Link to batch (if tied to purchase, redundancy for reporting)
  //   batch         String?

  // ountId], references: [account_id])
  // }

  // find the total number and cost of payables.
  // model BatchPayables {
  //   payable_id      String        @id @default(uuid()) @db.Uuid
  //   purchase_id     String        @unique @db.Uuid
  //   amount_due      Decimal       @db.Decimal(12, 2)
  //   total_paid      Decimal       @default(0.00) @db.Decimal(12, 2) // Total amount paid so far
  //   status          PayableStatus
  //   payment_type    PaymentType
  //   balance_due     Decimal       @default(0.00) @db.Decimal(12, 2) // Remaining balance if partially paid
  //   settlement_date DateTime?

  // }

  // find the total number of employees.
  // model Employee {
  //   id         String   @id @default(uuid())
  //   firstName  String
  //   lastName   String
  //   email      String   @unique
  //   phone      String?
  //      *
  //      */
  //   }
}

// type Sales = {
//     filter{ startDate: Date, endDate: Date},
//     topSellingProducts:
// }
