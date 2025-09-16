import express, { Router } from 'express';
import { AssetsController } from '@src/features/hrm/assets/controller/assets-controller';
import { authMiddleware } from '@src/shared/globals/helpers/auth-middleware';

class AssetRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // Fetch all assets
    this.router.get('/assets', authMiddleware.verifyUser, AssetsController.prototype.fetchAssets);

    // Fetch single asset
    this.router.get('/assets/:id', authMiddleware.verifyUser, AssetsController.prototype.fetchAssetById);

    // Create a new asset
    this.router.post('/assets', authMiddleware.verifyUser, AssetsController.prototype.createAsset);

    // Update asset
    this.router.put('/assets/:id', authMiddleware.verifyUser, AssetsController.prototype.updateAsset);

    // Delete asset
    this.router.delete('/assets/:id', authMiddleware.verifyUser, AssetsController.prototype.deleteAsset);

    return this.router;
  }
}

export const assetRoutes = new AssetRoutes();
