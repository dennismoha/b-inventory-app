import express, { Router } from 'express';
import { EmployeesController } from '@src/features/hrm/employees/controller/employees-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class EmployeeRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // List employees
    this.router.get('/employees', authMiddleware.verifyUser, EmployeesController.prototype.fetchEmployees);

    // Get one employee
    this.router.get('/employees/:id', authMiddleware.verifyUser, EmployeesController.prototype.fetchEmployeeById);

    // Create employee
    this.router.post('/employees', authMiddleware.verifyUser, EmployeesController.prototype.createEmployee);

    // Update employee
    this.router.put('/employees/:id', authMiddleware.verifyUser, EmployeesController.prototype.updateEmployee);

    // Delete employee
    this.router.delete('/employees/:id', authMiddleware.verifyUser, EmployeesController.prototype.deleteEmployee);

    return this.router;
  }
}

export const employeeRoutes = new EmployeeRoutes();
