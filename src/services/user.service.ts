// =================== import packages ==================
import { DeleteUserFromOrganizationInterface, UpdateUserWhereData } from '@/interfaces/user.interface';
import prismaObj from '@/middlewares/prisma.middleware';
import { Injectable } from '@nestjs/common';
// ======================================================
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  getUserById(data: Prisma.UserFindFirstArgsBase) {
    return prismaObj.user.findFirst(data);
  }

  getUser(data: Prisma.UserFindFirstArgsBase) {
    return prismaObj.user.findFirst(data);
  }

  getUsers(data?: Prisma.UserFindManyArgs) {
    return prismaObj.user.findMany(data);
  }

  createUser(data: Prisma.UserCreateArgs) {
    return prismaObj.user.create(data);
  }

  updateUser(data: Prisma.UserUpdateArgs) {
    return prismaObj.user.update(data);
  }

  updateUserTransaction(data: Prisma.UserUncheckedCreateInput, whereData: UpdateUserWhereData) {
    const { user_id, organization_id, profile_id } = whereData;
    return prismaObj.$transaction(async (tx) => {
      if (profile_id) {
        await tx.userProfile.deleteMany({ where: { organization_id, user_id } });
        data.UserProfile = { create: { profile_id, organization_id } };
      }
      const update = await tx.user.update({
        data: { ...data },
        where: { id: user_id },
      });
      return update;
    });
  }

  deleteUserSoft(user_id: number) {
    return prismaObj.user.update({
      where: { id: user_id },
      data: { deleted_at: new Date(), is_deleted: true },
    });
  }

  async deleteUserFromOrganization({ user_id, organization_id }: DeleteUserFromOrganizationInterface) {
    await prismaObj.userPlatform.deleteMany({ where: { organization_id, user_id } });
    await prismaObj.userProfile.deleteMany({ where: { organization_id, user_id } });
    return prismaObj.userOrganization.deleteMany({
      where: { organization_id, user_id },
    });
  }

  async deleteUserHard(user_id: number) {
    await prismaObj.userProfile.deleteMany({ where: { user_id } });
    await prismaObj.userPlatform.deleteMany({ where: { user_id } });
    await prismaObj.userOrganization.deleteMany({ where: { user_id } });
    return prismaObj.user.delete({ where: { id: user_id } });
  }
}
