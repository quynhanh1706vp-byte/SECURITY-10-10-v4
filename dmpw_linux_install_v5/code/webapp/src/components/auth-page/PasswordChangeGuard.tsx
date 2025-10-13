'use client';

import { FC, PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetIdentity } from '@refinedev/core';

interface UserIdentity {
  passwordChangeRequired?: boolean;
  [key: string]: any;
}

export const PasswordChangeGuard: FC<PropsWithChildren> = ({ children }) => {
  const { data: identity } = useGetIdentity<UserIdentity>();
  const router = useRouter();

  useEffect(() => {
    // Nếu cần đổi mật khẩu, redirect về login
    if (identity?.passwordChangeRequired === true) {
      router.push('/login');
    }
  }, [identity, router]);

  // Nếu cần đổi mật khẩu, không render children
  if (identity?.passwordChangeRequired === true) {
    return null;
  }

  return <>{children}</>;
};