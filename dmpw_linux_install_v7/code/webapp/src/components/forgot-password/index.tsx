'use client';
import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserOutlined } from '@ant-design/icons';
import { AuthPageProps, useLogin, useTranslation } from '@refinedev/core';
import { LoginRequest } from '@types';
import { Button, Form, Input, message } from 'antd';

export const ForgotPasswordPage: FC<AuthPageProps> = () => {
  const [form] = Form.useForm<LoginRequest>();
  const { translate: t } = useTranslation();

  const onFinish = async (values: any) => {};

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
              <Form<LoginRequest>
                layout='vertical'
                form={form}
                onFinish={onFinish}
                requiredMark={false}
                autoComplete='off'
              >
                <Form.Item
                  name='email'
                  rules={[
                    {
                      required: true,
                      message: t('validation.email.required'),
                    },
                    {
                      type: 'email',
                      message: t('validation.email.invalid'),
                    },
                    {
                      max: 50,
                      message: t('validation.maxLength', {
                        max: 50,
                        field: 'Email',
                      }),
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className='!text-secondary' />}
                    size='large'
                    placeholder={t('auth.forgotPassword.placeholder')}
                  />
                </Form.Item>
                <Form.Item>
                  <div className='flex flex-wrap items-center justify-between gap-4'>
                    <Button type='primary' className='px-10 font-bold' htmlType='submit'>
                      {t('auth.button.sendRequest')}
                    </Button>

                    <div className='text-center text-sm text-white'>
                      <Link href='/login' className='text-white'>
                        {t('auth.button.backToLogin')}
                      </Link>
                    </div>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
