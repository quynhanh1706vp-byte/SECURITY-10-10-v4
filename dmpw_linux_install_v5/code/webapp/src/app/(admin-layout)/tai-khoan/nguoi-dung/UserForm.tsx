import { validateEmail, validatePasswordWithSettings } from '@providers/data-provider/utils';
import { useSelect } from '@refinedev/antd';
import { useTranslation, useCustom } from '@refinedev/core';
import { CustomFormProps, IFormAccount } from '@types';
import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';

const UserForm = ({ formActionType, onFinish, ...formProps }: CustomFormProps) => {
  const { translate: t } = useTranslation();
  const isEdit = formActionType === 'edit';
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

  const { selectProps: roleSelectProps } = useSelect({
    resource: 'accounts/type',
    optionLabel: 'name',
    optionValue: 'id',
  });

  const handleFinish = (values: IFormAccount) => {
    const finalValues = {
      ...values,
      companyId: 0,
    };

    if (isEdit && values.password === '') {
      finalValues.password = null;
    }

    if (!isEdit || values.password) {
      finalValues.confirmPassword = values.password;
    }

    onFinish?.(finalValues);
  };

  const passwordValidator = (rule: any, value: string) => {
    if (isEdit && !value) {
      return Promise.resolve();
    }

    if (!isEdit && !value) {
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
        t,
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

  const rules = {
    email: [
      {
        validator: (rule: any, value: string) => validateEmail(rule, value, t),
        required: true,
        whitespace: true,
      },
    ],
    password: [
      {
        validator: passwordValidator,
      },
    ],
    role: [
      {
        required: true,
        message: t('validation.required', { field: t('accounts.form.role.label') }),
      },
    ],
  };

  return (
    <Form {...formProps} layout='vertical' onFinish={handleFinish}>
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-6'>
          <Form.Item name='username' label={t('accounts.form.username.label')} rules={rules.email}>
            <Input placeholder={t('accounts.form.username.placeholder')} disabled={isEdit} />
          </Form.Item>
        </div>

        <div className='col-span-6'>
          <Form.Item
            name='password'
            className='mb-1'
            label={isEdit ? t('accounts.form.newPassword.label') : t('accounts.form.password.label')}
            rules={rules.password}
          >
            <Input.Password
              placeholder={
                isEdit ? t('accounts.form.newPassword.placeholder') : t('accounts.form.password.placeholder')
              }
            />
          </Form.Item>
          <div className='text-xs text-black/45'>{getPasswordRulesMessage()}</div>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12'>
          <Form.Item name='role' label={t('accounts.form.role.label')} rules={rules.role}>
            <Select {...roleSelectProps} placeholder={t('accounts.form.role.placeholder')} />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default UserForm;
