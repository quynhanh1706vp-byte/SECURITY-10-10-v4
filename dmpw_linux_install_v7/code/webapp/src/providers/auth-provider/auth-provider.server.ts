import { cookies } from 'next/headers';
import type { AuthProvider } from '@refinedev/core';

export const authProviderServer: Pick<AuthProvider, 'check'> = {
  check: async () => {
    const cookieStore = cookies();
    const auth = cookieStore.get('auth');

    if (auth) {
      try {
        const user = JSON.parse(auth.value);
        if (user.passwordChangeRequired === true) {
          return {
            authenticated: false,
            logout: false,
            redirectTo: '/login',
          };
        }
        return {
          authenticated: true,
        };
      } catch {
        return {
          authenticated: true,
        };
      }
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: '/login',
    };
  },
};
