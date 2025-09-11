// controllers/OrderController.ts

import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { orderSchema } from '@src/features/orders/schema/order-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { BadRequestError, ConflictError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Order } from '@src/features/orders/interfaces/order.interface';

export class OrderController {
  /**
   * Fetch all orders.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchOrders(req: Request, res: Response): Promise<void> {
    const orders: Order[] = await prisma.order.findMany({
      include: {
        miscellaneous: true,
        orderProducts: true,
        supplier: true
      }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, orders, 'Orders fetched successfully'));
  }

  /**
   * Creates a new order.
   *
   * Validations:
   * 1) If order date is greater than today's date, throw an error.
   * 2) If shipping date is less than order date, throw an error.
   * 3) If delivery date is less than order date, throw an error.
   * 4) If delivery date is less than shipping date, throw an error.
   * 5) If order date is greater than any of the shipping or delivery dates, throw an error.
   * 6) If shipping date is greater than the order date, throw an error.
   *
   * @param {Request} req - The Express request object containing order data.
   * @param {Response} res - The Express response object to send back the result.
   * @throws {ConflictError} If any of the validation checks fail.
   * @returns {void}
   */
  @joiValidation(orderSchema)
  public async createOrder(req: Request, res: Response): Promise<void> {
    const {
      supplier_id,
      orderName,
      totalAmount,
      paymentStatus,
      paymentMethod,
      orderDate,
      shippingDate,
      supplierDetails,
      orderDeliveryDate,
      receiptPictorials,
      receiptText,
      comments
    } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { orderName }
    });

    if (existingOrder) {
      throw new ConflictError('Order with the same name already exists');
    }
    validateOrderDates(orderDate, shippingDate, orderDeliveryDate);
    // List of allowed order statuses for adding products
    // const allowedStatuses = ['empty', 'pending', 'extended', 'order_default'];

    // Check if the provided orderStatus is one of the allowed statuses
    // if (!allowedStatuses.includes(orderStatus)) {
    //     throw new ConflictError('Products can only be added to orders with status "empty", "pending", "extended", or "order_default"');
    // }

    // Convert dates to Date objects for comparisons

    const newOrder: Order = await prisma.order.create({
      data: {
        supplier_id,
        orderName,
        totalAmount,
        paymentStatus,
        paymentMethod,
        shippingDate,
        orderDate,
        orderDeliveryDate,
        supplierDetails,
        receiptPictorials,
        receiptText,
        // orderStatus,
        comments
      }
    });

    // Call the helper function to check if total exceeds order amount
    // const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(newOrder.orderId, totalAmount);
    // if (exceedsTotalAmount) {
    //     // Change the order status to 'order_default' if total exceeds order amount
    //     await prisma.order.update({
    //         where: { orderId: newOrder.orderId },
    //         data: {
    //             orderStatus: 'order_default'
    //         }
    //     });

    //     // Send a notification about the status change
    //     // code will come here

    //     throw new ConflictError('Order status changed to "order_default" due to total exceeding the order amount.');
    // }
    // Send success response if everything is fine
    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, newOrder, 'Order created successfully'));
  }

  /**
   * Update an existing order.
   * User cannot edit an order that has a status of "fulfilled".
   * @param req The Express request object.
   * @param res The Express response object.
   */
  @joiValidation(orderSchema)
  public async updateOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const {
      orderName,
      totalAmount,
      paymentStatus,
      paymentMethod,
      shippingDate,
      orderDeliveryDate,
      orderStatus,
      supplier_id,
      orderDate,
      supplierDetails,
      receiptPictorials,
      receiptText,
      comments
    } = req.body;

    // Fetch the order to check its status
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      throw new BadRequestError(`Order with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled'
    if (order.orderStatus === 'fulfilled') {
      // Prevent deletion of orders with the status 'fulfilled'
      throw new ConflictError('Fulfilled orders cannot be deleted');
    }

    validateOrderDates(orderDate, shippingDate, orderDeliveryDate);

    const updatedOrder: Order = await prisma.order.update({
      where: { orderId },
      data: {
        orderName,
        totalAmount,
        paymentStatus,
        paymentMethod,
        shippingDate,
        orderDeliveryDate,
        orderStatus,
        comments,
        supplier_id,
        supplierDetails,
        receiptPictorials,
        receiptText
      }
    });

    // Call the helper function to check if total exceeds order amount
    const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(updatedOrder.orderId, totalAmount);
    if (exceedsTotalAmount) {
      // Change the order status to 'order_default' if total exceeds order amount
      await prisma.order.update({
        where: { orderId: updatedOrder.orderId },
        data: {
          orderStatus: 'order_default'
        }
      });

      // Send a notification about the status change
      throw new ConflictError('Order status changed to "order_default" due to total exceeding the order amount.');
    } else {
      // If the total has been reduced, check if status should be updated to 'pending' or 'extended'
      let newStatus: 'pending' | 'empty' | 'failed' | 'extended' | 'order_default' = 'pending'; // Default to 'pending'

      if (order.orderStatus === 'extended') {
        // If the order was previously extended, retain 'extended' status
        newStatus = 'extended';
      }
      if (order.orderStatus === 'order_default') {
        newStatus = 'pending';
        await prisma.order.update({
          where: { orderId: order.orderId },
          data: {
            orderStatus: newStatus
          }
        });
      }

      // Update the order status to 'pending' or 'extended' based on the condition
      //  await prisma.order.update({
      //    where: { orderId: order.orderId },
      //    data: {
      //      orderStatus: newStatus
      //    }
      //  });
    }

    // Handle case where the total previously exceeded and now is reduced
    // const previousExceedsTotalAmount = await calculateTotalAndCheckOrderAmount(updatedOrder.orderId, totalAmount);

    // if (previousExceedsTotalAmount && totalAmount < order.totalAmount) {
    //   // // If the total has been reduced, check if status should be updated to 'pending' or 'extended'
    //   // let newStatus = 'pending'; // Default to 'pending'

    //   // if (order.orderStatus === 'extended') {
    //   //   // If the order was previously extended, retain 'extended' status
    //   //   newStatus = 'extended';
    //   // }

    //   // // Update the order status to 'pending' or 'extended' based on the condition
    //   // await prisma.order.update({
    //   //   where: { orderId: order.orderId },
    //   //   data: {
    //   //     orderStatus: newStatus
    //   //   }
    //   // });

    //   // Send a notification about the status change
    //   throw new ConflictError('Order status changed to "pending" or "extended" due to reduction in the order total.');
    // }
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedOrder, 'Order updated successfully'));
  }

  /**
   * Delete an existing order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;

    // Fetch the order to check its status
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      throw new BadRequestError(`Order with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled'
    if (order.orderStatus === 'fulfilled') {
      // Prevent deletion of orders with the status 'fulfilled'
      throw new ConflictError('Fulfilled orders cannot be deleted');
    }

    await prisma.order.delete({
      where: { orderId }
    });

    res.status(StatusCodes.NO_CONTENT).send();
  }
}

