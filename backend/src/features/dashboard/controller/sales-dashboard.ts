import { Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client';
// import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';

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
}

// type Sales = {
//     filter{ startDate: Date, endDate: Date},
//     topSellingProducts:
// }
