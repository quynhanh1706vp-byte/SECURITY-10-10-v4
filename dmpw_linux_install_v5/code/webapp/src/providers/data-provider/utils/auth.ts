import { TAuthResponse, TJwtPayload, TSaveAuthUser } from '@types';
import { AUTH_KEY, AUTH_PERMISSION_KEY } from '@constants/constant';
import { setSecureCookie } from '@utils/cookieConfig';

export const saveAuthUser = (userData: Partial<TAuthResponse>): TSaveAuthUser => {
  const authToken = userData.authToken || '';
  const parsedToken = parseJwtPayload(authToken);
  const userId = userData.userId || 0;

  const user: TSaveAuthUser = {
    userId,
    companyCode: userData.companyCode || '',
    companyName: userData.companyName || '',
    userLanguage: userData.userLanguage || 'vi',
    userTimeZone: userData.userTimeZone || 'UTC',
    authToken: authToken,
    refreshToken: userData.refreshToken || '',
    fullName: userData.fullName || parsedToken?.fullName || '',
    accountId: userData.accountId || 0,
    accountType: userData.accountType || 0,
    expireAccessToken: userData.expireAccessToken || 0,
    companyId: parsedToken?.companyId ? Number(parsedToken.companyId) : 0,
    username: parsedToken?.username || '',
    role: userData?.role,
    passwordChangeMessage: userData?.passwordChangeMessage || '',
    passwordChangeRequired: userData?.passwordChangeRequired || false,
  };

  setSecureCookie(AUTH_KEY, JSON.stringify(user));
  setSecureCookie(AUTH_PERMISSION_KEY, JSON.stringify(userData?.permissions || []));

  return user;
};

export const parseJwtPayload = (token: string): TJwtPayload => {
  const tokenData = JSON.parse(atob(token.split('.')[1]));
  return {
    sub: tokenData.sub,
    username: tokenData?.Username,
    accountId: tokenData?.AccountId,
    companyId: tokenData?.CompanyId,
    companyCode: tokenData?.CompanyCode,
    companyName: tokenData?.CompanyName,
    fullName: tokenData?.FullName,
    accountType: tokenData?.AccountType,
    nbf: tokenData.nbf,
    exp: tokenData.exp,
    iss: tokenData.iss,
    aud: tokenData.aud,
  };
};
