import Cookies from 'js-cookie';

/**
 * Secure cookie configuration utility
 * Manages cookie security settings based on environment
 */

export interface CookieOptions {
  expires?: number;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
}

/**
 * Get secure cookie options based on environment
 * - Production: secure=true (requires HTTPS)
 * - Development: secure=false (allows HTTP)
 * - Always uses sameSite='strict' for CSRF protection
 */
export const getSecureCookieOptions = (
  customOptions?: Partial<CookieOptions>
): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    expires: 30,
    path: '/',
    secure: isProduction,
    sameSite: 'strict',
    ...customOptions,
  };
};

/**
 * Set a cookie with secure options
 */
export const setSecureCookie = (
  name: string,
  value: string,
  customOptions?: Partial<CookieOptions>
): void => {
  const options = getSecureCookieOptions(customOptions);
  Cookies.set(name, value, options);
};

/**
 * Remove a cookie with matching secure options
 * Important: Must match the same options used when setting the cookie
 */
export const removeSecureCookie = (
  name: string,
  customOptions?: Partial<CookieOptions>
): void => {
  const options = getSecureCookieOptions(customOptions);
  Cookies.remove(name, options);
};

/**
 * Get a cookie value
 */
export const getSecureCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};