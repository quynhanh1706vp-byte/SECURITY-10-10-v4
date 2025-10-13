'use client';

import { checkAuthority, hasRoleFullAccess } from '@providers/auth-provider/auth-provider.client';
import { useResourceParams } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const CheckRoutePermission = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { action = 'list', resource } = useResourceParams();

  useEffect(() => {
    // Primary Manager has full access
    if (hasRoleFullAccess()) {
      return;
    }
    
    const permissions = resource?.meta?.authority?.[action] || [];

    if (!checkAuthority(permissions).can) {
      router.push('/403');
    }
  }, [resource]);

  return <>{children}</>;
};
