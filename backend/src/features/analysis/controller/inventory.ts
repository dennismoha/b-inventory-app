import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
// import { StatusCodes } from 'http-status-codes';
// import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
// import { Inventory } from '@src/features/inventory/interfaces/inventory.interface';

export class InventoryController {
  /**
   * Fetches all inventory items from the database.
   *
   * This method retrieves a list of inventory items that are not marked as logically deleted (softDelete: false).
   * It sends a successful response with the list of inventory items and an HTTP status of 200.
   * it is used in the  inventory-insights page
   */
  public async fetchInventorInsights(req: Request, res: Response): Promise<void> {
    // Fetch inventory items that are not marked as deleted (softDelete = false)
    const inventory = await prisma.inventory.findMany({
      // where: {
      //   softDelete: false // Optional: Only return non-deleted records
      // },
      include: {
        InventorySalesTracking: true,
        // InventoryRestock: true,
        // TransactionProduct: true,
        supplierProduct: {
          include: {
            product: true,
            supplier: true,
            ProductPricing: true
          }
        },
        unit: true
      }
    });

    // Send success message with the fetched inventory
    res.json(inventory);
    // res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, inventory, 'Inventory fetched successfully'));
  }
}
