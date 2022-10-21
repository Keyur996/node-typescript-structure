export interface CreateProfileInterface {
  firstname?: string;
  lastname?: string;
  email: string;
  phone?: string;
  hashPassword: string;
  organizationName?: string;
  organizationCategory?: string;
  profile_id: number;
  organization_uuid: string;
}
export interface CreateOrganizationInterface {
  settings: object;
  organizationName?: string;
  organizationCategory?: string;
}
export interface CreateUserInterface {
  firstname?: string;
  lastname?: string;
  email: string;
  phone?: string;
  hashPassword: string;
  // profile_id: number;
  // organization_id: number;
}
export interface TokenInterface {
  email: string;
  tokenExpiryDate: string;
}
