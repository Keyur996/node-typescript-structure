import { errorMessage } from '@/constants';
import Joi from 'joi';

export const joiCommon = {
  joiString: Joi.string().messages({ ...errorMessage }),
  joiNumber: Joi.number().messages({ ...errorMessage }),
  joiBoolean: Joi.boolean().messages({ ...errorMessage }),
  joiDate: Joi.date().messages({ ...errorMessage }),
  joiArray: Joi.array().messages({ ...errorMessage }),
  joiObject: Joi.object().messages({ ...errorMessage }),
  // ==============For Pagination=======================
  jioPage: Joi.number()
    .messages({ ...errorMessage })
    .allow('', null),
  joiLimit: Joi.number().messages({ ...errorMessage }),
  joiFields: Joi.string()
    .messages({ ...errorMessage })
    .allow('', null),
  joiExclude: Joi.string()
    .messages({ ...errorMessage })
    .allow('', null),
  joiSort: Joi.object().messages({ ...errorMessage }),
};
