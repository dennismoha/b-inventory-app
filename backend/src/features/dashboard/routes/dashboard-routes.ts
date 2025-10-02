// routes/AdminDashboardRoutes.ts
import express, { Router } from 'express';
import { SalesController } from '@src/features/dashboard/controller/admin-dashboard';

class AdminDashboardRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Sales dashboard summary
    this.router.get('/sales/dashboard', SalesController.prototype.getSalesDashboard);
    this.router.get('/sales/admin/dashboard', SalesController.prototype.adminDashboard);

    // (Optional extra endpoints if needed later)
    // this.router.get('/sales/top-products', SalesController.prototype.getTopSellingProducts);
    // this.router.get('/sales/recent', SalesController.prototype.getRecentSales);
    // this.router.get('/sales/payment-methods', SalesController.prototype.getSalesByPaymentMethod);
    // this.router.get('/sales/daily', SalesController.prototype.getDailySales);
    // this.router.get('/sales/revenue', SalesController.prototype.getTotalRevenue);

    return this.router;
  }
}

export const adminDashboardRoutes = new AdminDashboardRoutes();
