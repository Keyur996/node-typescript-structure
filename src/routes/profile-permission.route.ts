// =================== import packages ==================
import { Router } from 'express';
// ======================================================
import { Routes } from '@/interfaces/routes.interface';
import { ProfileController } from '@/controllers/profile-permission.controller';
import { ProfileService } from '@/services/profile-permission.service';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  addOrUpdateProfileSchema,
  PermissionsSchema,
  ProfileIdSchema,
  profilePaginationSchema,
} from '@/validationSchema/profile-permissions.validation.schema';
import { authMiddleware } from '@/middlewares/auth.middleware';

class ProfileRoute implements Routes {
  public path = '/profile';
  public router = Router();
  public ProfileController = new ProfileController(new ProfileService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      validationMiddleware(addOrUpdateProfileSchema, 'body'),
      authMiddleware,
      this.ProfileController.addProfile,
    );
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(addOrUpdateProfileSchema, 'body'),
      validationMiddleware(ProfileIdSchema, 'params'),
      authMiddleware,
      this.ProfileController.updateProfile,
    );
    this.router.get(
      `${this.path}`,
      validationMiddleware(profilePaginationSchema, 'params'),
      authMiddleware,
      this.ProfileController.getProfiles,
    );
    this.router.get(
      `${this.path}/all`,
      validationMiddleware(profilePaginationSchema, 'params'),
      authMiddleware,
      this.ProfileController.getAllProfiles,
    );
    this.router.get(
      `${this.path}/:id`,
      validationMiddleware(ProfileIdSchema, 'params'),
      authMiddleware,
      this.ProfileController.findProfileById,
    );
    this.router.delete(
      `${this.path}/:id`,
      validationMiddleware(ProfileIdSchema, 'params'),
      authMiddleware,
      this.ProfileController.deleteProfileById,
    );
    this.router.get(`${this.path}/permissions/all`, authMiddleware, this.ProfileController.getAllPermissions);
    this.router.get(
      `${this.path}/permissions/:id`,
      validationMiddleware(ProfileIdSchema, 'params'),
      authMiddleware,
      this.ProfileController.getProfilePermissions,
    );
    this.router.put(
      `${this.path}/permissions/:id`,
      validationMiddleware(ProfileIdSchema, 'params'),
      validationMiddleware(PermissionsSchema, 'body'),
      authMiddleware,
      this.ProfileController.updateProfilePermissions,
    );
  }
}

export default ProfileRoute;
