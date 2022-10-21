// =================== import packages ==================
import { Router } from 'express';
// ======================================================
import { OrganizationController } from '@/controllers/organization.controller';
import { Routes } from '@/interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { OrganizationService } from '@/services/organization.service';
import {
  createOrganizationSchema,
  getAllOrganizationSchema,
  organizationIdSchema,
  updateOrganizationSchema,
} from '@/validationSchema/organization.validation.schema';
import { fileUpload } from '@/middlewares/multer.middleware';

class OrganizationRoute implements Routes {
  public path = '/organization';

  public router = Router();

  public organizationController = new OrganizationController(new OrganizationService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // post api
    this.router.post(
      `${this.path}`,
      validationMiddleware(createOrganizationSchema, 'body'),
      this.organizationController.createOrganization,
    );

    // put api
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(organizationIdSchema, 'params'),
      validationMiddleware(updateOrganizationSchema, 'body'),
      this.organizationController.updateOrganization,
    );
    this.router.put(
      `${this.path}`,
      authMiddleware,
      fileUpload(2),
      validationMiddleware(updateOrganizationSchema, 'body'),
      this.organizationController.updateOrganization,
    );

    // get api
    this.router.get(
      `${this.path}/organizations`,
      validationMiddleware(getAllOrganizationSchema, 'query'),
      this.organizationController.getOrganizations,
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      validationMiddleware(organizationIdSchema, 'params'),
      this.organizationController.getOrganizationById,
    );
    this.router.get(`${this.path}`, authMiddleware, this.organizationController.getOrganizationById);

    // delete api
    this.router.delete(
      `${this.path}/:id`,
      validationMiddleware(organizationIdSchema, 'params'),
      this.organizationController.deleteOrganizationById,
    );
  }
}

export default OrganizationRoute;
