import express, { Router } from 'express';
import { Categories } from '@src/features/categories/controller/categories-controller';

class CategoryRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/categories', Categories.prototype.fetchCategories);
    this.router.post('/categories', Categories.prototype.createCategory);
    this.router.put('/categories/:categoryId', Categories.prototype.updateCategory);
    this.router.delete('/categories/:categoryId', Categories.prototype.deleteCategory);

    return this.router;
  }
}

export const categoryRoutes: CategoryRoutes = new CategoryRoutes();
