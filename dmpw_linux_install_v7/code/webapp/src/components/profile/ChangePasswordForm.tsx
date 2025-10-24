'use client';

import { FC, useEffect, useState } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation, useCustom, useNotification, useGetIdentity, useLogout } from '@refinedev/core';
import { Form, Input, Button, Row, Col } from 'antd';
import { axiosInstance, validatePasswordWithSettings } from '@providers/data-provider/utils';
import { env } from 'next-runtime-env';
import { TSaveAuthUser } from '@types';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const ChangePasswordForm: FC = () => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const { translate: t } = useTranslation();
  const { open: openNotification } = useNotification();
  const { data: user } = useGetIdentity<TSaveAuthUser>();
  const { mutate: logout } = useLogout();
  const [loading, setLoading] = useState(false);
  const [passwordSettings, setPasswordSettings] = useState<any>({});

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

  const handlePasswordChange = async (values: ChangePasswordFormValues) => {
    setLoading(true);
    try {
      await axiosInstance.post(
        '/accounts/change-password',
        {
          username: user?.username,
          password: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        },
        {
          baseURL: env('NEXT_PUBLIC_API_ENDPOINT'),
        }
      );

      openNotification?.({
        type: 'success',
        message: t('profile.passwordChange.success', 'Password changed successfully'),
      });
      form.resetFields();

      // Logout after successful password change
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error: any) {
      openNotification?.({
        type: 'error',
        message: error?.response?.data?.message || t('profile.passwordChange.error', 'Failed to change password'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label={t('profile.passwordChange.currentPassword', 'Current Password')}
          rules={[
            { required: true, whitespace: true, message: t('profile.passwordChange.currentPasswordRequired', 'Please enter current password') },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('profile.passwordChange.currentPasswordPlaceholder', 'Enter current password')}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="newPassword"
              label={t('profile.passwordChange.newPassword', 'New Password')}
              rules={[
                { required: true, whitespace: true, message: t('profile.passwordChange.newPasswordRequired', 'Please enter new password') },
                { validator: passwordValidator },
              ]}
              extra={<span className='text-gray-500 text-xs'>{getPasswordRulesMessage()}</span>}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('profile.passwordChange.newPasswordPlaceholder', 'Enter new password')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="confirmNewPassword"
              label={t('profile.passwordChange.confirmPassword', 'Confirm New Password')}
              dependencies={['newPassword']}
              rules={[
                { required: true, whitespace: true, message: t('profile.passwordChange.confirmPasswordRequired', 'Please confirm your password') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('profile.passwordChange.passwordMismatch', 'Passwords do not match')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('profile.passwordChange.confirmPasswordPlaceholder', 'Confirm new password')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div className='flex gap-3'>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
            >
              {t('profile.passwordChange.submit', 'Change Password')}
            </Button>
            <Button
              onClick={() => form.resetFields()}
            >
              {t('profile.passwordChange.cancel', 'Cancel')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};