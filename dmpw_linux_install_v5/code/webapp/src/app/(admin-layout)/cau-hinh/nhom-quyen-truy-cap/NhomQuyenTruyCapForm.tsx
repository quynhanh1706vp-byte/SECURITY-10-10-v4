'use client';

import { useTranslation } from '@refinedev/core';
import { Form, FormProps, Input, Switch, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { hasRoleFullAccess } from '@providers/auth-provider/auth-provider.client';

const FormItem = Form.Item;

const NhomQuyenTruyCapForm = (formProps: Omit<FormProps, 'children'>) => {
  const { translate: t } = useTranslation();
  return (
    <Form {...formProps} layout='vertical'>
      <FormItem
        label={
          <span>
            {t('bao-cao/access-groups.accessGroups.form.label.name')}
            <Tooltip title={t('validation.maxLength', {
              max: 30,
              field: t('bao-cao/access-groups.accessGroups.form.label.name'),
            })}>
              <InfoCircleOutlined style={{ color: '#faad14', marginLeft: 6 }} />
            </Tooltip>
          </span>
        }
        name='name'
        rules={[
          {
            required: true,
            whitespace: true,
            message: t('bao-cao/access-groups.accessGroups.form.validation.isDefault'),
          },
          {
            max: 30,
            message: t('validation.maxLength', {
              max: 30,
              field: t('bao-cao/access-groups.accessGroups.form.label.name'),
            }),
          },
        ]}
      >
        <Input placeholder={t('bao-cao/access-groups.accessGroups.form.placeholder.name')} />
      </FormItem>

      {hasRoleFullAccess() && (
        <div className='flex items-center gap-6'>
          <FormItem name='isDefault' valuePropName='checked' noStyle initialValue={false}>
            <Switch
              checkedChildren={t('bao-cao/access-groups.accessGroups.form.switch.on')}
              unCheckedChildren={t('bao-cao/access-groups.accessGroups.form.switch.off')}
            />
          </FormItem>
          {t('bao-cao/access-groups.accessGroups.form.label.isDefault')}
        </div>
      )}
    </Form>
  );
};

export default NhomQuyenTruyCapForm;
