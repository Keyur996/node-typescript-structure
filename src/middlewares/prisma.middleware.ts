// =================== packages ====================
import { PrismaClient } from '@prisma/client';
// =================================================
import { PRISMA_DELETE_AT_MODELS } from '../constants';

const prismaObj = new PrismaClient({ errorFormat: 'minimal' });

// soft delete middleware
prismaObj.$use(async (params, next) => {
  if (params.action === 'delete' && params.args && PRISMA_DELETE_AT_MODELS.includes(params.model)) {
    params.action = 'update';
    params.args.data = { deleted_at: new Date(), is_deleted: true };
  }
  return next(params);
});

// deleted_at null and organizationId set where condition for get all query
prismaObj.$use(async (params, next) => {
  if (
    (params.action === 'findFirst' || params.action === 'findMany') &&
    params.args &&
    PRISMA_DELETE_AT_MODELS.includes(params.model)
  ) {
    params.args.where.is_deleted = false;
  }
  return next(params);
});

export default prismaObj;
