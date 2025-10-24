import { env } from 'next-runtime-env';
import { DEFAULT_LOCALE, LOCALE_CODE_MAP } from '@i18n/config';
import { parseJwtPayload, saveAuthUser } from '@providers/data-provider/utils/auth';
import type { HttpError } from '@refinedev/core';
import axios from 'axios';
import { getSecureCookie, removeSecureCookie } from '@utils/cookieConfig';

const axiosInstance = axios.create();

const checkTokenExpiration = (token: string): number => {
  try {
    const tokenData = parseJwtPayload(token);
    const expirationTime = tokenData?.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    return Math.floor((expirationTime - currentTime) / (1000 * 60)); // Convert to minutes
  } catch {
    return 0;
  }
};

// Refresh token function
const refreshAuthToken = async () => {
  try {
    const auth = getSecureCookie('auth');
    if (!auth) {
      throw new Error('No auth token found');
    }

    const parsedAuth = JSON.parse(auth);
    const response = await axios.post(
      `${env('NEXT_PUBLIC_API_ENDPOINT')}/refreshtoken?expiredToken=${parsedAuth.authToken}&refreshToken=${parsedAuth.refreshToken}`, {},
      {
        headers: {
          Authorization: `Bearer ${parsedAuth.authToken}`,
        },
      },
    );

    const { authToken } = saveAuthUser(response?.data?.data || {});

    return authToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeSecureCookie('auth');
    throw error;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(async (request: any) => {
  const auth = getSecureCookie('auth');
  const culture = getSecureCookie('NEXT_LOCALE') || DEFAULT_LOCALE;

  if (auth) {
    const parsedUser = JSON.parse(auth);
    const minutesLeft = checkTokenExpiration(parsedUser.authToken);

    if (minutesLeft <= 5) {
      try {
        const newToken = await refreshAuthToken();
        request.headers['Authorization'] = `Bearer ${newToken}`;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    } else {
      request.headers['Authorization'] = `Bearer ${parsedUser.authToken}`;
    }
  }

  if (culture) {
    if (!request.params) {
      request.params = {};
    }
    request.params['culture'] = LOCALE_CODE_MAP[culture];
  }

  return request;
});

const getErrorMessage = () => {
  const locale = getSecureCookie('NEXT_LOCALE') || DEFAULT_LOCALE;
  return locale === 'vi' ? 'Đã xảy ra lỗi' : 'An error occurred';
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.message || getErrorMessage(),
      statusCode: error.response?.status,
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      removeSecureCookie('auth');
    }

    return Promise.reject(customError);
  },
);

export { axiosInstance };
