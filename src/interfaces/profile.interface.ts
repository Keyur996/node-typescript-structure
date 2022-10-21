import { status } from '@prisma/client';

export interface CreateProfileInterface {
  name: string;
  user_id: number;
  organization_id: number;
  permissions: {
    permission_id: number;
    status: status;
    organization_uuid: string;
  }[];
}

export interface ProfilePermissionsInterface {
  permission_id: number;
  status: status;
}
