'use client';
import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { AuthPageProps, useLogin, useNotification, useTranslation } from '@refinedev/core';
import { LoginRequest } from '@types';
import { Button, Form, Input, Spin } from 'antd';
import { PasswordChangeForm } from './PasswordChangeModal';
import { axiosInstance, saveAuthUser } from '@providers/data-provider/utils';
import { env } from 'next-runtime-env';
import { AUTH_KEY } from '@constants/constant';
import { useRouter } from 'next/navigation';
import { getSecureCookie, setSecureCookie } from '@utils/cookieConfig';

export const AuthPage: FC<AuthPageProps> = () => {
  const [form] = Form.useForm<LoginRequest>();
  const { mutate: login, isLoading } = useLogin<LoginRequest>();
  const { translate: t } = useTranslation();
  const { open: openNotification } = useNotification();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<{ username: string } | null>(null);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user needs to change password from cookie
    const authData = getSecureCookie(AUTH_KEY);
    if (authData) {
      try {
        const user = JSON.parse(authData);
        if (user.passwordChangeRequired === true) {
          setLoginCredentials({
            username: user.username || '',
          });
          setPasswordChangeMessage(user.passwordChangeMessage || '');
          setShowPasswordChange(true);
          setIsInitializing(false);
          return; // Early return to prevent further initialization
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }

    setIsInitializing(false);
  }, [form]);

  const onFinish = async (values: LoginRequest) => {
    const { username, password } = values;
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        '/login',
        {
          username,
          password,
          enableRemoveOldSession: false,
        },
        { baseURL: env('NEXT_PUBLIC_API_ENDPOINT') },
      );

      // Save auth data
      saveAuthUser(response.data);

      if (response.data?.passwordChangeRequired) {
        setLoginCredentials({ username });
        setPasswordChangeMessage(response.data?.passwordChangeMessage || '');
        setShowPasswordChange(true);
        setIsSubmitting(false);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      openNotification?.({
        type: 'error',
        message: err?.response?.data?.message || 'Login failed',
      });
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeSuccess = async () => {
    const authData = getSecureCookie(AUTH_KEY);
    if (authData) {
      const user = JSON.parse(authData);
      user.passwordChangeRequired = false;
      user.passwordChangeMessage = '';
      setSecureCookie(AUTH_KEY, JSON.stringify(user));
    }

    window.location.href = '/';
  };

  return (
    <>
      <div className='grid h-screen grid-cols-12 overflow-hidden !bg-[#077758]'>
        <div className='relative hidden lg:col-span-8 lg:block'>
          <Image src='/images/banner.webp' alt='Vietnam Flag Tower' fill className='object-cover object-top' />
        </div>

        <div className='col-span-12 flex h-full w-full flex-col items-center bg-[url(/images/banner-1.png)] bg-cover bg-bottom bg-no-repeat lg:col-span-4'>
          <div className='mt-30 mb-6 flex items-center justify-center gap-4 pt-20'>
            <div>
              <Image src='/images/logo.png' alt='logo' width={66} height={66} />
            </div>

            <div className='text-center text-3xl font-bold text-white uppercase'>{t('common.appName')}</div>
          </div>

          <div className='mt-8 grid w-full place-items-center px-[24px] sm:px-0'>
            <div className='w-full max-w-[400px] lg:w-10/12'>
              {isInitializing ? (
                // Show loading state while checking auth status
                <div className='flex h-[300px] items-center justify-center'>
                  <Spin size='large' tip={t('common.loadingData')} />
                </div>
              ) : showPasswordChange ? (
                <PasswordChangeForm
                  passwordChangeMessage={passwordChangeMessage}
                  onSuccess={handlePasswordChangeSuccess}
                />
              ) : (
                <Form<LoginRequest>
                  layout='vertical'
                  form={form}
                  onFinish={onFinish}
                  requiredMark={false}
                  autoComplete='off'
                  initialValues={{
                    username: '',
                    password: '',
                  }}
                >
                  <Form.Item name='username' rules={[{ required: true }]}>
                    <Input
                      prefix={<UserOutlined className='!text-secondary' />}
                      size='large'
                      placeholder={t('auth.placeholder.username')}
                      autoComplete='on'
                    />
                  </Form.Item>
                  <Form.Item name='password' rules={[{ required: true }]}>
                    <Input
                      prefix={<LockOutlined className='!text-secondary' />}
                      type='password'
                      placeholder={t('auth.placeholder.password')}
                      size='large'
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                      <Button type='primary' className='px-10 font-bold' htmlType='submit' loading={isSubmitting}>
                        {t('auth.button.login')}
                      </Button>

                      <div className='text-center text-sm text-white'>
                        {/*<Link href='/forgot-password' className='text-white'>*/}
                        {/*  Quên mật khẩu*/}
                        {/*</Link>*/}
                      </div>
                    </div>
                  </Form.Item>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