/**
 * Calculate the total of products and miscellaneous charges and check if it exceeds the total order amount.
 * @param orderId The order ID for which the calculation is to be done.
 * @param totalAmount The total amount set for the order.
 * @returns A promise that resolves to a boolean indicating whether the total exceeds the order amount.
 */
export const calculateTotalAndCheckOrderAmount = async (orderId: string, totalAmount: number): Promise<boolean> => {
  // Fetch the related products for the order
  const orderProducts = await prisma.orderProducts.findMany({
    where: { orderId }
  });

  // Fetch the miscellaneous charges for the order
  const miscellaneous = await prisma.miscellaneous.findUnique({
    where: { order_id: orderId }
  });

  // Calculate the total of products and miscellaneous charges
  const totalProductsAmount = orderProducts.reduce((total, product) => total + parseFloat(product.totalAmount.toString()), 0);
  const totalMiscellaneous = miscellaneous ? parseFloat(miscellaneous.total_order_value.toString()) : 0;

  const calculatedTotal = totalProductsAmount + totalMiscellaneous;

  // Check if the calculated total exceeds the order's total amount
  return calculatedTotal > totalAmount;
};

/**
 * Validates the order, shipping, and delivery dates to ensure they meet the required criteria.
 *
 * @param {string} orderDate - The order date string (ISO 8601 format).
 * @param {string} shippingDate - The shipping date string (ISO 8601 format).
 * @param {string} deliveryDate - The delivery date string (ISO 8601 format).
 * @throws {ConflictError} If any of the validation checks fail.
 */
function validateOrderDates(orderDate: string, shippingDate: string, deliveryDate: string): void {
  const nowISOString = new Date().toISOString(); // Current time in ISO 8601 format

  const orderDateISOString = new Date(orderDate).toISOString();
  const shippingDateISOString = new Date(shippingDate).toISOString();
  const deliveryDateISOString = new Date(deliveryDate).toISOString();

  // 1) If order date is greater than the current date and time, throw an error.
  if (orderDateISOString > nowISOString) {
    throw new ConflictError('Order date cannot be greater than the current date and time');
  }

  // 2) If shipping date is less than the order date, throw an error.
  if (shippingDateISOString < orderDateISOString) {
    throw new ConflictError('Shipping date cannot be earlier than the order date');
  }

  // 3) If delivery date is less than the order date, throw an error.
  if (deliveryDateISOString < orderDateISOString) {
    throw new ConflictError('Delivery date cannot be earlier than the order date');
  }

  // 4) If delivery date is less than the shipping date, throw an error.
  if (deliveryDateISOString < shippingDateISOString) {
    throw new ConflictError('Delivery date cannot be earlier than the shipping date');
  }

  // 5) If order date is greater than any of the shipping or delivery dates, throw an error.
  if (orderDateISOString > shippingDateISOString || orderDateISOString > deliveryDateISOString) {
    throw new ConflictError('Order date cannot be greater than the shipping or delivery date');
  }

  // 6) If shipping date is greater than the order date, throw an error.
  // if (shippingDateISOString > orderDateISOString) {
  //     throw new ConflictError('Shipping date cannot be greater than the order date');
  // }
}
