import { checkAuthority, hasRoleFullAccess } from '@providers/auth-provider/auth-provider.client';
import { useResource } from '@refinedev/core';
import { useMemo } from 'react';

export const useAccessibleResource = () => {
  const { resources } = useResource();

  return useMemo(() => {
    for (const resource of resources) {
      // Skip parent resources without list property (menu grouping only)
      if (!resource.list) {
        continue;
      }

      if (hasRoleFullAccess()) {
        return resource;
      }

      if (resource.meta && checkAuthority(resource.meta.authority?.list).can) {
        return resource;
      }
    }
    // Return dashboard as fallback if no accessible resource found
    return { name: 'dashboard' };
  }, [resources]);
};
