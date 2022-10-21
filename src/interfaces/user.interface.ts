export type TokenDataInterface = {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
  email: string;
  verified?: boolean;
  organization_id: number;
};

export type DeleteUserFromOrganizationInterface = {
  user_id: number;
  organization_id: number;
};

export type UpdateUserWhereData = {
  user_id: number;
  profile_id?: number;
  organization_id: number;
};
