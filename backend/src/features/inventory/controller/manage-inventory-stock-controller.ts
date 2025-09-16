import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { NotFoundError } from '@src/shared/globals/helpers/error-handler';
import { updateStockLevelSchema } from '@src/features/inventory/schema/inventory-schema';

import { FetchLowStockItem, LowStockResponseItem, StockResponseItem, StockSummariesItem } from '../interfaces/inventory.interface';

export class ProductSummaryController {
  /**
   * Fetch low stock products
   * Condition: (total_received - total_sold) <= reorder_level
   */
  public async fetchLowStock(req: Request, res: Response): Promise<void> {
    const summaries: FetchLowStockItem[] = await prisma.productSummary.findMany({
      select: {
        supplier_products_id: true,
        total_received: true,
        total_sold: true,
        reorder_level: true,
        total_cost_value: true,
        supplierProduct: {
          select: {
            product: {
              select: {
                name: true
              }
            },
            supplier: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const lowStock = summaries.filter((p) => p.total_received - p.total_sold <= p.reorder_level);

    // map into flattened response
    const mapLowStock: LowStockResponseItem[] = lowStock.map((prod) => ({
      supplier_products_id: prod.supplier_products_id,
      total_received: prod.total_received,
      total_sold: prod.total_sold,
      reorder_level: prod.reorder_level,
      total_cost_value: prod.total_cost_value,
      product_name: prod.supplierProduct.product.name,
      supplier_name: prod.supplierProduct.supplier.name
    }));

    res.status(StatusCodes.OK).json(GetSuccessMessage(200, mapLowStock, 'Low stock products fetched successfully'));
  }

  /**
   *
   * fetch all stock
   *
   */
  public async fetchStock(req: Request, res: Response): Promise<void> {
    const summaries: StockSummariesItem[] = await prisma.productSummary.findMany({
      select: {
        supplier_products_id: true,
        total_received: true,
        total_sold: true,
        reorder_level: true,
        total_cost_value: true,
        supplierProduct: {
          select: {
            product: {
              select: {
                name: true
              }
            },
            supplier: {
              select: {
                name: true
              }
            },

            ProductPricing: {
              select: {
                Quantity: true,
                price: true,
                effective_date: true,
                unit: {
                  select: {
                    short_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const mapStock: StockResponseItem[] = summaries.map((prod) => {
      return {
        supplier_products_id: prod.supplier_products_id,
        total_received: prod.total_received,
        total_sold: prod.total_sold,
        current_in_stock: prod.total_received - prod.total_sold,
        reorder_level: prod.reorder_level,
        total_cost_value_as_per_suppliers: prod.total_cost_value,
        // product & supplier
        product_name: prod.supplierProduct.product.name,
        supplier_name: prod.supplierProduct.supplier.name,

        unit_quantity: prod?.supplierProduct.ProductPricing?.Quantity,
        units: prod?.supplierProduct.ProductPricing?.unit.short_name,
        pricing_per_unit: prod.supplierProduct.ProductPricing?.price,
        effectiveData: prod.supplierProduct.ProductPricing?.effective_date ?? null,
        remaining: prod.total_received - prod.total_sold,
        total_cost_value_in_our_stock_price: prod.supplierProduct.ProductPricing?.price
          ? (prod.total_received - prod.total_sold) * Number(prod.supplierProduct.ProductPricing?.price)
          : 0
        // derived
      };
    });

    res.status(StatusCodes.OK).json(GetSuccessMessage(200, mapStock, 'Low stock products fetched successfully'));
  }

  /**
   * Update reorder_level (stock level) of a product
   */
  @joiValidation(updateStockLevelSchema)
  public async updateStockLevel(req: Request, res: Response): Promise<void> {
    const { supplier_products_id, reorder_level } = req.body;

    const updated = await prisma.productSummary
      .update({
        where: { supplier_products_id },
        data: { reorder_level: Number(reorder_level) },
        select: {
          supplier_products_id: true,
          total_received: true,
          total_sold: true,
          reorder_level: true,
          total_cost_value: true,
          supplierProduct: {
            select: {
              product: {
                select: {
                  name: true
                }
              },
              supplier: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      .catch(() => {
        throw new NotFoundError('Product not found');
      });

    const mapLowStock: LowStockResponseItem = {
      supplier_products_id: updated.supplier_products_id,
      total_received: updated.total_received,
      total_sold: updated.total_sold,
      reorder_level: updated.reorder_level,
      total_cost_value: updated.total_cost_value,
      product_name: updated.supplierProduct.product.name,
      supplier_name: updated.supplierProduct.supplier.name
    };

    res.status(StatusCodes.OK).json(GetSuccessMessage(200, mapLowStock, 'Stock level updated successfully'));
  }
}
