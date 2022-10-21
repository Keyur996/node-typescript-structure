import Joi from 'joi';
import { Prisma } from '@prisma/client';
import { errorMessage } from '@/constants';
import { stringToJson } from '@/helper/common.helper';

export const userKey = Object.keys(Prisma.UserScalarFieldEnum);
export const userStatusKey = ['ACTIVE', 'INACTIVE'];
export const userIncludeKey = ['organization', 'profile', 'platform'];

const joiCommon = {
  joiString: Joi.string().messages({ ...errorMessage }),
  joiNumber: Joi.number().messages({ ...errorMessage }),
  joiBoolean: Joi.boolean().messages({ ...errorMessage }),
  joiDate: Joi.date().messages({ ...errorMessage }),
  joiObject: Joi.object().messages({ ...errorMessage }),
  joiArray: Joi.array().messages({ ...errorMessage }),
};

const joiData = {
  id: joiCommon.joiNumber.label('UserId'),
  firstname: joiCommon.joiString.max(50).label('First Name').allow('', null),
  lastname: joiCommon.joiString.max(50).label('Last Name').allow('', null),
  username: joiCommon.joiString.label('Username').allow('', null),
  email: joiCommon.joiString
    .max(100)
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' }),
  phone: joiCommon.joiString.label('Phone number').allow('', null),
  mobile: joiCommon.joiString.label('Mobile number').allow('', null),
  password: joiCommon.joiString
    .label('Phone number')
    .min(8)
    .max(254)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .label('Password')
    .messages({
      ...errorMessage,
      'string.pattern.base':
        '{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character',
    }),
  website: joiCommon.joiString.label('Website').allow('', null),
  fax: joiCommon.joiString.label('Fax').allow('', null),
  gender: joiCommon.joiString.label('Gender').allow('', null),
  address1: joiCommon.joiString.label('Address1').allow('', null),
  address2: joiCommon.joiString.label('Address2').allow('', null),
  city: joiCommon.joiString.label('City').allow('', null),
  state: joiCommon.joiString.label('State').allow('', null),
  country: joiCommon.joiString.label('Country').allow('', null),
  zip: joiCommon.joiString.label('Postal code').allow('', null),
  verified: joiCommon.joiBoolean,
  birth_date: joiCommon.joiDate.label('Birth date').allow('', null),
  added_by: joiCommon.joiNumber.label('Admin User').allow('', null),
  report_to: joiCommon.joiNumber.label('Report User').allow('', null),
  active: joiCommon.joiString.valid(...userStatusKey).label('Status'),
  apple_id: joiCommon.joiNumber.label('Apple id').allow('', null),
  google_id: joiCommon.joiNumber.label('Google id').allow('', null),
  settings: joiCommon.joiObject.label('Setting'),
  organization_id: joiCommon.joiNumber.label('Organization').allow('', null),
  platform_id: joiCommon.joiNumber.label('Platform'),
  platform_ids: joiCommon.joiArray.items(joiCommon.joiNumber).label('Platforms'),
  profile_id: joiCommon.joiNumber.label('Profile'),
  facebook: joiCommon.joiString.label('Facebook link').allow('', null),
  twitter: joiCommon.joiString.label('Twitter link').allow('', null),
  linkedin: joiCommon.joiString.label('LinkedIn link').allow('', null),
  profile_image: Joi.any(),
};

export const createUserSchema = Joi.object({
  firstname: joiData.firstname.required(),
  lastname: joiData.lastname.required(),
  username: joiData.username,
  email: joiData.email.required(),
  password: joiData.password.required(),
  phone: joiData.phone,
  mobile: joiData.mobile,
  birth_date: joiData.birth_date,
  website: joiData.website,
  fax: joiData.fax,
  gender: joiData.gender,
  address1: joiData.address1,
  address2: joiData.address2,
  city: joiData.city,
  state: joiData.state,
  country: joiData.country,
  zip: joiData.zip,
  active: joiData.active,
  settings: joiData.settings,
  facebook: joiData.facebook,
  twitter: joiData.twitter,
  linkedin: joiData.linkedin,
  organization_id: joiData.organization_id.required(),
  platform_ids: joiData.platform_ids,
  profile_id: joiData.profile_id,
  profile_image: joiData.profile_image,
}).options({
  abortEarly: false,
});

export const userIdSchema = Joi.object({
  id: joiData.id.required(),
}).options({
  abortEarly: false,
});

export const userExternalSchema = Joi.object({
  include: Joi.string().allow('', null),
}).options({
  abortEarly: false,
});

export const getAllUserSchema = Joi.object({
  page: Joi.number()
    .messages({ ...errorMessage })
    .allow('', null),
  limit: Joi.number().messages({ ...errorMessage }),
  fields: Joi.string()
    .valid(...userKey)
    .messages({ ...errorMessage })
    .allow('', null),
  exclude: Joi.string()
    .messages({ ...errorMessage })
    .allow('', null),
  sort: Joi.object()
    .pattern(Joi.string().valid(...userKey), Joi.string().valid(Prisma.SortOrder.asc, Prisma.SortOrder.desc))
    .messages({ ...errorMessage }),
  searchText: Joi.string().allow('', null),
}).options({ abortEarly: false });

export const updateUserSchema = Joi.object({
  firstname: joiData.firstname,
  lastname: joiData.lastname,
  username: joiData.username,
  phone: joiData.phone,
  mobile: joiData.mobile,
  website: joiData.website,
  fax: joiData.fax,
  gender: joiData.gender,
  address1: joiData.address1,
  address2: joiData.address2,
  city: joiData.city,
  state: joiData.state,
  country: joiData.country,
  zip: joiData.zip,
  birth_date: joiData.birth_date,
  report_to: joiData.report_to,
  active: joiData.active,
  settings: joiData.settings,
  facebook: joiData.facebook,
  twitter: joiData.twitter,
  linkedin: joiData.linkedin,
  organization_id: joiData.organization_id,
  platform_ids: joiData.platform_ids,
  profile_id: joiData.profile_id.required(),
  profile_image: joiData.profile_image,
  // common: Joi.custom((value, helper) => {
  //   if (!stringToJson(value)) {
  //     return helper.message({ ...errorMessage, custom: '{#label} is a invalid field' });
  //   }
  //   return value;
  // }),
}).options({
  abortEarly: false,
});

// export const deleteUserSchema = Joi.object({
//   organization_id: joiData.organization_id.required(),
//   platform_id: joiData.platform_id,
//   profile_id: joiData.profile_id,
//   platform_ids: joiData.platform_ids,
// }).options({
//   abortEarly: false,
// });
