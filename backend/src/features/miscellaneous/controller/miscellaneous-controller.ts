// controllers/MiscellaneousController.ts

import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { miscellaneousSchema } from '@src/features/miscellaneous/schema/miscellaneous-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { Miscellaneous } from '@src/features/miscellaneous/interfaces/miscellaneous.interface';
import { BadRequestError, ConflictError } from '@src/shared/globals/helpers/error-handler';
import { calculateTotalAndCheckOrderAmount, utilMessage } from '@src/shared/globals/helpers/utils';

export class MiscellaneousController {
  /**
   * Fetch the miscellaneous details for an order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchMiscellaneous(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;

    const miscellaneous: Miscellaneous | null = await prisma.miscellaneous.findUnique({
      where: { order_id: orderId }
    });

    const message = utilMessage.fetchedMessage('Miscellaneous details ');

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, miscellaneous, message));
  }

  /**
   * Create new miscellaneous details for an order.
   * * Represents the details of an order.  *
   * @typedef {Object} OrderDetails
   * @property {string} orderId - The unique identifier for the order. reference to order
   * @property {number} base_fare - The original fare amount before any adjustments.
   * @property {number} discount_amount - The total discount applied to the order.
   * @property {number} additional_charges - Any additional charges, e.g., special services or handling.
   * @property {number} tax_amount - The tax applied to the order.
   * @property {number} shipping_charge - The cost for shipping.
   * @property {number} payment_processing_fee - The fee charged for processing the payment.
   * @property {number} total_order_value - The total amount payable (sum of all charges after discounts, etc.).
   * @property {string} currency_code - The currency used for the order (e.g., "USD", "EUR").
   * @property {Object} fare_breakdown - Detailed breakdown of the fare.
   * @property {number} fare_breakdown.base_fare - The base fare before any discounts or additional charges.
   * @property {number} fare_breakdown.discount - The discount amount applied to the base fare.
   * @property {number} fare_breakdown.additional_charges - Additional charges like handling fees, etc.
   * @property {number} fare_breakdown.tax - The tax amount applied to the base fare.
   * @property {number} fare_breakdown.shipping - The shipping charge for the order.
   * @property {number} fare_breakdown.payment_processing_fee - The processing fee for handling the payment.
   * @property {number} tip_amount - The tip given by the customer (if applicable).
   * @property {number} refund_amount - The amount refunded to the customer (if applicable).
   * @property {number} other_fees - Any other fees not covered above (e.g., service charges).
   * @property {string} payment_status - The status of the payment (e.g., "Paid", "Pending", "Failed").
   * @property {string} notes - Additional notes or instructions related to the order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  @joiValidation(miscellaneousSchema)
  public async createMiscellaneous(req: Request, res: Response): Promise<void> {
    const {
      order_id,
      base_fare,
      discount_amount,
      additional_charges,
      tax_amount,
      shipping_charge,
      payment_processing_fee,
      total_order_value,
      currency_code,
      fare_breakdown,
      tip_amount,
      refund_amount,
      other_fees,
      payment_status,
      notes
    } = req.body;

    const newMiscellaneous: Miscellaneous = await prisma.miscellaneous.create({
      data: {
        order_id: order_id,
        base_fare,
        discount_amount,
        additional_charges,
        tax_amount,
        shipping_charge,
        payment_processing_fee,
        total_order_value,
        currency_code,
        fare_breakdown,
        tip_amount,
        refund_amount,
        other_fees,
        payment_status,
        notes
      }
    });

    const message = utilMessage.created('Miscellaneous details ');

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, newMiscellaneous, message));
  }

  /**
   * Update existing miscellaneous details for an order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  @joiValidation(miscellaneousSchema)
  public async updateMiscellaneous(req: Request, res: Response): Promise<void> {
    const { order_id } = req.params;
    const {
      base_fare,
      discount_amount,
      additional_charges,
      tax_amount,
      shipping_charge,
      payment_processing_fee,
      total_order_value,
      currency_code,
      fare_breakdown,
      tip_amount,
      refund_amount,
      other_fees,
      payment_status,
      notes
    } = req.body;

    // Fetch the order to check its status
    const orderId: string = order_id;
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error. Although this cannot be null.
    // it is a typeguard for the code below it
    if (!order) {
      throw new BadRequestError(`miscellaneous with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled'
    if (order.orderStatus === 'fulfilled' || order.orderStatus === 'failed') {
      // Prevent deletion of orders with the status 'fulfilled'
      throw new BadRequestError('miscellanoues details of Fulfilled or failed orders cannot be updated');
    }

    const updatedMiscellaneous: Miscellaneous = await prisma.miscellaneous.update({
      where: { order_id: order_id },
      data: {
        base_fare,
        discount_amount,
        additional_charges,
        tax_amount,
        shipping_charge,
        payment_processing_fee,
        total_order_value,
        currency_code,
        fare_breakdown,
        tip_amount,
        refund_amount,
        other_fees,
        payment_status,
        notes
      }
    });

    // Call the helper function to check if total exceeds order amount
    const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(order.orderId, Number(order.totalAmount));
    if (exceedsTotalAmount) {
      // Change the order status to 'order_default' if total exceeds order amount
      await prisma.order.update({
        where: { orderId: order.orderId },
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

      const message = utilMessage.updateMessage('Miscellaneous details ');

      res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedMiscellaneous, message));
    }
  }

  /**
   * Delete miscellaneous details for an order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async deleteMiscellaneous(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;

    // Fetch the order to check its status

    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error. Although this cannot be null.
    // it is a typeguard for the code below it
    if (!order) {
      throw new BadRequestError(`miscellaneous with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled'
    if (order.orderStatus === 'fulfilled') {
      // Prevent deletion of orders with the status 'fulfilled'
      throw new BadRequestError('miscellanoues details of Fulfilled orders cannot be deleted');
    }

    await prisma.miscellaneous.delete({
      where: { order_id: orderId }
    });
    // const message = utilMessage.deleted('Miscellaneous details ');

    res.status(StatusCodes.NO_CONTENT).send();
  }
}
