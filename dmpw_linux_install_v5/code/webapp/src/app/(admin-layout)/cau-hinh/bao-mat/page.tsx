'use client';

import { useEffect } from 'react';
import { useForm } from '@refinedev/antd';
import { useTranslation, useCan } from '@refinedev/core';
import { List } from '@refinedev/antd';
import { Button, Form, InputNumber, Spin, Switch, Card } from 'antd';
import { $permissions } from '@constants/permmission';

const { Item: FormItem } = Form;

interface PasswordSettings {
  changeInFirstTime: boolean;
  haveUpperCase: boolean;
  haveNumber: boolean;
  haveSpecial: boolean;
  timeNeedToChange: number;
  maximumTimeUsePassword: number;
  maximumEnterWrongPassword: number;
  timeoutWhenWrongPassword: number;
}

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canEdit } = useCan({
    resource: 'security',
    action: 'edit',
    params: { authority: $permissions.EDIT_SETTING },
  });

  const { formProps, query, formLoading } = useForm<PasswordSettings>({
    resource: 'settings/password',
    action: 'edit',
    id: '',
    queryOptions: {
      retry: 3,
    },
  });

  useEffect(() => {
    if (query?.data?.data) {
      formProps.form?.setFieldsValue(query.data.data);
    }
  }, [query?.data?.data]);

  const handleSubmit = (values: any) => {
    if (canEdit?.can) {
      formProps.onFinish?.(values);
    }
  };

  return (
    <List title={t('settings.passwordSettings.title')}>
      <Spin spinning={formLoading}>
        <Form {...formProps} layout='vertical' onFinish={handleSubmit} className='max-w-4xl'>
          <Card className='mb-6'>
            <div className='mb-4 text-lg font-medium'>{t('settings.passwordSettings.sections.passwordPolicy')}</div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>{t('settings.passwordSettings.fields.changeInFirstTime')}</span>
                <FormItem name='changeInFirstTime' valuePropName='checked' noStyle>
                  <Switch disabled={!canEdit?.can} />
                </FormItem>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>{t('settings.passwordSettings.fields.haveUpperCase')}</span>
                <FormItem name='haveUpperCase' valuePropName='checked' noStyle>
                  <Switch disabled={!canEdit?.can} />
                </FormItem>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>{t('settings.passwordSettings.fields.haveNumber')}</span>
                <FormItem name='haveNumber' valuePropName='checked' noStyle>
                  <Switch disabled={!canEdit?.can} />
                </FormItem>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>{t('settings.passwordSettings.fields.haveSpecial')}</span>
                <FormItem name='haveSpecial' valuePropName='checked' noStyle>
                  <Switch disabled={!canEdit?.can} />
                </FormItem>
              </div>
            </div>
          </Card>

          <Card className='mb-6'>
            <div className='mb-4 text-lg font-medium'>{t('settings.passwordSettings.sections.timeConfiguration')}</div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormItem
                label={t('settings.passwordSettings.fields.timeNeedToChange')}
                name='timeNeedToChange'
                rules={[{ required: true, message: t('settings.passwordSettings.validation.timeRequired') }]}
              >
                <InputNumber
                  min={1}
                  className='w-full'
                  placeholder={t('settings.passwordSettings.placeholders.enterMinutes')}
                  disabled={!canEdit?.can}
                />
              </FormItem>

              <FormItem
                label={t('settings.passwordSettings.fields.maximumTimeUsePassword')}
                name='maximumTimeUsePassword'
                rules={[{ required: true, message: t('settings.passwordSettings.validation.timeRequired') }]}
              >
                <InputNumber
                  min={1}
                  className='w-full'
                  placeholder={t('settings.passwordSettings.placeholders.enterMinutes')}
                  disabled={!canEdit?.can}
                />
              </FormItem>
            </div>
          </Card>

          <Card className='mb-6'>
            <div className='mb-4 text-lg font-medium'>{t('settings.passwordSettings.sections.loginConfiguration')}</div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormItem
                label={t('settings.passwordSettings.fields.maximumEnterWrongPassword')}
                name='maximumEnterWrongPassword'
                rules={[
                  {
                    required: true,
                    message: t('settings.passwordSettings.validation.timesRequired'),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  className='w-full'
                  placeholder={t('settings.passwordSettings.placeholders.enterTimes')}
                  disabled={!canEdit?.can}
                />
              </FormItem>

              <FormItem
                label={t('settings.passwordSettings.fields.timeoutWhenWrongPassword')}
                name='timeoutWhenWrongPassword'
                rules={[{ required: true, message: t('settings.passwordSettings.validation.timeRequired') }]}
              >
                <InputNumber
                  min={1}
                  className='w-full'
                  placeholder={t('settings.passwordSettings.placeholders.enterMinutes')}
                  disabled={!canEdit?.can}
                />
              </FormItem>
            </div>
          </Card>

          {canEdit?.can && (
            <div className='flex justify-end gap-2'>
              <Button htmlType='button' onClick={() => formProps.form?.resetFields()}>
                {t('settings.passwordSettings.buttons.cancel')}
              </Button>
              <Button type='primary' htmlType='submit' loading={formLoading}>
                {t('settings.passwordSettings.buttons.save')}
              </Button>
            </div>
          )}
        </Form>
      </Spin>
    </List>
  );
}
