// =================== import packages ==================
// ======================================================
import prismaObj from '../middlewares/prisma.middleware';

const addPermissionGroup = async () => {
  await prismaObj.permissionGroup.createMany({
    data: [
      {
        name: 'leads',
        platform_id: 1,
        status: 'ACTIVE',
      },

      {
        name: 'contacts',
        platform_id: 1,
        status: 'ACTIVE',
      },

      {
        name: 'deals',
        platform_id: 1,
        status: 'ACTIVE',
      },

      {
        name: 'accounts',
        platform_id: 1,
        status: 'ACTIVE',
      },

      {
        name: 'activities',
        platform_id: 1,
        status: 'ACTIVE',
      },
      {
        name: 'setting',
        platform_id: 1,
        status: 'ACTIVE',
      },
    ],
  });
};

addPermissionGroup()
  .catch((e) => console.error(e))
  .finally(async () => {
    console.log('Seed for adding permissionGroup run successfully!');
    await prismaObj.$disconnect();
  });
