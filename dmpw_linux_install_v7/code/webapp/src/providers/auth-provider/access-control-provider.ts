import { AccessControlProvider } from '@refinedev/core';
import { checkAuthority, hasRoleFullAccess } from '@providers/auth-provider/auth-provider.client';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const authorityData = params?.resource?.meta?.authority;
    const checkPermission = authorityData ? authorityData[action] : params?.authority;

    if (hasRoleFullAccess()) {
      return { can: true };
    }

    return checkAuthority(checkPermission);
  },
};
