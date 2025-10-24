'use client';

import { Suspense } from 'react';
import { Authenticated } from '@refinedev/core';
import { NavigateToResource } from '@refinedev/nextjs-router';
import { useAccessibleResource } from '@hooks/useAccessibleRoute';

export default function IndexPage() {
  const accessibleResource = useAccessibleResource();

  return (
    <Suspense>
      <Authenticated key='home-page'>
        <NavigateToResource resource={accessibleResource?.name || 'dashboard'} />
      </Authenticated>
    </Suspense>
  );
}
