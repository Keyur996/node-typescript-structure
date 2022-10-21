// =================== import packages ==================
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
// ======================================================
import { HttpException } from '@/exceptions/HttpException';
import { OrganizationService } from '@/services/organization.service';
import { Organization } from '@prisma/client';

const organizationService = new OrganizationService();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uuid = `${req.headers.xorganization}`;
    let organization: Organization;
    if (uuid) {
      organization = await organizationService.getOrganizationById({
        where: { uuid },
        select: {
          id: true,
        },
      });
    }
    if (!uuid || !organization) {
      throw new HttpException(401, 'can not able to find Your Organization Please login again');
    }
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        throw new HttpException(401, 'Your token has expired!');
      }
      if (!user.verified) {
        throw new HttpException(401, 'User not verified!');
      }
      req.tokenData = user;
      req.tokenData.organization_id = organization.id;
      return next();
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

const unverifiedAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uuid = `${req.headers['X-ORGANIZATION-UUID']}`;
    let organization: Organization;
    if (uuid) {
      organization = await organizationService.getOrganizationById({
        where: { uuid },
        select: {
          id: true,
        },
      });
    }
    if (!uuid || !organization) {
      throw new HttpException(401, 'can not able to find Your Organization Please login again');
    }
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        throw new HttpException(401, 'Your token has expired!');
      }
      req.tokenData = user;
      req.tokenData.organization_id = organization.id;
      return next();
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

// ----------- this middleware use when organization not register ------------
const unregisterOrganizationAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        throw new HttpException(401, 'Your token has expired!');
      }
      req.tokenData = user;
      return next();
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

export { authMiddleware, unverifiedAuthMiddleware, unregisterOrganizationAuthMiddleware };
