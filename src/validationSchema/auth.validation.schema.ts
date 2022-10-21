import Joi from 'joi';
import { errorMessage } from '@/constants';

export const RegisterSchema = Joi.object({
  firstname: Joi.string()
    .required()
    .max(50)
    .label('First name')
    .messages({ ...errorMessage }),

  lastname: Joi.string()
    .required()
    .max(50)
    .label('Last name')
    .messages({ ...errorMessage }),

  email: Joi.string()
    .required()
    .max(100)
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' }),

  password: Joi.string()
    .min(8)
    .max(254)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .label('Password')
    .messages({
      ...errorMessage,
      'string.pattern.base':
        '{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character',
    }),
  phone: Joi.string()
    .max(50)
    .label('Phone number')
    .messages({ ...errorMessage })
    .allow('', null),

  organizationName: Joi.string()
    .label('organizationName')
    .messages({ ...errorMessage })
    .allow('', null),

  organizationCategory: Joi.string()
    .label('organizationCategory')
    .messages({ ...errorMessage })
    .allow('', null),
}).options({
  abortEarly: false,
});

export const CreateOrganizationWithInitialProfile = Joi.object({
  organizationName: Joi.string()
    .label('organizationName')
    .messages({ ...errorMessage })
    .allow('', null),

  organizationCategory: Joi.string()
    .label('organizationCategory')
    .messages({ ...errorMessage })
    .allow('', null),
}).options({
  abortEarly: false,
});

export const LoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' }),

  password: Joi.string()
    .required()
    .label('Password')
    .messages({
      ...errorMessage,
      'string.pattern.base':
        '{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character',
    }),
}).options({
  abortEarly: false,
});

export const IsEmailExistSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' }),
}).options({
  abortEarly: false,
});

export const LoginWithGoogleSchema = Joi.object({
  idToken: Joi.string()
    .required()
    .label('Google IdToken')
    .messages({ ...errorMessage }),
}).options({
  abortEarly: false,
});

export const LoginWithAppleSchema = Joi.object({
  authorization: Joi.object()
    .required()
    .label('Authorization')
    .messages({ ...errorMessage }),
  user: Joi.object()
    .label('user')
    .messages({ ...errorMessage })
    .allow('', null),
}).options({
  abortEarly: false,
});

export const VerifyAccountByEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .label('Token')
    .messages({ ...errorMessage }),
}).options({
  abortEarly: false,
});

export const ForgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .label('Email')
    .messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' }),
}).options({
  abortEarly: false,
});

export const ResetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .label('Token')
    .messages({ ...errorMessage }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .label('Password')
    .messages({
      ...errorMessage,
      'string.pattern.base':
        '{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character',
    }),
}).options({
  abortEarly: false,
});

export const ChangePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .label('Old Password')
    .messages({ ...errorMessage }),

  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'/)
    .required()
    .label('New Password')
    .messages({
      ...errorMessage,
      'string.pattern.base':
        '{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character',
    }),
}).options({
  abortEarly: false,
});
