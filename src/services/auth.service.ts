// =================== import packages ==================
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
// ======================================================
import { CreateOrganizationInterface, CreateUserInterface } from '@/interfaces/auth.interface';
import prismaObj from '@/middlewares/prisma.middleware';

@Injectable()
export class AuthService {
  async getUserByEmail(email: string) {
    const response = await prismaObj.user.findFirst({
      where: { email, is_deleted: false },
      select: { id: true, email: true, is_owner: true, verified: true, password: true },
    });
    return response;
  }

  checkEmailExist(email: string) {
    return prismaObj.user.findFirst({
      where: { email, is_deleted: false },
      select: { email: true },
    });
  }

  async getUser(data: Prisma.UserFindFirstArgsBase) {
    const response = await prismaObj.user.findFirst(data);
    return response;
  }

  getOrgByEmailOrOrgOwnerId(email: string, useId: number) {
    return prismaObj.userOrganization.findMany({
      where: { OR: { user: { email, is_deleted: false }, organization: { owner_id: useId, is_deleted: false } } },
      include: { organization: { select: { name: true, uuid: true } } },
    });
  }

  async createOrganizationWithInitialProfile(organizationData: {
    settings: object;
    organizationName?: string;
    organizationCategory?: string;
    user_id: number;
  }) {
    return prismaObj.$transaction(async (tx) => {
      // ---------------1 first create organization ----------------
      const organization = await tx.organization.create({
        data: {
          uuid: uuidv4(),
          settings: organizationData.settings,
          ...(organizationData.organizationName && {
            name: organizationData.organizationName,
          }),
          ...(organizationData.organizationCategory && {
            organization_category: organizationData.organizationCategory,
          }),
          owner_id: organizationData.user_id,
        },
      });

      // --------------- 2 fetch all possible permissions & then assign to default profile ----------------
      const permissions = await tx.permission.findMany({
        where: { status: 'ACTIVE' },
      });
      const profile = await tx.profile.create({
        data: {
          name: 'Administrator',
          organization_id: organization.id,
          ProfilePermission: {
            create: permissions.map((permission) => ({
              permission_id: permission.id,
              organization_id: organization.id,
              status: permission.status,
            })),
          },
        },
      });
      // --------------- 3 assign organization & profile to user ----------------
      await tx.user.update({
        where: { id: organizationData.user_id },
        data: {
          UserOrganization: {
            create: {
              organization_id: organization.id,
            },
          },
          UserPlatform: {
            create: { platform_id: 1, organization_id: organization.id },
          },
          UserProfile: {
            create: {
              profile_id: profile.id,
              organization_id: organization.id,
            },
          },
        },
      });
      return {
        organizations: [
          {
            name: organization.name,
            uuid: organization.uuid,
          },
        ],
      };
    });
  }

  async createProfile(organization_id: number) {
    const permissions = await prismaObj.permission.findMany({
      where: { status: 'ACTIVE' },
    });
    return prismaObj.profile.create({
      data: {
        name: 'Administrator',
        organization_id,
        ProfilePermission: {
          create: permissions.map((permission) => ({
            permission_id: permission.id,
            organization_id,
            status: permission.status,
          })),
        },
      },
    });
  }

  async registerUser(userData: CreateUserInterface, organizationData: CreateOrganizationInterface) {
    return prismaObj.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          password: userData.hashPassword,
          phone: userData.phone,
          is_owner: true,
          settings: {},
        },
      });

      const organization = await tx.organization.create({
        data: {
          uuid: uuidv4(),
          settings: organizationData.settings,
          ...(organizationData.organizationName && {
            name: organizationData.organizationName,
          }),
          ...(organizationData.organizationCategory && {
            organization_category: organizationData.organizationCategory,
          }),
          owner_id: user.id,
          UserOrganization: {
            create: { user_id: user.id },
          },
        },
      });

      const permissions = await tx.permission.findMany();

      await tx.profile.create({
        data: {
          name: 'Administrator',
          organization_id: organization.id,
          ProfilePermission: {
            create: permissions.map((permission) => ({
              permission_id: permission.id,
              organization_id: organization.id,
              status: permission.status,
            })),
          },
          UserProfile: {
            create: {
              user_id: user.id,
              organization_id: organization.id,
            },
          },
        },
      });

      await tx.userPlatform.create({
        data: {
          platform_id: 1,
          organization_id: organization.id,
          user_id: user.id,
        },
      });
      return { user, organization };
    });
  }

  createUsr(data: Prisma.UserCreateArgs) {
    return prismaObj.user.create(data);
  }

  updateUser(data: Prisma.UserUpdateArgs) {
    return prismaObj.user.update(data);
  }
}
