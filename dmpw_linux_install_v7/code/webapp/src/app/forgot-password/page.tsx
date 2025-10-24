import { redirect } from 'next/navigation';
import { ForgotPasswordPage } from '@components/forgot-password';
import { authProviderServer } from '@providers/auth-provider/auth-provider.server';

export default async function ForgotPassword() {
  const data = await getData();

  if (data.authenticated) {
    redirect(data?.redirectTo || '/');
  }

  return <ForgotPasswordPage />;
}

async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
}
