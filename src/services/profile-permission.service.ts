/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// =================== import packages ==================
import { Injectable } from '@nestjs/common';
// ======================================================
import { CreateProfileInterface, ProfilePermissionsInterface } from '@/interfaces/profile.interface';
import { Prisma } from '@prisma/client';
import prismaObj from '@/middlewares/prisma.middleware';

@Injectable()
export class ProfileService {
  getProfileById(id: number) {
    return prismaObj.profile.findFirst({ where: { id }, include: { ProfilePermission: {}, UserProfile: {} } });
  }

  addProfile(profileData: CreateProfileInterface) {
    const { name, organization_id, user_id, permissions } = profileData;
    const all_permissions = permissions.map((val) => {
      return {
        organization_id,
        permission_id: val.permission_id,
        status: val.status,
      };
    });

    return prismaObj.profile.create({
      data: {
        organization_id,
        name,
        UserProfile: {
          create: {
            user_id,
            organization_id,
          },
        },
        ProfilePermission: {
          create: [...all_permissions],
        },
      },
    });
  }

  getProfiles(data?: Prisma.ProfileFindManyArgs) {
    return prismaObj.profile.findMany(data);
  }

  getAllProfiles({ organizationId }: { organizationId: number }) {
    return prismaObj.profile.findMany({
      where: { organization_id: organizationId },
      select: { id: true, name: true },
    });
  }

  getAllPermissions() {
    return prismaObj.permission.findMany({
      where: { status: 'ACTIVE' },
      include: { PermissionGroup: true },
    });
  }

  getAllProfilePermissions({ profileId, organizationId }: { profileId?: number; organizationId: number }) {
    return prismaObj.profilePermission.findMany({
      where: {
        profile_id: profileId,
        // organization_id: organizationId,
        permission: { status: 'ACTIVE' } /* Current Active Permissions */,
      },
      select: {
        permission_id: true,
        profile_id: true,
        status: true,
        permission: {
          select: {
            name: true,
            permission_group_id: true,
            PermissionGroup: {
              select: { name: true, status: true },
            },
          },
        },
      },
    });
  }

  async updateProfilePermissions({
    profileId,
    organizationId,
    permissions,
  }: {
    profileId: number;
    organizationId: number;
    permissions: ProfilePermissionsInterface[];
  }) {
    return prismaObj.$transaction(async () => {
      permissions.forEach(async ({ permission_id, status }) => {
        await prismaObj.profilePermission.update({
          where: {
            permission_id_profile_id_organization_id: {
              permission_id,
              profile_id: profileId,
              organization_id: organizationId,
            },
          },
          data: { status },
        });
      });
    });
  }
}
