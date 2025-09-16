import { Request, Response } from 'express';
import prisma from '@src/shared/prisma/prisma-client';
import { StatusCodes } from 'http-status-codes';
import { joiValidation } from '@src/shared/globals/decorators/joi-validation-decorators';
import { ConflictError, NotFoundError } from '@src/shared/globals/helpers/error-handler';
import GetSuccessMessage from '@src/shared/globals/helpers/success-messages';
import { employeeCreateSchema, employeeUpdateSchema } from '@src/features/hrm/employees/schema/employees-schema';
import { Employee } from '@src/features/hrm/employees/interfaces/employee.interface';

export class EmployeesController {
  /**
   * Get all employees (include their assigned assets)
   */
  public async fetchEmployees(req: Request, res: Response): Promise<void> {
    const employees: Employee[] = await prisma.employee.findMany({
      include: { assets: true }
    });
    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, employees, 'Employees fetched successfully'));
  }

  /**
   * Get a single employee by id
   */
  public async fetchEmployeeById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { assets: true }
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, employee, 'Employee fetched successfully'));
  }

  /**
   * Create an employee
   */
  @joiValidation(employeeCreateSchema)
  public async createEmployee(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Employee with this email already exists');
    }

    const created = await prisma.employee.create({ data: req.body });

    res.status(StatusCodes.CREATED).send(GetSuccessMessage(StatusCodes.CREATED, created, 'Employee created successfully'));
  }

  /**
   * Update an employee
   */
  @joiValidation(employeeUpdateSchema)
  public async updateEmployee(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    // If email is being changed, ensure uniqueness
    if (req.body.email) {
      const emailHolder = await prisma.employee.findFirst({
        where: { email: req.body.email, NOT: { id } }
      });
      if (emailHolder) {
        throw new ConflictError('Another employee already uses this email');
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: req.body
    });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, updated, 'Employee updated successfully'));
  }

  /**
   * Delete an employee
   */
  public async deleteEmployee(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Employee not found');

    await prisma.employee.delete({ where: { id } });

    res.status(StatusCodes.OK).send(GetSuccessMessage(StatusCodes.OK, null, 'Employee deleted successfully'));
  }
}
