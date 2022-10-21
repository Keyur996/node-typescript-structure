import { Prisma } from '@prisma/client';
import Joi from 'joi';
import { joiCommon } from './common.validation';

export const profileKey = Object.keys(Prisma.ProfileScalarFieldEnum);

const joiProfileData = {
  id: joiCommon.joiNumber.label('Id'),
  organization_uuid: joiCommon.joiString.label('Organization UUid').required(),
  name: joiCommon.joiString.required().max(50).label('Name'),
  permissions: Joi.array()
    .items({
      permission_id: Joi.number().required(),
      status: Joi.string().required(),
    })
    .required()
    .label('Permissions'),
  user_id: joiCommon.joiNumber.required().label('User Id'),
};

export const addOrUpdateProfileSchema = Joi.object({
  organization_uuid: joiProfileData.organization_uuid,
  name: joiProfileData.name,
  user_id: joiProfileData.user_id,
  permissions: joiProfileData.permissions,
}).options({ abortEarly: false });

export const profilePaginationSchema = Joi.object({
  page: joiCommon.jioPage,
  limit: joiCommon.joiLimit,
  fields: joiCommon.joiFields.valid(...profileKey),
  exclude: joiCommon.joiExclude,
  sort: joiCommon.joiSort.pattern(
    Joi.string().valid(...profileKey),
    Joi.string().valid(Prisma.SortOrder.asc, Prisma.SortOrder.desc),
  ),
}).options({ abortEarly: false });

export const ProfileIdSchema = Joi.object({
  id: joiProfileData.id.required(),
}).options({ abortEarly: false });

export const PermissionsSchema = Joi.object({
  permissions: joiProfileData.permissions,
});
