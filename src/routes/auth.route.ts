// =================== import packages ==================
import { Router } from 'express';
import { JwtService } from '@nestjs/jwt';
// ======================================================
import { AuthController } from '@/controllers/auth.controllers';
import { AuthService } from '@/services/auth.service';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  ChangePasswordSchema,
  CreateOrganizationWithInitialProfile,
  ForgotPasswordSchema,
  IsEmailExistSchema,
  LoginSchema,
  LoginWithAppleSchema,
  LoginWithGoogleSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyAccountByEmailSchema,
} from '@/validationSchema/auth.validation.schema';
import {
  authMiddleware,
  unregisterOrganizationAuthMiddleware,
  unverifiedAuthMiddleware,
} from '@/middlewares/auth.middleware';

class AuthRoute implements Routes {
  public path = '/auth';

  public router = Router();

  public authController = new AuthController(new AuthService(), new JwtService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(RegisterSchema, 'body'),
      this.authController.register,
    );
    this.router.post(
      `${this.path}/email-exist`,
      validationMiddleware(IsEmailExistSchema, 'body'),
      this.authController.emailExist,
    );
    this.router.post(`${this.path}/login`, validationMiddleware(LoginSchema, 'body'), this.authController.login);
    this.router.post(
      `${this.path}/google`,
      validationMiddleware(LoginWithGoogleSchema, 'body'),
      this.authController.loginWithGoogle,
    );
    this.router.post(
      `${this.path}/apple`,
      validationMiddleware(LoginWithAppleSchema, 'body'),
      this.authController.loginWithApple,
    );
    this.router.post(
      `${this.path}/create-organization-with-initial-profile`,
      unregisterOrganizationAuthMiddleware,
      validationMiddleware(CreateOrganizationWithInitialProfile, 'body'),
      this.authController.createOrganizationWithInitialProfile,
    );
    this.router.post(
      `${this.path}/verify-account-by-email`,
      validationMiddleware(VerifyAccountByEmailSchema, 'body'),
      this.authController.verifyAccountByEmail,
    );
    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(ForgotPasswordSchema, 'body'),
      this.authController.forgotPassword,
    );
    this.router.post(
      `${this.path}/reset-password`,
      validationMiddleware(ResetPasswordSchema, 'body'),
      this.authController.resetPassword,
    );
    this.router.post(
      `${this.path}/change-password`,
      authMiddleware,
      validationMiddleware(ChangePasswordSchema, 'body'),
      this.authController.changePassword,
    );
    this.router.get(
      `${this.path}/resend-verification`,
      unverifiedAuthMiddleware,
      this.authController.resendVerification,
    );
  }
}

export default AuthRoute;
