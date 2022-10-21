import Joi from 'joi';
import { Prisma } from '@prisma/client';
import { errorMessage } from '@/constants';

export const organizationKey = Object.keys(Prisma.OrganizationScalarFieldEnum);

const joiCommon = {
  joiString: Joi.string().messages({ ...errorMessage }),
  joiNumber: Joi.number().messages({ ...errorMessage }),
  joiBoolean: Joi.boolean().messages({ ...errorMessage }),
  joiDate: Joi.date().messages({ ...errorMessage }),
  joiObject: Joi.object().messages({ ...errorMessage }),
  joiArray: Joi.array().messages({ ...errorMessage }),
};

const joiData = {
  id: joiCommon.joiNumber.label('OrganizationId'),
  organization_category: joiCommon.joiString.label('Organization category').allow('', null),
  name: joiCommon.joiString.label('name').allow('', null),
  email: joiCommon.joiString
    .max(100)
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' })
    .allow('', null),
  phone: joiCommon.joiString.label('Phone').allow('', null),
  mobile: joiCommon.joiString.label('Mobile').allow('', null),
  fax: joiCommon.joiString.label('Fax').allow('', null),
  website: joiCommon.joiString.label('Website').allow('', null),
  description: joiCommon.joiString.label('Description').allow('', null),
  address1: joiCommon.joiString.label('Address 1').allow('', null),
  address2: joiCommon.joiString.label('Address 2').allow('', null),
  city: joiCommon.joiString.label('City').allow('', null),
  state: joiCommon.joiString.label('State').allow('', null),
  country: joiCommon.joiString.label('Country').allow('', null),
  zip: joiCommon.joiString.label('Zip Code').allow('', null),
  settings: joiCommon.joiObject.label('Setting'),
  organization_logo: Joi.any(),
};

export const createOrganizationSchema = Joi.object({
  organization_category: joiData.organization_category,
  name: joiData.name,
  email: joiData.email,
  phone: joiData.phone,
  mobile: joiData.mobile,
  fax: joiData.fax,
  website: joiData.website,
  description: joiData.description,
  address1: joiData.address1,
  address2: joiData.address2,
  city: joiData.city,
  state: joiData.state,
  country: joiData.country,
  zip: joiData.zip,
  settings: joiData.settings,
}).options({
  abortEarly: false,
});

export const organizationIdSchema = Joi.object({
  id: joiData.id.required(),
}).options({
  abortEarly: false,
});

export const getAllOrganizationSchema = Joi.object({
  page: Joi.number()
    .messages({ ...errorMessage })
    .allow('', null),
  limit: Joi.number().messages({ ...errorMessage }),
  fields: Joi.string()
    .valid(...organizationKey)
    .messages({ ...errorMessage })
    .allow('', null),
  exclude: Joi.string()
    .messages({ ...errorMessage })
    .allow('', null),
  sort: Joi.object()
    .pattern(Joi.string().valid(...organizationKey), Joi.string().valid(Prisma.SortOrder.asc, Prisma.SortOrder.desc))
    .messages({ ...errorMessage }),
  searchText: Joi.string().allow('', null),
}).options({ abortEarly: false });

export const updateOrganizationSchema = Joi.object({
  organization_category: joiData.organization_category,
  name: joiData.name,
  phone: joiData.phone,
  mobile: joiData.mobile,
  email: joiData.email,
  fax: joiData.fax,
  website: joiData.website,
  description: joiData.description,
  address1: joiData.address1,
  address2: joiData.address2,
  city: joiData.city,
  state: joiData.state,
  country: joiData.country,
  zip: joiData.zip,
  settings: joiData.settings,
  organization_logo: joiData.organization_logo,
}).options({
  abortEarly: false,
});
