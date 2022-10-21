// =================== import packages ==================
import { Router } from 'express';
// ======================================================
import { Routes } from '@/interfaces/routes.interface';
import PlatformController from '@/controllers/platform.controller';

class PlatformRoute implements Routes {
  public path = '/platform';
  public router = Router();
  public PlatformController = new PlatformController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/add`, this.PlatformController.addPlatform);
  }
}

export default PlatformRoute;
