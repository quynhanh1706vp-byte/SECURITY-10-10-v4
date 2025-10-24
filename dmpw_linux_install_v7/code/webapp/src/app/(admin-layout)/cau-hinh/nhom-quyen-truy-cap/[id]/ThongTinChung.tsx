import { useParams } from 'next/navigation';
import { SaveButton, useForm } from '@refinedev/antd';
import { Form, Input, Spin, Switch, Tooltip } from 'antd';
import { useTranslation } from '@refinedev/core';
import { InfoCircleOutlined } from '@ant-design/icons';
import { hasRoleFullAccess } from '@providers/auth-provider/auth-provider.client';

export default function ThongTinChung() {
  const { translate: t } = useTranslation();
  const params = useParams();
  const { id } = params as { id: string };

  const { formProps, formLoading, saveButtonProps } = useForm({
    resource: 'access-groups',
    action: 'edit',
    id,
  });

  return (
    <Spin spinning={formLoading}>
      <Form {...formProps} layout='vertical'>
        <div className='grid grid-cols-2 gap-6'>
          <Form.Item
            label={
              <span>
                {t('bao-cao/access-groups.accessGroups.form.label.name')}
                <Tooltip
                  title={t('validation.maxLength', {
                    max: 30,
                    field: t('bao-cao/access-groups.accessGroups.form.label.name'),
                  })}
                >
                  <InfoCircleOutlined style={{ color: '#faad14', marginLeft: 6 }} />
                </Tooltip>
              </span>
            }
            name='name'
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('bao-cao/access-groups.accessGroups.form.validation.nameRequired'),
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
          </Form.Item>

          {hasRoleFullAccess() && (
            <div className='flex items-center gap-6'>
              <Form.Item name='isDefault' valuePropName='checked' noStyle>
                <Switch
                  checkedChildren={t('bao-cao/access-groups.accessGroups.form.switch.on')}
                  unCheckedChildren={t('bao-cao/access-groups.accessGroups.form.switch.off')}
                />
              </Form.Item>
              {t('bao-cao/access-groups.accessGroups.form.label.isDefault')}
            </div>
          )}
        </div>

        <div className='-mx-6 flex justify-end border-t p-4'>
          <SaveButton {...saveButtonProps} />
        </div>
      </Form>
    </Spin>
  );
}
