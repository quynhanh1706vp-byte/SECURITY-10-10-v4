'use client';

import React, { FC, ReactNode } from 'react';
import { DevtoolsPanel, DevtoolsProvider as DevtoolsProviderBase } from '@refinedev/devtools';

export const DevtoolsProvider: FC<{ children: ReactNode }> = (props: React.PropsWithChildren) => {
  return (
    <DevtoolsProviderBase>
      {props.children}
      <DevtoolsPanel />
    </DevtoolsProviderBase>
  );
};
