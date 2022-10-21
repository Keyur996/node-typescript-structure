// =================== import packages ==================
// ======================================================
import prismaObj from '../middlewares/prisma.middleware';

const addPlatform = async () => {
  await prismaObj.platform.createMany({
    data: [
      {
        name: 'CRM',
        status: 'ACTIVE',
      },
    ],
  });
};

addPlatform()
  .catch((e) => console.error(e))
  .finally(async () => {
    console.log('Seed for adding permissionGroup run successfully!');
    await prismaObj.$disconnect();
  });
