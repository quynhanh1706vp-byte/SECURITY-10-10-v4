import { IPermissions } from './permissions';

export type LoginRequest = {
  username: string;
  password: string;
};

export type TAuthResponse = {
  status: number;
  hashQrCode: string | null;
  authToken: string;
  refreshToken: string;
  accountType: number;
  companyCode: string;
  companyName: string;
  logo: string;
  departmentName: string;
  userTimeZone: string;
  userLanguage: string;
  accountId: number;
  userId: number;
  fullName: string;
  role: string;
  expireAccessToken: number;
  expiredDate: string;
  licenseVerified: boolean;
  permissions: IPermissions;
  passwordChangeMessage?: string,
  passwordChangeRequired?: boolean,
};

export type TSaveAuthUser = {
  avatar?: string;
  username?: string;
  companyId?: number;
  authToken: string;
  refreshToken: string;
  fullName: string;
  accountId?: number;
  accountType?: number;
  expireAccessToken?: number;
  permissionKey?: string; // Key to retrieve permissions from storage
  permissions?: any;
  userId?: number;
  companyCode?: string;
  companyName?: string;
  userLanguage?: string;
  userTimeZone?: string;
  role?: string;
  passwordChangeMessage?: string,
  passwordChangeRequired?: boolean,
};

export type TJwtPayload = {
  sub: string;
  username?: string;
  accountId?: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  fullName?: string;
  accountType?: string;
  nbf: number; // Not Before timestamp (Unix epoch)
  exp: number; // Expiration timestamp (Unix epoch)
  iss: string; // Issuer
  aud: string; // Audience
};
