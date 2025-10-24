'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { PreferredSystem } from '@constants/ho-so';
import { dataProvider } from '@providers/data-provider';
import { useForm } from '@refinedev/antd';
import { useCustom, useTranslation } from '@refinedev/core';
import { IFormAccount } from '@types';
import { App, Button, Form, Input, Select, Upload, UploadProps } from 'antd';
import FormItem from 'antd/es/form/FormItem';

const getRandomColor = () => {
  const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8', '#4ade80'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function Page() {
  const { translate: translate } = useTranslation();
  const { notification } = App.useApp();
  const { formProps, mutation } = useForm({
    resource: 'accounts-profile',
    action: 'edit',
  });

  const { data: accessRes } = useCustom<IFormAccount>({
    url: 'accounts-profile',
    method: 'get',
  });
  const data = accessRes?.data;
  console.info('access', data);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(data?.avatar || null);
  const [bgColor, setBgColor] = useState<string>('');
  const [language, setLanguage] = useState<Array<any>>([]);

  useEffect(() => {
    if (!data) return;

    if (!data.avatar) {
      setBgColor(getRandomColor());
    }
    setAvatarUrl(data.avatar || '');

    if (data.allLanguage?.length) {
      const dataLanguage = data.allLanguage.map((item: any) => ({
        label: item.name,
        value: item.tag,
      }));
      setLanguage(dataLanguage);
    } else {
      setLanguage([]);
    }

    formProps.form?.setFieldsValue({
      preferredSystem: data.preferredSystem,
      language: data.language,
      timeZone: data.timeZone,
    });
  }, [data]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    formProps.form?.setFieldValue('avatar', '');
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      if (file instanceof File) {
        if (!file.type.startsWith('image/')) {
          notification.error({
            message: translate('common.error'),
            description: translate('ho-so/ho-so.image_not_allow'),
          });
          onError?.(new Error(translate('ho-so/ho-so.image_not_allow')));
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          notification.error({
            message: translate('common.error'),
            description: translate('ho-so/ho-so.image_size_error'),
          });
          onError?.(new Error(translate('ho-so/ho-so.image_size_error')));
          return;
        }

        const base64 = await convertToBase64(file);

        await dataProvider.custom({
          url: 'accounts/avatar',
          method: 'put',
          payload: {
            avatar: base64,
          },
        });

        setAvatarUrl(base64);
        onSuccess?.(base64);
        notification.success({
          message: translate('common.success'),
          description: translate('ho-so/ho-so.image_upload_success'),
        });
      }
    } catch (error) {
      setAvatarUrl('');
      const e = error as Error;
      notification.error({
        message: translate('common.error'),
        description: e?.message || translate('ho-so/ho-so.image_upload_error'),
      });
      onError?.(error as Error);
    }
  };

  const handleSubmitConfig = async (values: any, isPassword: boolean = false) => {
    formProps.onFinish?.({
      ...values,
      companyId: data?.companyId,
      role: data?.role,
      username: data?.username,
    });
  };

  const handleSubmitPassword = async (values: any) => {
    formProps.onFinish?.({
      password: values?.password,
      confirmPassword: values?.confirmPassword,
      companyId: data?.companyId,
      role: data?.role,
      username: data?.username,
    });
  };

  return (
    <div className='flex min-h-screen bg-gray-100 p-8'>
      <aside className='hidden h-fit w-75 rounded-md bg-white p-4 shadow-md md:block'>
        <div className='flex h-fit w-full flex-col items-center justify-center lg:w-auto'>
          <Upload
            listType='picture-card'
            maxCount={1}
            customRequest={handleAvatarUpload}
            onRemove={handleRemoveAvatar}
            accept='image/*'
            showUploadList={false}
            className='!m-0 !border-none !bg-transparent !p-0'
            style={{ border: 'none', background: 'transparent' }}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt='Avatar' width={128} height={128} className='rounded-full object-cover' />
            ) : (
              <div
                className='flex h-[100px] w-[100px] items-center justify-center rounded-full text-3xl font-semibold text-white select-none'
                style={{ backgroundColor: bgColor }}
              >
                {data?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </Upload>
          <h2 className='mt-4 mb-4 text-xl font-bold'>{data?.username}</h2>
        </div>
      </aside>

      <main className='ml-8 flex-1 space-y-6'>
        <section className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-lg font-semibold'>{translate('ho-so/ho-so.title.config')}</h3>
          <div className='space-y-4'>
            <div className='rounded border p-4'>
              <Form {...formProps} layout='vertical' onFinish={(values) => handleSubmitConfig(values)}>
                <div className='grid grid-cols-1'>
                  <FormItem label={translate('ho-so/ho-so.formFieldLabel.preferredSystem')} name='preferredSystem'>
                    <Select
                      options={PreferredSystem}
                      placeholder={translate('ho-so/ho-so.formFieldLabel.preferredSystem')}
                      className='min-w-[210px]'
                    />
                  </FormItem>

                  <FormItem label={translate('ho-so/ho-so.formFieldLabel.language')} name='language'>
                    <Select
                      options={language}
                      placeholder={translate('ho-so/ho-so.formFieldLabel.language')}
                      className='min-w-[210px]'
                    />
                  </FormItem>

                  <FormItem label={translate('ho-so/ho-so.formFieldLabel.timezone')} name='timeZone'>
                    <Select
                      showSearch
                      placeholder={translate('ho-so/ho-so.formFieldLabel.timezone')}
                      optionFilterProp='label'
                      options={Intl.supportedValuesOf('timeZone').map((tz) => ({
                        label: tz,
                        value: tz,
                      }))}
                      className='min-w-[210px]'
                    />
                  </FormItem>
                </div>
                <div className='flex flex-wrap justify-end gap-3'>
                  <Button type='primary' htmlType='submit' loading={mutation.isLoading}>
                    {translate('buttons.save')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-lg font-semibold'>{translate('ho-so/ho-so.title.change_password')}</h3>
          <div className='space-y-4'>
            <div className='rounded border p-4'>
              <Form {...formProps} layout='vertical' onFinish={(values) => handleSubmitPassword(values)}>
                <div className='grid grid-cols-1'>
                  <FormItem label={translate('ho-so/ho-so.formFieldLabel.password')} name='password'>
                    <Input.Password
                      placeholder={translate('ho-so/ho-so.formFieldLabel.password')}
                      className='min-w-[210px]'
                    />
                  </FormItem>

                  <FormItem label={translate('ho-so/ho-so.formFieldLabel.rePassword')} name='confirmPassword'>
                    <Input.Password
                      placeholder={translate('ho-so/ho-so.formFieldLabel.rePassword')}
                      className='min-w-[210px]'
                    />
                  </FormItem>
                </div>
                <div className='flex flex-wrap justify-end gap-3'>
                  <Button type='primary' htmlType='submit' loading={mutation.isLoading}>
                    {translate('buttons.save')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
