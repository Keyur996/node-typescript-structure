// =================== import packages ==================
import prismaObj from '@/middlewares/prisma.middleware';
import { Injectable } from '@nestjs/common';
// ======================================================
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  getOrganizationById(data: Prisma.OrganizationFindFirstArgs) {
    return prismaObj.organization.findFirst(data);
  }

  getOrganization(data: Prisma.OrganizationFindFirstArgsBase) {
    return prismaObj.organization.findFirst(data);
  }

  getOrganizations(data?: Prisma.OrganizationFindManyArgs) {
    return prismaObj.organization.findMany(data);
  }

  createOrganization(data: Prisma.OrganizationCreateArgs) {
    return prismaObj.organization.create(data);
  }

  updateOrganization(data: Prisma.OrganizationUpdateArgs) {
    return prismaObj.organization.update(data);
  }

  deleteOrganizationSoft(organization_id: number) {
    return prismaObj.organization.update({
      where: { id: organization_id },
      data: { deleted_at: new Date(), is_deleted: true },
    });
  }

  async deleteOrganizationHard(organization_id: number) {
    await prismaObj.userOrganization.deleteMany({ where: { organization_id } });
    await prismaObj.userPlatform.deleteMany({
      where: { organization_id },
    });
    await prismaObj.profile.deleteMany({ where: { organization_id } });
    await prismaObj.userProfile.deleteMany({ where: { organization_id } });
    await prismaObj.profilePermission.deleteMany({
      where: { organization_id },
    });
    return prismaObj.organization.delete({ where: { id: organization_id } });
  }
}
