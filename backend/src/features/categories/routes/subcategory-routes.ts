import express, { Router } from 'express';
import { SubCategoriesController } from '@src/features/categories/controller/subcategories-controller';
import { verifyAuthRoles } from '@src/shared/globals/helpers/verify-roles';

class SubCategoryRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/subcategories', verifyAuthRoles('user', 'admin'), SubCategoriesController.prototype.fetchSubCategories);
    this.router.post('/subcategories', verifyAuthRoles('admin'), SubCategoriesController.prototype.createSubCategory);
    this.router.put('/subcategories/:subcategory_id', verifyAuthRoles('admin'), SubCategoriesController.prototype.updateSubCategory);
    this.router.delete('/subcategories/:subcategory_id', verifyAuthRoles('admin'), SubCategoriesController.prototype.deleteSubCategory);

    return this.router;
  }
}

export const subCategoryRoutes: SubCategoryRoutes = new SubCategoryRoutes();
