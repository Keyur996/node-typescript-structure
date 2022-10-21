// =================== import packages ==================
import type { NextFunction, Request, Response } from 'express';
// ======================================================
import { dateFormat, generalResponse, getFileUrl } from '@/helper/common.helper';
import { UserService } from '@/services/user.service';
import { Prisma } from '@prisma/client';
import { userKey } from '@/validationSchema/user.validation.schema';
import { HttpException } from '@/exceptions/HttpException';
// import * as bcrypt from 'bcrypt';
import prismaObj from '@/middlewares/prisma.middleware';

export class UserController {
  private stringKey = [
    'firstname',
    'lastname',
    'username',
    'email',
    'phone',
    'password',
    'website',
    'fax',
    'gender',
    'address1',
    'address2',
    'city',
    'state',
    'country',
    'zip',
    'facebook',
    'twitter',
    'linkedin',
  ];

  constructor(private userService: UserService) {
    // do nothing.
  }

  public getLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenData } = req;
      const { id } = tokenData;
      const user = await this.userService.getUserById({ where: { id, is_deleted: false } });

      const organizations = await prismaObj.userOrganization.findMany({
        where: { user: { id, is_deleted: false } },
        include: { organization: { select: { name: true, uuid: true } } },
      });

      return generalResponse(res, { ...user, organizations });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id: number;
      const { organization_id } = req.tokenData;
      if (req.params.id) {
        id = +req.params.id;
      } else {
        id = req.tokenData.id;
      }
      const { include } = req.query;
      const userInclude: Prisma.UserInclude = {};
      if (typeof include === 'string' && organization_id) {
        const array = include.split(',');
        if (array.includes('organization')) {
          userInclude.UserOrganization = {
            select: { organization: true },
            where: { organization_id, user_id: id },
          };
        }

        if (array.includes('profile')) {
          userInclude.UserProfile = { select: { profile: true }, where: { organization_id, user_id: id } };
        }

        if (array.includes('platform')) {
          userInclude.UserPlatform = { select: { platform: true }, where: { organization_id, user_id: id } };
        }

        if (array.includes('user')) {
          userInclude.added_by_id_relation = true;
        }
      }

      const user = await this.userService.getUserById({
        where: { id, is_deleted: false },
        include: userInclude,
      });
      return generalResponse(res, user, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const { limit = 10, page = 1, fields, exclude, sort, searchText } = query;

      // Per page data default 10
      const take = +limit;

      // Page number on skip data default 0
      const skip = (+page - 1) * +limit;

      // Dynamic nth level sorting
      const orderBy: Prisma.Enumerable<Prisma.UserOrderByWithRelationAndSearchRelevanceInput> = [];
      if (typeof sort === 'object' && Object.keys(sort).length) {
        Object.keys(sort).forEach((el) => orderBy.push({ [el]: sort[el] }));
      }

      // Specific field get if not specify all field get
      let select: Prisma.UserSelect = {};
      if (typeof fields === 'string' && fields.length) {
        fields.split(',').forEach((el) => (select[el] = true));
      } else {
        userKey.map((el) => (select[el] = true));
      }

      // Specific field remove
      if (typeof exclude === 'string' && exclude.length) {
        exclude.split(',').forEach((el) => (select[el] = false));
      }

      // Custom field remove
      select = { ...select, password: false };

      // search in modal string field
      const where: Prisma.UserWhereInput = { is_deleted: false };
      if (typeof searchText === 'string') {
        const search: Prisma.Enumerable<Prisma.UserWhereInput> = [];
        this.stringKey.forEach((el) => search.push({ [el]: { contains: searchText } }));
        where.OR = [...search];
      }

      const user = await this.userService.getUsers({
        skip,
        take,
        select,
        orderBy,
        where,
      });
      return generalResponse(res, user, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenData } = req;
      const { organization_id } = tokenData;
      const {
        firstname,
        lastname,
        username,
        email,
        phone,
        // password,
        birth_date,
        website,
        fax,
        gender,
        address1,
        address2,
        city,
        state,
        country,
        zip,
        active,
        settings = {},
        facebook,
        twitter,
        linkedin,
        // organization_id,
        platform_ids,
        profile_id,
      } = req.body;

      const checkUserData: Prisma.UserWhereInput = {};
      checkUserData.OR = [{ email }];
      if (username) checkUserData.OR.push({ username });
      checkUserData.NOT = { UserOrganization: { some: { organization_id } } };
      // if (username) checkUserData.username = username;
      // checkUserData.OR.push({ UserOrganization: { some: { organization_id } } });

      const checkUser = await this.userService.getUser({
        where: { ...checkUserData, is_deleted: false },
      });
      if (checkUser) {
        let errorMessage: string;
        if (checkUser.email === email) {
          errorMessage = 'User is already exists on this email';
        } else if (checkUser.username === username) {
          errorMessage = 'User is already exists on this username';
        } else {
          errorMessage = 'User is already exists';
        }
        throw new HttpException(400, errorMessage);
      }

      // const hashPassword = await bcrypt.hash(password, 10);
      console.log('date', dateFormat(birth_date));
      const userData: Prisma.UserUncheckedCreateInput = {
        firstname,
        lastname,
        username,
        email,
        phone,
        birth_date: dateFormat(birth_date),
        website,
        fax,
        gender,
        address1,
        address2,
        city,
        state,
        country,
        zip,
        active,
        facebook,
        twitter,
        linkedin,
        // password: hashPassword,
        added_by: tokenData.id, // Admin user id
        verified: true,
        settings,
        UserOrganization: {
          create: { organization_id },
        },
      };

      if (req.files?.[0]) {
        // const filePath = req.files[0].path.split('/');
        // filePath.shift();
        // userData.profile_image = filePath.join('/');
        userData.profile_image = getFileUrl(req.files[0]);
      }

      if (typeof platform_ids === 'object' && platform_ids.length) {
        if (platform_ids.length === 1) {
          userData.UserPlatform = {
            create: {
              platform_id: platform_ids[0],
              organization_id,
            },
          };
        } else {
          platform_ids.map((platform_id: number) => ({
            platform_id,
            organization_id,
          }));
          userData.UserPlatform = {
            createMany: { data: [...platform_ids], skipDuplicates: true },
          };
        }
      }

      if (profile_id) {
        userData.UserProfile = { create: { profile_id, organization_id } };
      }

      const createUser = await this.userService.createUser({ data: userData });

      if (!createUser) {
        throw new HttpException(400, 'User creation failed!');
      }
      return generalResponse(res, createUser, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id: number;
      if (req.params.id) {
        id = +req.params.id;
      } else {
        id = req.tokenData.id;
      }
      const { organization_id } = req.tokenData;
      if (req.body.username) {
        const checkUser = await this.userService.getUser({
          where: { username: req.body.username, NOT: { id }, is_deleted: false },
        });
        if (!checkUser) {
          throw new HttpException(400, 'User is already exists on this username');
        }
      }
      const { platform_ids, profile_id, ...otherData } = req.body;
      const updateData: Prisma.UserUncheckedCreateInput = { ...otherData };
      console.log(updateData);

      Object.keys(otherData).forEach((el) => {
        if (!otherData[el]) {
          delete updateData[el];
        } else if (otherData[el] === 'null' || otherData[el] === 'undefined') {
          updateData[el] = '';
        }
      });

      updateData.birth_date = dateFormat(otherData.birth_date);

      if (req.files?.[0]) {
        // const filePath = req.files[0].path.split('/');
        // filePath.shift();
        // updateData.profile_image = filePath.join('/');
        updateData.profile_image = getFileUrl(req.files[0]);
      }

      // ======================
      // if (organization_id) {
      //   updateData.UserOrganization = {
      //     create: { organization_id },
      //   };
      // }
      // if (platform_ids) {
      //   const platformData = [];
      //   platform_ids.forEach((platform_id: number) => platformData.push({
      //     platform_id,
      //     organization_id,
      //   }),);
      //   updateData.UserPlatform = {
      //     createMany: { data: [...platformData], skipDuplicates: true },
      //   };
      // }
      // if (profile_id) {
      //   updateData.UserProfile = { create: { profile_id, organization_id } };
      // }
      // return generalResponse(res, updateData, 'success', 'success', false, 200);
      // ========================

      // const updateUser = await this.userService.updateUser({
      //   data: { ...updateData },
      //   where: { id },
      // });
      const updateUser = await this.userService.updateUserTransaction(
        { ...updateData },
        { user_id: id, organization_id, profile_id: +profile_id },
      );
      return generalResponse(res, updateUser, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id: number;
      if (req.params.id) {
        id = +req.params.id;
      } else {
        id = req.tokenData.id;
      }
      const user = await this.userService.getUserById({ where: { id, is_deleted: false } });
      if (!user) {
        throw new HttpException(400, 'User not exists');
      }
      const deletedUser = await this.userService.deleteUserSoft(id);
      return generalResponse(res, deletedUser, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public deleteUserFromOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, tokenData } = req;
      const { id } = params;
      const { organization_id } = tokenData;

      const deletedData = await this.userService.deleteUserFromOrganization({
        user_id: +id,
        organization_id,
      });
      return generalResponse(res, deletedData, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };
}
