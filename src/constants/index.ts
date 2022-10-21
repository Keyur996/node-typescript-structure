//* ***************** specify constant variable ****************(EX. const TEST_USER="test user")

export const errorMessage = {
  'string.base': '{#label} should be a type of text',
  'string.min': '{#label} should have a minimum length of {#limit}',
  'string.empty': '{#label} is not allowed to be empty',
  'string.max': '{#label} should be maximum {#limit} characters..',
  'any.required': '{#label} is a required field',
};

// *************** all file types ************
export const IMAGE_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

export const VIDEO_FILE_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const AUDIO_FILE_TYPES = ['audio/mp3', 'audio/ogg', 'audio/mpeg'];

// ************* hear we define all filed's name which contain file ***********
export const FILE_FIELD_NAME_OBJ = {
  userProfile: {
    directory: '/profile',
    size: 1024 * 1024 * 1, // 1 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  },
  profile_image: {
    directory: '/images/user/profile',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  },
  organization_logo: {
    directory: '/images/organization/profile',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  }
};

export const PRISMA_DELETE_AT_MODELS = ['User', 'Organization', 'Profile'];
