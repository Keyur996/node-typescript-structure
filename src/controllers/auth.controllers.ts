// =================== import packages ==================
import type { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import appleSignIn from 'apple-signin-auth';
// ======================================================
import { AuthService } from '@/services/auth.service';
import { generalResponse, isExpired } from '@/helper/common.helper';
import { HttpException } from '@/exceptions/HttpException';
import { decrypt, encrypt, parseData } from '@/utils/util';
import { APPLE_AUDIENCE, FRONT_URL, GOOGLE_CLIENT_ID, JWT_SECRET, SERVER_URL } from '@config';
import { sendMail } from '@/helper/mail.helper';
import { TokenInterface } from '@/interfaces/auth.interface';

export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) {
    // do nothing.
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstname, lastname, email, password, phone, organizationName, organizationCategory } = req.body;
      const user = await this.authService.getUser({ where: { email, is_deleted: false } });

      if (user) {
        throw new HttpException(400, 'User is already registered with this email');
      }

      const tokenExpiryDate = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day expiry
      const token = encrypt(JSON.stringify({ email, tokenExpiryDate }));

      const hashPassword = await bcrypt.hash(password, 10);
      const userData = {
        firstname,
        lastname,
        email,
        phone,
        hashPassword,
      };
      const organizationData = {
        organizationName,
        organizationCategory,
        settings: {},
      };

      // ------------ user create with organization and initial Administrator profile & permissions------------
      const { user: newUser, organization } = await this.authService.registerUser(userData, organizationData);

      if (newUser) {
        // --- flow: send mail for verification after register -> then after verify redirect to login
        const replacement = {
          SERVER_URL,
          key: 'verifyAccount',
          userName: `${firstname} ${lastname}`,
          link: `${FRONT_URL}/verify-account?token=${encodeURIComponent(token)}`,
          mainText: '',
          helpText: 'Please click the link below to confirm your account.',
          buttonLabel: 'Confirm Your Account',
        };
        await sendMail([newUser.email], 'Verify your account', 'authTemplate', replacement);
        const payload = { email, userId: newUser.id };

        return generalResponse(res, {
          access_token: this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            expiresIn: '1d',
          }),
          is_owner: newUser.is_owner,
          verified: false,
          organizations: [
            {
              name: organization.name,
              uuid: organization.uuid,
            },
          ],
        });
      }
      throw new HttpException(400, 'User registration failed!');
    } catch (error) {
      next(error);
    }
  };

  public createOrganizationWithInitialProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName, organizationCategory } = req.body;
      const { id } = req.tokenData;

      const organizationData = {
        organizationName,
        organizationCategory,
        settings: {},
        user_id: id,
      };

      // ------------ create organization with profile -----------------
      const organizations = await this.authService.createOrganizationWithInitialProfile(organizationData);

      return generalResponse(res, organizations);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.getUserByEmail(email);

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const organizations = await this.authService.getOrgByEmailOrOrgOwnerId(email, user.id);
          const payload = {
            email: user.email,
            userId: user.id,
          };
          if (organizations.length === 0) {
            throw new HttpException(500, 'Something went wrong!');
          }
          return generalResponse(res, {
            access_token: this.jwtService.sign(payload, {
              secret: JWT_SECRET,
              expiresIn: '1d',
            }),
            is_owner: user.is_owner,
            verified: user.verified,
            organizations: organizations.map((obj) => ({ name: obj.organization.name, uuid: obj.organization.uuid })),
          });
        }
        throw new HttpException(400, 'Password is incorrect!');
      } else {
        throw new HttpException(400, 'User does not exist!');
      }
    } catch (error) {
      next(error);
    }
  };

  public emailExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const userEmail = await this.authService.checkEmailExist(email);
      if (userEmail) throw new HttpException(400, 'Email already exist!');

      generalResponse(res, null);
    } catch (error) {
      next(error);
    }
  };

  public verifyAccountByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      const decodedToken = decrypt(token as string);

      const tokenObj = parseData(decodedToken) as TokenInterface;

      if (typeof tokenObj !== 'object') {
        throw new HttpException(400, 'Invalid Token!');
      }

      if (isExpired(tokenObj.tokenExpiryDate)) {
        throw new HttpException(400, 'Token expired, try again!');
      }

      const user = await this.authService.getUser({ where: { email: tokenObj.email, is_deleted: false } });

      if (!user) {
        throw new HttpException(400, 'User is not registered with this mail!');
      } else if (user.verified) {
        return generalResponse(res, { verified: true });
      }

      await this.authService.updateUser({
        where: { email_is_deleted: { email: tokenObj.email, is_deleted: false } },
        data: {
          verified: true,
        },
      });

      return generalResponse(res, null);
    } catch (error) {
      next(error);
    }
  };

  public loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken });

      const payload = ticket.getPayload();
      const { sub, email, given_name: givenName, family_name: familyName, email_verified: emailVerified } = payload;

      if (!(email && emailVerified)) {
        throw new HttpException(400, 'Google login failed. Try again');
      }

      let newUser = false;
      let user = await this.authService.getUser({ where: { email, is_deleted: false } });

      if (user && user.active !== 'ACTIVE') {
        throw new HttpException(400, 'INACTIVE USER.');
      }

      if (!user) {
        newUser = true;
        const userData = {
          email,
          firstname: givenName,
          lastname: familyName,
          verified: true,
          is_owner: true,
          google_id: sub,
          settings: {},
        };
        user = await this.authService.createUsr({ data: userData });
      }

      const organizations = await this.authService.getOrgByEmailOrOrgOwnerId(email, user.id);

      const jwtPayload = { email: user.email, userId: user.id };

      if (organizations.length === 0 && user.is_owner === false) {
        throw new HttpException(500, 'Something went wrong!');
      }

      return generalResponse(
        res,
        {
          new_register: newUser,
          access_token: this.jwtService.sign(jwtPayload, {
            secret: JWT_SECRET,
            expiresIn: '1d',
          }),
          is_owner: user.is_owner,
          organizations: organizations.map((obj) => ({ name: obj.organization.name, uuid: obj.organization.uuid })),
        },
        'login success',
      );
    } catch (error) {
      next(error);
    }
  };

  public loginWithApple = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization, user: appleUser } = req.body;

      const userDetails = await appleSignIn.verifyIdToken(authorization.id_token, {
        audience: APPLE_AUDIENCE,
        ignoreExpiration: true,
      });

      const { email, email_verified: emailVerified } = userDetails;

      if (!(email && emailVerified === 'true')) {
        throw new HttpException(400, 'Apple login failed. Try again');
      }

      let newUser = false;
      let user = await this.authService.getUser({ where: { email, is_deleted: false } });

      if (user && user.active !== 'ACTIVE') {
        throw new HttpException(400, 'INACTIVE USER.');
      }

      // -- add user name in user object if user exists in request
      // -- The appleObj.user object is only sent the first time a user logs in, the rest of the times apple will only send the authorization object.
      if (!user) {
        const firstName = appleUser?.firstName || '';
        const lastName = appleUser?.lastName || '';

        newUser = true;
        const userData = {
          email,
          firstname: firstName,
          lastname: lastName,
          verified: true,
          is_owner: true,
          settings: {},
        };

        user = await this.authService.createUsr({ data: userData });
      }

      const organizations = await this.authService.getOrgByEmailOrOrgOwnerId(email, user.id);

      const jwtPayload = { email, userId: user.id };

      if (organizations.length === 0 && user.is_owner === false) {
        throw new HttpException(500, 'Something went wrong!');
      }

      return generalResponse(
        res,
        {
          access_token: this.jwtService.sign(jwtPayload, {
            secret: JWT_SECRET,
            expiresIn: '1d',
          }),
          is_owner: user.is_owner,
          new_register: newUser,
          organizations: organizations.map((obj) => ({ name: obj.organization.name, uuid: obj.organization.uuid })),
        },
        `${appleUser ? 'Register' : 'Login'} success`,
      );
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await this.authService.getUser({ where: { email, is_deleted: false } });

      if (!user) {
        throw new HttpException(400, 'User is not registered with this mail!');
      }

      const tokenExpiryDate = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day expiry
      const token = encrypt(JSON.stringify({ email, tokenExpiryDate }));

      // --- flow: frontend page link-> enter new password by user -> call reset password
      const replacement = {
        SERVER_URL,
        key: 'forgotPassword',
        userName: `${user.firstname} ${user.lastname}`,
        link: `${FRONT_URL}/reset-password?token=${encodeURIComponent(token)}`,
        mainText: '',
        helpText: 'Please click the link below to reset your password.',
        buttonLabel: 'Reset Your Password',
      };
      await sendMail([user.email], 'Forget your password?', 'authTemplate', replacement);
      return generalResponse(res, null);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      const decodedToken = decrypt(token as string);
      const tokenObj = parseData(decodedToken) as TokenInterface;

      if (typeof tokenObj !== 'object') {
        throw new HttpException(400, 'Invalid token!');
      }

      const user = await this.authService.getUser({ where: { email: tokenObj.email, is_deleted: false } });

      if (!user) {
        throw new HttpException(400, 'User not Found!');
      }

      if (isExpired(tokenObj.tokenExpiryDate)) {
        throw new HttpException(400, 'Token expired, try again!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.authService.updateUser({
        where: { email_is_deleted: { email: tokenObj.email, is_deleted: false } },
        data: { password: hashedPassword, verified: true },
      });

      return generalResponse(res, null);
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const getUser = await this.authService.getUser({ where: { id: req.tokenData.id } });
      if (getUser && getUser.password) {
        const isMatch = await bcrypt.compare(oldPassword, getUser.password);
        if (isMatch) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          await this.authService.updateUser({
            where: { id: Number(req.tokenData.id) },
            data: { password: hashedPassword },
          });

          return generalResponse(res, null, 'Password changed successfully!', 'success', false, 200);
        }
        throw new HttpException(400, 'Old password is incorrect!');
      } else throw new HttpException(400, 'User not Found!');
    } catch (error) {
      next(error);
    }
  };

  public resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenData } = req;
      const user = await this.authService.getUser({ where: { id: tokenData.id } });
      const { id, email, firstname, lastname } = user;
      if (!user) {
        throw new HttpException(400, 'User is not registered with this mail!');
      } else if (user.verified) {
        return generalResponse(res, { verified: true }, 'User is already verified!', 'success', true);
      }

      const tokenExpiryDate = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day expiry
      const token = encrypt(JSON.stringify({ email, tokenExpiryDate }));

      const replacement = {
        SERVER_URL,
        key: 'verifyAccount',
        userName: `${firstname} ${lastname}`,
        link: `${FRONT_URL}/verify-account?token=${encodeURIComponent(token)}`,
        mainText: '',
        helpText: 'Please click the link below to confirm your account.',
        buttonLabel: 'Confirm Your Account',
      };
      await sendMail([email], 'Verify your account', 'authTemplate', replacement);
      const payload = { email, userId: id };
      return generalResponse(
        res,
        {
          access_token: this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            expiresIn: '1d',
          }),
        },
        'Mail resend successfully. Please check your email!',
        'success',
        true,
      );
    } catch (error) {
      next(error);
    }
  };
}
