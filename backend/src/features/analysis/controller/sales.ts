// i want to fetch from TransactionProduct all the sales total

// i also need to have a query that returns sales total transaction in between dates. filter by dates

// i also need to have a total sales transaction for a particular product. group by

// i also need to have a total sales transaction for a particular product in between dates. Filter

// I also need to have a query that returns all the  sale total transactions of each customer

// i also need to have a query that returns all the sale transaction of each customer in between dates. that is filter

// i also need to have a query that fetches the difference between total cost of item in stoc - sold for a particular date

// How do we calculate the profit

// profit = sales(on a certain date range) - (total sum of products in that date range)

import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client'; // Prisma client
import { StatusCodes } from 'http-status-codes'; // HTTP status codes
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages'; // Helper function for success response
import { BadRequestError } from '@src/shared/globals/helpers/error-handler'; // Error helpers
import { utilMessage } from '@src/shared/globals/helpers/utils';
import {
  CustomerSales,
  PrismaTransactionProductAggregate,
  SupplierSales,
  TransactionProductsBetweenDates
} from '@src/features/analysis/interfaces/analysis.interface';

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);

  // Check if the date is valid and compare the input string with the ISO string format
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
}

export class SalesController {
  /**
   * Fetches the total sales from all transactions in the system.
   */
  public async getTotalSales(req: Request, res: Response): Promise<void> {
    const totalSales: PrismaTransactionProductAggregate = await prisma.sales.aggregate({
      _sum: {
        productTotalCost: true
      }
    });

    const TotalSales = totalSales._sum.productTotalCost ?? 0;

    //res.status(StatusCodes.OK).send({ TotalSales, message: 'Total sales fetched successfully' });
    const message = utilMessage.fetchedMessage('total sales');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, TotalSales, message));
  }

  /**
   * Fetches the total sales within a specific date range.
   * @param {Request} req - The Express request object, should contain 'startDate' and 'endDate' in the query parameters.
   */
  public async getSalesBetweenDates(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    // add logic to check if dates are valid

    if (!startDate || !endDate) {
      throw new BadRequestError('Please provide both start and end date.');
    }

    const date1 = isValidDate(startDate as string);

    const date2 = isValidDate(endDate as string);

    if (!date1 && !date2) {
      throw new BadRequestError('invalid dates');
    }

    const salesInRange: PrismaTransactionProductAggregate = await prisma.sales.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      _sum: {
        productTotalCost: true
      }
    });
    const TotalSales = salesInRange._sum.productTotalCost ?? 0;

    //res.status(StatusCodes.OK).send({ salesInRange, message: `Sales between ${startDate} and ${endDate} fetched successfully` });
    const message = utilMessage.fetchedMessage('total sales');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, TotalSales, message));
    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, salesInRange, `Sales between ${startDate} and ${endDate} fetched successfully`));
  }

  // returns all products and all total sales and transactions between those dates
  public async getSalesProductsBetweenDates(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    // Validate that the dates are provided
    if (!startDate || !endDate) {
      throw new BadRequestError('Please provide both start and end date.');
    }

    // Validate the dates
    const date1 = isValidDate(startDate as string);
    const date2 = isValidDate(endDate as string);

    // If any of the dates are invalid, throw an error
    if (!date1 || !date2) {
      throw new BadRequestError('Invalid date format.');
    }

    if (endDate < startDate) {
      throw new BadRequestError('end date cannot be greater than start date');
    }

    // Aggregate the total cost for all TransactionProducts within the given date range
    const aggregatedData = await prisma.sales.aggregate({
      _sum: {
        productTotalCost: true // Sum of the productTotalCost
      },
      where: {
        transaction: {
          transactionDateCreated: {
            gte: new Date(startDate as string), // Filter by start date
            lte: new Date(endDate as string) // Filter by end date
          }
        }
      }
    });

    // Fetch the transactions and related transaction products within the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDateCreated: {
          gte: new Date(startDate as string), // Filter by start date
          lte: new Date(endDate as string) // Filter by end date
        }
      },
      // include: {
      //   TransactionProduct: true, // Include associated TransactionProducts
      //
      // }
      include: {
        Sales: {
          include: {
            supplierProduct: {
              include: {
                supplier: true
              }
            }
          }
        },
        customer: true
      }
    });

    // Calculate the total sales
    const totalSales = aggregatedData._sum.productTotalCost ?? 0;

    const totalProductsResponse: TransactionProductsBetweenDates = { totalSales, transactions };

    // Create a success message and send the response
    const message = utilMessage.fetchedMessage('total sales');
    //res.status(StatusCodes.OK).json({totalSales,transactions});
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, totalProductsResponse, message));
  }

  /**
   * Fetches the total sales for a particular product.
   * @param {Request} req - The Express request object, should contain 'productId' in the params.
   */
  public async getTotalSalesForProduct(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;

    const salesForProduct = await prisma.sales.aggregate({
      where: {
        supplier_products_id: productId
      },
      _sum: {
        productTotalCost: true
      }
    });

    res.status(StatusCodes.OK).send(salesForProduct);

    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, salesForProduct, `Sales for product ${productId} fetched successfully`));
  }

  /**
   * Fetches the total sales for a particular product within a specific date range.
   * @param {Request} req - The Express request object, should contain 'productId' in the params and 'startDate' and 'endDate' in the query parameters.
   */
  public async getTotalSalesForProductInRange(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Please provide both start and end date.');
    }

    const salesForProductInRange = await prisma.sales.aggregate({
      where: {
        supplier_products_id: productId,

        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      _sum: {
        productTotalCost: true
      }
    });
    res.status(StatusCodes.OK).send(salesForProductInRange);

    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, salesForProductInRange, `Sales for product ${productId} between ${startDate} and ${endDate} fetched successfully`));
  }

  /**
   * Fetches the total sales for each customer.
   */
  public async getTotalSalesForEachCustomer(req: Request, res: Response): Promise<void> {
    const getSalesPerCustomer = async (): Promise<CustomerSales[]> => {
      const salesPerCustomer = await prisma.customer.findMany({
        select: {
          customerId: true,
          firstName: true,
          lastName: true,
          transactions: {
            select: {
              transactionId: true,
              transactionDateCreated: true,
              totalCost: true,
              subtotal: true,
              paymentMethod: true,
              Sales: {
                select: {
                  supplier_products_id: true,
                  productName: true,
                  productTotalCost: true,
                  productSubTotalCost: true,
                  VAT: true,
                  price: true,
                  discount: true,
                  quantity: true,
                  supplierProduct: {
                    // Include SupplierProduct data
                    select: {
                      supplier: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Aggregating the data to sum the productTotalCost by supplier_products_id
      return salesPerCustomer.map((customer) => {
        const supplierProducts = customer.transactions.flatMap((transaction) =>
          transaction.Sales.map((product) => ({
            supplier_products_id: product.supplier_products_id,
            supplierProduct: product.supplierProduct.supplier.name,
            products: product.productName,
            quantity: product.quantity,
            VAT: product.VAT,
            price: product.price,
            discount: product.discount,
            productSubtotal: product.productSubTotalCost,
            productTotalCost: product.productTotalCost
          }))
        );

        const groupedSales = supplierProducts.reduce(
          (acc: { [key: string]: SupplierSales }, { supplier_products_id, supplierProduct, products, productTotalCost }) => {
            if (!acc[supplier_products_id]) {
              acc[supplier_products_id] = { supplier_products_id, supplierProduct, products, totalSales: 0 };
            }
            acc[supplier_products_id].totalSales += productTotalCost;
            return acc;
          },
          {}
        );

        return {
          customerId: customer.customerId,
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSales: Object.values(groupedSales),
          transactionDate: customer.transactions
        };
      });
    };
    const salesPerCustomer = await getSalesPerCustomer();

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, salesPerCustomer, 'Total sales per customer fetched successfully'));
  }

  /**
   * Fetches the total sales for each customer within a specific date range.
   * @param {Request} req - The Express request object, should contain 'startDate' and 'endDate' in the query parameters.
   */
  public async getTotalSalesForEachCustomerInRange(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Please provide both start and end date.');
    }

    const salesPerCustomerInRange = await prisma.customer.findMany({
      select: {
        customerId: true,
        firstName: true,
        lastName: true,
        email: true,
        transactions: {
          where: {
            transactionDateCreated: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string)
            }
          },
          select: {
            Sales: true
            // sales: {
            //   _sum: {
            //     productTotalCost: true
            //   }
            // }
          }
        }
      }
    });

    res.status(StatusCodes.OK).send(salesPerCustomerInRange);
    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, salesPerCustomerInRange, `Sales per customer between ${startDate} and ${endDate} fetched successfully`));
  }

  /**
   * Fetches the difference between the total cost of items in stock and sold for a particular date.
   * @param {Request} req - The Express request object, should contain 'date' in the query parameter.
   */
  public async getInventorySalesDifference(req: Request, res: Response): Promise<void> {
    const { date } = req.query;

    if (!date) {
      throw new BadRequestError('Please provide a date.');
    }

    const dateObj = new Date(date as string);

    // Get total cost of items in stock
    const stockCost = await prisma.inventory.aggregate({
      _sum: {
        stock_quantity: true
      }
    });

    // Get total sales for the date
    const salesCost = await prisma.sales.aggregate({
      where: {
        transaction: {
          transactionDateCreated: dateObj
        }
      },
      _sum: {
        productTotalCost: true
      }
    });

    // const inventorySalesDifference = stockCost._sum.stock_quantity - salesCost._sum.productTotalCost;

    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, { inventorySalesDifference }, `Sales difference for ${date} fetched successfully`));
    res.status(200).json({ stockCost, salesCost, message: 'returned' });
  }

  /**
   * Calculate the profit for a given date range.
   * Profit is calculated as:
   * Profit = Sales (in the date range) - Total cost of products sold in that date range.
   * @param {Request} req - The Express request object, should contain 'startDate' and 'endDate' in the query parameters.
   */
  public async calculateProfit(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Please provide both start and end date.');
    }

    const salesInRange = await prisma.sales.aggregate({
      where: {
        transaction: {
          transactionDateCreated: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        }
      },
      _sum: {
        productTotalCost: true
      }
    });

    const costInRange = await prisma.sales.aggregate({
      where: {
        transaction: {
          transactionDateCreated: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        }
      },
      _sum: {
        productSubTotalCost: true
      }
    });

    //@ts-expect-error  salesInRange._sum not working
    const profit = salesInRange._sum.productTotalCost - costInRange._sum.productSubTotalCost;

    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, { profit }, `Profit between ${startDate} and ${endDate} fetched successfully`));
    res.status(200).json({ profit, message: 'returned success' });
  }
}
