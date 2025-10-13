'use client';

import { FC, useEffect, useState } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation, useCustom, useNotification } from '@refinedev/core';
import { Form, Input, Button, ConfigProvider } from 'antd';
import { axiosInstance, validatePasswordWithSettings } from '@providers/data-provider/utils';
import { env } from 'next-runtime-env';

interface PasswordChangeFormProps {
  passwordChangeMessage?: string;
  onSuccess: () => void;
}

interface PasswordChangeFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

export const PasswordChangeForm: FC<PasswordChangeFormProps> = ({
  passwordChangeMessage,
  onSuccess,
}) => {
  const [form] = Form.useForm<PasswordChangeFormValues>();
  const { translate: t } = useTranslation();
  const { open: openNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [passwordSettings, setPasswordSettings] = useState<any>({});
  
  // Fetch password settings
  // Fetch password security settings
  const { data: securityData } = useCustom({
    url: 'settings/password',
    method: 'get',
  });

  useEffect(() => {
    if (securityData?.data) {
      setPasswordSettings(securityData.data);
    }
  }, [securityData]);


  const passwordValidator = (rule: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }

    if (!value) {
      return Promise.reject(new Error(t('validation.required', { field: t('accounts.form.password.label') })));
    }

    if (value) {
      return validatePasswordWithSettings(
        value,
        {
          haveUpperCase: passwordSettings?.haveUpperCase || false,
          haveNumber: passwordSettings?.haveNumber || false,
          haveSpecial: passwordSettings?.haveSpecial || false,
        },
        t
      );
    }

    return Promise.resolve();
  };

  // Generate dynamic password rules message
  const getPasswordRulesMessage = () => {
    const rules = [t('users.validation.password.minLength')];

    if (passwordSettings?.haveUpperCase) {
      rules.push(t('users.validation.password.hasUpperCase'));
    }

    if (passwordSettings?.haveNumber) {
      rules.push(t('users.validation.password.hasNumber'));
    }

    if (passwordSettings?.haveSpecial) {
      rules.push(t('users.validation.password.hasSpecial'));
    }

    return rules.join(', ');
  };

  const handlePasswordChange = async (values: PasswordChangeFormValues) => {
    setLoading(true);
    try {
      await axiosInstance.post(
        '/accounts/change-password',
        {
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        },
        {
          baseURL: env('NEXT_PUBLIC_API_ENDPOINT'),
        }
      );

      openNotification?.({
        type: 'success',
        message: t('auth.passwordChange.success', 'Password changed successfully'),
      });
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      openNotification?.({
        type: 'error',
        message: error?.response?.data?.message || t('auth.passwordChange.error', 'Failed to change password'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#028661',
          borderRadius: 0,
        },
        components: {
          Input: {
            activeBorderColor: '#028661',
            hoverBorderColor: '#028661',
            activeShadow: '0 0 0 2px rgba(2, 134, 97, 0.1)',
          },
        },
      }}
    >
      <div className="w-full">
        <div className="mb-4 p-3 bg-white/10 border border-white/30 rounded">
          <p className="text-sm text-white">
            {passwordChangeMessage || t('auth.passwordChange.securityMessage', 'You need to change your password to enhance security')}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
          autoComplete="off"
        >
          <Form.Item
            name="newPassword"
            label={<span className="text-white">{t('auth.passwordChange.newPassword', 'New Password')}</span>}
            rules={[
              { required: true, whitespace: true, message: t('auth.passwordChange.newPasswordRequired', 'Please enter new password') },
              { validator: passwordValidator, },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className='!text-secondary' />}
              placeholder={t('auth.passwordChange.newPasswordPlaceholder', 'Enter new password')}
              size="large"
            />
          </Form.Item>
          <div className='text-white/70 text-xs -mt-4 mb-4'>{getPasswordRulesMessage()}</div>

          <Form.Item
            name="confirmNewPassword"
            label={<span className="text-white">{t('auth.passwordChange.confirmPassword', 'Confirm New Password')}</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, whitespace: true, message: t('auth.passwordChange.confirmPasswordRequired', 'Please confirm your password') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordChange.passwordMismatch', 'Passwords do not match')));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className='!text-secondary' />}
              placeholder={t('auth.passwordChange.confirmPasswordPlaceholder', 'Confirm new password')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type='primary' 
              className='px-10 font-bold' 
              htmlType='submit' 
              loading={loading}
            >
              {t('auth.passwordChange.submit', 'Change Password')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  );
};
