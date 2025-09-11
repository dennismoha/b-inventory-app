// controllers/OrderProductsController.ts

import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { orderProductsSchema } from '@src/features/orders/schema/order-schema';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { OrderProducts } from '@src/features/orders/interfaces/order.interface';
import { calculateTotalAndCheckOrderAmount, utilMessage } from '@src/shared/globals/helpers/utils';
import { BadRequestError } from '@src/shared/globals/helpers/error-handler';

export class OrderProductsController {
  /**
   * Fetch all products in an order.
   * @param req The Express request object.
   * @param res The Express response object.
   */
  public async fetchOrderProducts(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;

    const orderProducts: OrderProducts[] = await prisma.orderProducts.findMany({
      where: { orderId },
      include: {
        supplierPricing: {
          include: {
            supplierProduct: true
          }
        }
      }
    });
    const messages = utilMessage.fetchedMessage('order products');
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, orderProducts, messages));
  }

  /**
   * Creates a new order product and manages the associated order status based on predefined conditions.
   *  Each product belowngs to a specific order
   * ### Order Product Logic:
   * 1. **Cannot add products to orders with status `fulfilled` or `failed`**:
   *    - If the order's status is `fulfilled` or `failed`, adding new products is not allowed.
   * 2. **If the order status is `empty`**:
   *    - When a new product is added to an order with status `empty`, the total amount of the order is checked.
   *    - If the total sum exceeds the `totalAmount`, the order status is updated to `order_default`.
   *    - If the total sum is less than or equal to `totalAmount`, the order status is updated to `pending`.
   * 3. **For orders with status `pending`**:
   *    - If the total order sum exceeds the `totalAmount`, the order status is updated to `order_default`.
   *    - If not, no action is taken.
   * 4. **For every product update or deletion**:
   *    - The same checks as described in **2** and **3** are applied to update the order status if necessary.
   *
   * @param {Request} req - The request object containing the details for creating the order product.
   *    - `req.body` should include:
   *      - `orderId` (string): The unique identifier for the order to which the product is being added.
   *      - `productId` (string): The unique identifier for the product being added to the order.
   *      - `productName` (string): The name of the product being added.
   *      - `quantity` (number): The quantity of the product to be added.
   *      - `price_per_unit` (number): The price per unit of the product.
   *      - `unit_id` (string): The identifier for the unit of measurement (e.g., 'pcs', 'kg').This will be the string id for that unit as from the units table
   *      - `order_quantity` (number): The total quantity of the product in the order.
   *      - `totalAmount` (number): The total price for this product (quantity * price_per_unit).
   *      - `supplierProductsPricingId` (string): The pricing ID for this product from the supplier's pricing table.
   *
   * @param {Response} res - The response object used to send a response back to the client.
   *    - Sends back a success message if the product is added and the order status is correctly updated.
   *
   * @throws {BadRequestError} Throws an error if:
   *    - The order doesn't exist.
   *    - The product cannot be added because the order is in a `fulfilled` or `failed` status.
   *
   * @throws {Error} Throws an error if there is an issue while updating the order status.
   *
   * @returns {Promise<void>} Resolves with a successful response indicating that the order product was added and the order status was updated.
   *
   * @example
   * // Example request body:
   * const reqBody = {
   *   orderId: '12345',
   *   productId: '67890',
   *   productName: 'Widget A',
   *   quantity: 10,
   *   price_per_unit: 15.99,
   *   unit_id: 'pcs',
   *   order_quantity: 20,
   *   totalAmount: 319.80,
   *   supplierProductsPricingId: 'abc123xyz'
   * };
   *
   * createOrderProduct(req, res);
   */
  @joiValidation(orderProductsSchema)
  public async createOrderProduct(req: Request, res: Response): Promise<void> {
    const { orderId, productId, productName, quantity, price_per_unit, unit_id, order_quantity, supplierProductsPricingId } = req.body;
    // Fetch the order to check its status
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      throw new BadRequestError(`Order with ID ${orderId} not found`);
    }

    if (order.orderStatus === 'fulfilled' || order.orderStatus === 'failed') {
      throw new BadRequestError('cannot add products to this order');
    }

    const newOrderProduct: OrderProducts = await prisma.orderProducts.create({
      data: {
        orderId,
        productId,
        productName,
        quantity,
        price_per_unit,
        unit_id,
        totalAmount: quantity * price_per_unit,
        order_quantity,
        supplierProductsPricingId
      }
    });

    // Check if the order status is 'empty'
    if (order.orderStatus === 'empty') {
      // check total amount.
      // Call the helper function to check if total exceeds order amount
      const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(orderId, Number(order.totalAmount));
      if (exceedsTotalAmount) {
        // Change the order status to 'order_default' if total exceeds order amount
        await prisma.order.update({
          where: { orderId: orderId },
          data: {
            orderStatus: 'order_default'
          }
        });
      } else {
        await prisma.order.update({
          where: { orderId },
          data: {
            orderStatus: 'pending'
          }
        });
      }
    }

    // check if order is of pending status. if yes, check total amount if it exceeds update it to default else do nothing
    if (order.orderStatus === 'pending') {
      const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(orderId, Number(order.totalAmount));
      if (exceedsTotalAmount) {
        // Change the order status to 'order_default' if total exceeds order amount
        await prisma.order.update({
          where: { orderId: orderId },
          data: {
            orderStatus: 'order_default'
          }
        });
      }
    }

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, newOrderProduct, 'Order product added successfully'));
  }

  /**
   * Updates an existing order product and manages the associated order status based on predefined conditions.
   *
   * ### Order Product Update Logic:
   * 1. **Cannot update products to orders with status `fulfilled`, `failed`, or `empty`**:
   *    - If the order's status is `fulfilled`, `failed`, or `empty`, updating products is not allowed.
   * 2. **Fetching the order**:
   *    - The order is fetched using the provided `orderId` to ensure that the product update is valid.
   * 3. **Updating the product in the order**:
   *    - The product details are updated in the `orderProducts` table based on the provided `productId`.
   * 4. **If the order status is `pending`**:
   *    - After updating the product, we check if the total sum of the order exceeds the `totalAmount`.
   *    - If the total sum exceeds the `totalAmount`, we update the order status to `order_default`, otherwise, we leave it as `pending`.
   * 5. **If the order status is `order_default`**:
   *    - After updating the product, we check if the total sum of the order exceeds the `totalAmount`.
   *    - If the total sum exceeds the `totalAmount`, we update the order status to `pending`, otherwise, we leave it as `order_default`.
   *
   * @param {Request} req - The request object containing the details for updating the order product.
   *    - `req.body` should include:
   *      - `orderId` (string): The unique identifier for the order whose product is being updated.
   *      - `productId` (string): The unique identifier for the product being updated in the order.
   *      - `quantity` (number): The updated quantity of the product.
   *      - `price_per_unit` (number): The updated price per unit of the product.
   *      - `unit_id` (string): The identifier for the unit of measurement (e.g., 'pcs', 'kg').
   *      - `order_quantity` (number): The updated total quantity of the product in the order.
   *      - `totalAmount` (number): The updated total price for this product (quantity * price_per_unit).. will be derived through calculations on orderQuantity * price_per_unit
   *
   * @param {Response} res - The response object used to send a response back to the client.
   *    - Sends back a success message if the product is updated and the order status is correctly updated.
   *
   * @throws {BadRequestError} Throws an error if:
   *    - The order doesn't exist.
   *    - The product cannot be updated because the order is in a `fulfilled`, `failed`, or `empty` status.
   *
   * @throws {Error} Throws an error if there is an issue while updating the order status or the product.
   *
   * @returns {Promise<void>} Resolves with a successful response indicating that the order product was updated and the order status was updated accordingly.
   *
   * @example
   * // Example request body:
   * const reqBody = {
   *   orderId: '12345',
   *   productId: '67890',
   *   quantity: 10,
   *   price_per_unit: 15.99,
   *   unit_id: 'pcs',
   *   order_quantity: 20,
   *   totalAmount: 319.80
   * };
   *
   * upd
   */
  @joiValidation(orderProductsSchema)
  public async updateOrderProduct(req: Request, res: Response): Promise<void> {
    const { orderProductsId } = req.params;
    const { orderId, productId, productName, quantity, price_per_unit, unit_id, order_quantity, supplierProductsPricingId } = req.body;

    // Fetch the order to check its status
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      throw new BadRequestError(`Order with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled'
    if (order.orderStatus === 'fulfilled' || order.orderStatus === 'failed' || order.orderStatus === 'empty') {
      // Prevent deletion of orders with the status 'fulfilled'
      throw new BadRequestError('Fulfilled orders cannot be added for this resournce');
    }

    const updatedOrderProduct: OrderProducts = await prisma.orderProducts.update({
      where: { orderProductsId },
      data: {
        productId,
        productName,
        quantity,
        price_per_unit,
        unit_id,
        totalAmount: order_quantity * price_per_unit,
        order_quantity,
        supplierProductsPricingId
      }
    });

    // check if order is of pending status. if yes, check total amount if it exceeds update it to default else do nothing
    if (order.orderStatus === 'pending') {
      const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(orderId, Number(order.totalAmount));
      if (exceedsTotalAmount) {
        // Change the order status to 'order_default' if total exceeds order amount
        await prisma.order.update({
          where: { orderId: orderId },
          data: {
            orderStatus: 'order_default'
          }
        });
      } else {
        // Change the order status to 'pending' if total does not exceed order amount. this makes sure that if the order was order_default it's changed to pending if price amount is low
        await prisma.order.update({
          where: { orderId: orderId },
          data: {
            orderStatus: 'pending'
          }
        });
      }
    }

    // check if order is of order_default status. if yes, check total amount if it exceeds update it to default else do nothing
    if (order.orderStatus === 'order_default') {
      const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(orderId, Number(order.totalAmount));
      if (!exceedsTotalAmount) {
        // Change the order status to 'pending' if total does not exceed order amount. this makes sure that if the order was order_default it's changed to pending if price amount is low
        await prisma.order.update({
          where: { orderId: orderId },
          data: {
            orderStatus: 'pending'
          }
        });
      }
    }

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updatedOrderProduct, 'Order product updated successfully'));
  }

  /**
   * Deletes a product from the order products table and updates the order status based on predefined conditions.
   *
   * ### Order Product Deletion Logic:
   * 1. **Cannot delete products from orders with status `fulfilled` or `empty`**:
   *    - If the order's status is `fulfilled` or `empty`, deleting products is not allowed.
   * 2. **Fetching the order**:
   *    - The order is fetched using the provided `orderId` to ensure that the product deletion is valid.
   * 3. **Deleting the product from the order**:
   *    - The product is deleted from the `orderProducts` table based on the provided `orderproductId`.
   * 4. **After deleting the product, check the number of remaining products**:
   *    - If there are no remaining products in the order (i.e., the count is `0`), the order status is updated to `empty`.
   * 5. **If there are still remaining products**:
   *    - We check the total sum of the remaining products to see if it exceeds the order's `totalAmount`.
   *    - If the total sum exceeds the order's total amount and the order status is `order_default`, we leave it as `order_default`.
   *    - If the total sum does not exceed the order amount, we update the order status to `pending` if necessary.
   *
   * @param {Request} req - The request object containing the details for deleting the order product.
   *    - `req.body` should include:
   *      - `orderId` (string): The unique identifier for the order from which the product is being deleted.
   *      - `orderProductId` (string): The unique identifier for the product being deleted from the order.
   *
   * @param {Response} res - The response object used to send a response back to the client.
   *    - Sends back a success message if the product is deleted and the order status is updated accordingly.
   *
   * @throws {BadRequestError} Throws an error if:
   *    - The order doesn't exist.
   *    - The product cannot be deleted because the order is in a `fulfilled` or `empty` status.
   *
   * @throws {Error} Throws an error if there is an issue while deleting the product or updating the order status.
   *
   * @returns {Promise<void>} Resolves with a successful response indicating that the order product was deleted and the order status was updated accordingly.
   *
   * @example
   * // Example request body:
   * const reqBody = {
   *   orderId: '12345',
   *   productId: '67890'
   * };
   *
   * deleteOrderProduct(req, res);
   */
  public async deleteOrderProduct(req: Request, res: Response): Promise<void> {
    const { orderProductsId } = req.params;

    // await prisma.orderProducts.delete({
    //   where: { orderProductsId }
    // });

    const { orderId } = req.body;

    // Fetch the order to check its status
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    // If the order does not exist, return a 404 error
    if (!order) {
      throw new BadRequestError(`Order with ID ${orderId} not found`);
    }

    // Check if the order status is 'fulfilled' or 'empty'
    if (order.orderStatus === 'fulfilled' || order.orderStatus === 'empty') {
      throw new BadRequestError('Cannot delete products from this order');
    }

    // Delete the product from the orderProducts table
    await prisma.orderProducts.delete({
      where: { orderProductsId } // Find the order product by productId
    });

    // Check the remaining products for this order
    const remainingProducts = await prisma.orderProducts.count({
      where: { orderId }
    });

    // If there are no remaining products, update the order status to 'empty'
    if (remainingProducts === 0) {
      await prisma.order.update({
        where: { orderId },
        data: {
          orderStatus: 'empty'
        }
      });
    } else {
      // If there are remaining products, check the total sum
      const exceedsTotalAmount = await calculateTotalAndCheckOrderAmount(orderId, Number(order.totalAmount));
      if (!exceedsTotalAmount) {
        // If the total sum exceeds the order amount and the order status is 'order_default', leave it as 'order_default'
        if (order.orderStatus !== 'order_default') {
          // If the order status is not 'order_default', update it to 'pending'
          await prisma.order.update({
            where: { orderId },
            data: {
              orderStatus: 'pending'
            }
          });
        }
      }
    }

    res.status(StatusCodes.NO_CONTENT).send();
  }
}
