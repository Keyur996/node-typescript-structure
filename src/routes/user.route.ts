// =================== import packages ==================
import { Router } from 'express';
// ======================================================
import { UserController } from '@/controllers/user.controller';
import { Routes } from '@/interfaces/routes.interface';
import { authMiddleware, unregisterOrganizationAuthMiddleware } from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  // createUserSchema,
  userIdSchema,
  getAllUserSchema,
  updateUserSchema,
  userExternalSchema,
} from '@/validationSchema/user.validation.schema';
import { UserService } from '@/services/user.service';
import { fileUpload } from '@/middlewares/multer.middleware';

class UserRoute implements Routes {
  public path = '/user';

  public router = Router();

  public userController = new UserController(new UserService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // post api
    this.router.post(
      `${this.path}`,
      authMiddleware,
      fileUpload(1),
      // validationMiddleware(createUserSchema, 'body'),
      this.userController.createUser,
    );

    // put api
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      validationMiddleware(userIdSchema, 'params'),
      validationMiddleware(updateUserSchema, 'body'),
      this.userController.updateUser,
    );
    this.router.put(
      `${this.path}`,
      fileUpload(2),
      authMiddleware,
      validationMiddleware(updateUserSchema, 'body'),
      this.userController.updateUser,
    );

    // get api
    this.router.get(
      `${this.path}/logged-in-user`,
      unregisterOrganizationAuthMiddleware,
      this.userController.getLoggedInUser,
    );
    this.router.get(
      `${this.path}/users`,
      authMiddleware,
      validationMiddleware(getAllUserSchema, 'query'),
      this.userController.getUsers,
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      validationMiddleware(userIdSchema, 'params'),
      this.userController.getUserById,
    );
    this.router.get(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(userExternalSchema, 'query'),
      this.userController.getUserById,
    );

    // delete api
    this.router.delete(
      `${this.path}/deleteUserFromOrganization/:id`,
      authMiddleware,
      this.userController.deleteUserFromOrganization,
    );
    this.router.delete(
      `${this.path}/:id`,
      validationMiddleware(userIdSchema, 'params'),
      this.userController.deleteUser,
    );
    this.router.delete(`${this.path}`, authMiddleware, this.userController.deleteUser);
  }
}

export default UserRoute;
