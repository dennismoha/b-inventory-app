import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@src/shared/prisma/prisma-client';

export class PayablesController {
  /**
   * Fetch all payables
   */
  public async getPayables(req: Request, res: Response): Promise<Response> {
    const payables = await prisma.batchPayables.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        batchpayable: true
      }
    });
    return res.status(StatusCodes.OK).json({
      message: 'Payables fetched successfully',
      data: payables
    });
  }

  /**
   * Fetch payable by ID
   */
  public async getPayableById(req: Request, res: Response): Promise<Response> {
    const payable = await prisma.batchPayables.findUnique({
      where: { payable_id: req.params.id },
      include: {
        batchpayable: true
      }
    });
    if (!payable) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Payable not found.' });
    }
    return res.status(StatusCodes.OK).json({
      message: 'Payable fetched successfully',
      data: payable
    });
  }

  /**
   * Create a new payable
   */
  public async createPayable(req: Request, res: Response): Promise<Response> {
    const { purchase_id, amount_due, status, payment_type, settlement_date } = req.body;

    const newPayable = await prisma.batchPayables.create({
      data: {
        purchase_id,
        amount_due,
        status,
        payment_type,
        settlement_date
      }
    });
    return res.status(StatusCodes.CREATED).json({
      message: 'Payable created successfully',
      data: newPayable
    });
  }

  /**
   * Update a payable
   */
  // public async updatePayable(req: Request, res: Response): Promise<Response> {
  //     const {
  //         amount_due,
  //         total_paid,
  //         status,
  //         payment_type,
  //         balance_due,
  //         settlement_date,
  //     } = req.body;

  //     const updatedPayable = await prisma.batchPayables.update({
  //         where: { payable_id: req.params.id },
  //         data: {
  //             amount_due,
  //             total_paid,
  //             status,
  //             payment_type,
  //             balance_due,
  //             settlement_date,
  //         },
  //     });
  //     return res.status(StatusCodes.OK).json({
  //         message: 'Payable updated successfully',
  //         data: updatedPayable,
  //     });
  // }

  /**
   * Delete a payable
   */
  public async deletePayable(req: Request, res: Response): Promise<Response> {
    await prisma.batchPayables.delete({
      where: { payable_id: req.params.id }
    });
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}
