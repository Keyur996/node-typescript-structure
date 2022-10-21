// =================== import packages ==================
import { NextFunction, Request, Response } from 'express';
// ======================================================
import { generalResponse } from '@/helper/common.helper';
import { HttpException } from '@/exceptions/HttpException';
import { ProfileService } from '../services/profile-permission.service';
import { Prisma, status } from '@prisma/client';
import { profileKey } from '@/validationSchema/profile-permissions.validation.schema';
import prismaObj from '@/middlewares/prisma.middleware';
import { ProfilePermissionsInterface } from '@/interfaces/profile.interface';

export class ProfileController {
  constructor(private profileService: ProfileService) {
    // do nothing.
  }

  public addProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, name, permissions } = req.body;
      const { organization_id } = req.tokenData;
      const existing_profile = await prismaObj.profile.findFirst({
        where: { name, organization_id },
      });
      if (existing_profile) {
        throw new HttpException(400, 'Profile is already registered with this name');
      }
      const profile = await this.profileService.addProfile({
        organization_id,
        name,
        user_id,
        permissions,
      });
      if (profile) return generalResponse(res, profile);
      throw new HttpException(400, 'Profile addition failed!');
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, permissions } = req.body;
      const { id } = req.params;

      const profile = await this.profileService.getProfileById(Number(id));
      if (profile) {
        // data update query
        const updatedProfile = await prismaObj.profile.update({
          where: {
            id: Number(id),
          },
          include: {
            ProfilePermission: {},
          },
          data: {
            name,
          },
        });

        // todo:-//-> update relation in permission table
        await Promise.all(
          permissions.map(async (val: { permission_id: number; status: status }) => {
            return prismaObj.profilePermission.updateMany({
              where: {
                organization_id: req.tokenData.organization_id,
                permission_id: val.permission_id,
                profile_id: profile.id,
              },
              data: {
                status: val.status,
              },
            });
          }),
        );
        delete updatedProfile.deleted_at;
        delete updatedProfile.created_at;
        delete updatedProfile.updated_at;
        return generalResponse(res, updatedProfile);
      }
      throw new HttpException(400, 'Profile updation failed!');
    } catch (error) {
      next(error);
    }
  };

  public findProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const profile = await this.profileService.getProfileById(id);
      if (profile) {
        delete profile.deleted_at;
        delete profile.created_at;
        delete profile.updated_at;
        return generalResponse(res, profile);
      }

      throw new HttpException(400, 'Profile is not found!');
    } catch (error) {
      next(error);
    }
  };

  public deleteProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const existing_profile = await this.profileService.getProfileById(id);
      if (existing_profile) {
        const deletedProfile = await prismaObj.profile.delete({
          where: { id },
        });
        return generalResponse(res, deletedProfile);
      }

      throw new HttpException(400, 'Profile deletion by Id failed!');
    } catch (error) {
      next(error);
    }
  };

  public getProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const { limit = 10, page = 1, fields, exclude, sort, searchText } = query;

      // Per page data default 10
      const take = +limit;

      // Page number on skip data default 0
      const skip = (+page - 1) * +limit;

      // Dynamic nth level sorting
      const orderBy: Prisma.Enumerable<Prisma.ProfileOrderByWithRelationAndSearchRelevanceInput> = [];
      if (typeof sort === 'object' && Object.keys(sort).length) {
        Object.keys(sort).forEach((el) => orderBy.push({ [el]: sort[el] }));
      }

      // Specific field get if not specify all field get
      let select: Prisma.ProfileSelect = {};
      if (typeof fields === 'string' && fields.length) {
        fields.split(',').forEach((el) => (select[el] = true));
      } else {
        profileKey.map((el) => (select[el] = true));
      }

      // Specific field remove
      if (typeof exclude === 'string' && exclude.length) {
        exclude.split(',').forEach((el) => (select[el] = false));
      }

      // Custom field remove
      select = { ...select };

      // where object
      const whereObj = {
        name: {
          contains: `${searchText}`,
        },
      };

      const allProfile = await this.profileService.getProfiles({
        where: whereObj,
        include: {
          ProfilePermission: {},
          UserProfile: {},
          _count: true,
        },
        skip,
        take,
        orderBy,
      });
      if (allProfile.length) {
        return generalResponse(res, allProfile);
      }
      return generalResponse(res, [], 'No records of profile');
    } catch (error) {
      next(error);
    }
  };

  public getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organization_id: organizationId } = req.tokenData;
      const allProfiles = await this.profileService.getAllProfiles({ organizationId });
      return generalResponse(res, allProfiles);
    } catch (error) {
      next(error);
    }
  };

  public getAllPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allPermissions = await this.profileService.getAllPermissions();
      const permissions = allPermissions.reduce((perviousObj, currentObj) => {
        const currentGroup = currentObj.PermissionGroup.name;

        if (!perviousObj[currentGroup]) {
          perviousObj[currentGroup] = {
            [currentObj.name]: {
              permission_id: currentObj.id,
              status: currentObj.status,
            },
          };
        } else {
          perviousObj[currentGroup] = {
            ...perviousObj[currentGroup],
            [currentObj.name]: {
              permission_id: currentObj.id,
              status: currentObj.status,
            },
          };
        }
        return perviousObj;
      }, {});

      return generalResponse(res, permissions);
    } catch (error) {
      next(error);
    }
  };

  public getProfilePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organization_id: organizationId } = req.tokenData;
      const profileId = Number(req.params.id);
      const permissions = await this.profileService.getAllProfilePermissions({ profileId, organizationId });

      const newPermissions = [];

      permissions.forEach((permissionObj) => {
        const { name } = permissionObj.permission.PermissionGroup;
        const currIndex = newPermissions.findIndex((item) => item.name === name);

        if (currIndex === -1) {
          newPermissions.push({
            id: newPermissions.length,
            name,
            permissions: [
              { name: permissionObj.permission.name, value: permissionObj.permission_id, status: permissionObj.status },
            ],
          });
        } else {
          const oldObject = newPermissions[currIndex];
          const updatedPermissions = [
            ...oldObject.permissions,
            { name: permissionObj.permission.name, value: permissionObj.permission_id, status: permissionObj.status },
          ];
          newPermissions[currIndex] = {
            ...oldObject,
            permissions: updatedPermissions,
          };
        }
      });

      return generalResponse(res, newPermissions);

      // const profilePermissions = permissions.reduce((perviousObj, currentObj) => {
      //   const currentGroup = currentObj.permission.PermissionGroup.name;

      //   if (!perviousObj[currentGroup]) {
      //     perviousObj[currentGroup] = {
      //       [currentObj.permission.name]: {
      //         permission_id: currentObj.permission_id,
      //         status: currentObj.status,
      //       },
      //     };
      //   } else {
      //     perviousObj[currentGroup] = {
      //       ...perviousObj[currentGroup],
      //       [currentObj.permission.name]: {
      //         permission_id: currentObj.permission_id,
      //         status: currentObj.status,
      //       },
      //     };
      //   }
      //   return perviousObj;
      // }, {});

      // return generalResponse(res, profilePermissions);
    } catch (error) {
      next(error);
    }
  };

  public updateProfilePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organization_id: organizationId } = req.tokenData;
      const profileId = Number(req.params.id);
      const { permissions }: { permissions: ProfilePermissionsInterface[] } = req.body;

      console.log('HELLO WORLD', permissions);

      const response = await this.profileService.updateProfilePermissions({
        profileId,
        organizationId,
        permissions,
      });

      return generalResponse(res, response);
    } catch (error) {
      next(error);
    }
  };
}
