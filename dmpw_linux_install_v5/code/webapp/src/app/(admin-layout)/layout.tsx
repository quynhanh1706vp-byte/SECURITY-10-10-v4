import React from 'react';
import { redirect } from 'next/navigation';
import { Header } from '@components/header';
import CustomSider from '@components/ui/CustomSider';
import { PasswordChangeGuard } from '@components/auth-page/PasswordChangeGuard';
import { authProviderServer } from '@providers/auth-provider/auth-provider.server';
import { ThemedLayoutV2 } from '@refinedev/antd';
import { CheckRoutePermission } from '@components/auth-page/CheckRoutePermission';
import { WebSocketProvider } from '@providers/ws-provider';

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (!data.authenticated) {
    return redirect(data?.redirectTo || '/login');
  }

  return (
    <CheckRoutePermission>
      <WebSocketProvider>
        <ThemedLayoutV2 Sider={CustomSider} Header={Header} dashboard>
          <PasswordChangeGuard>{children}</PasswordChangeGuard>
        </ThemedLayoutV2>
      </WebSocketProvider>
    </CheckRoutePermission>
  );
}

async function getData() {
  const { authenticated, redirectTo } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
  };
}
