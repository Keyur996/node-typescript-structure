// =================== import packages ==================
// ======================================================
import prismaObj from '../middlewares/prisma.middleware';

const addPermission = async () => {
  await prismaObj.permission.createMany({
    data: [
      {
        name: 'create',
        permission_group_id: 1,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 1,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 1,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 1,
        status: 'ACTIVE',
      },
      {
        name: 'create',
        permission_group_id: 2,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 2,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 2,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 2,
        status: 'ACTIVE',
      },
      {
        name: 'create',
        permission_group_id: 3,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 3,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 3,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 3,
        status: 'ACTIVE',
      },
      {
        name: 'create',
        permission_group_id: 4,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 4,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 4,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 4,
        status: 'ACTIVE',
      },
      {
        name: 'create',
        permission_group_id: 5,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 5,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 5,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 5,
        status: 'ACTIVE',
      },
      {
        name: 'create',
        permission_group_id: 6,
        status: 'ACTIVE',
      },
      {
        name: 'read',
        permission_group_id: 6,
        status: 'ACTIVE',
      },
      {
        name: 'update',
        permission_group_id: 6,
        status: 'ACTIVE',
      },
      {
        name: 'delete',
        permission_group_id: 6,
        status: 'ACTIVE',
      },
    ],
  });
};

addPermission()
  .catch((e) => console.error(e))
  .finally(async () => {
    console.log('Seed for adding permission run successfully!');
    await prismaObj.$disconnect();
  });
