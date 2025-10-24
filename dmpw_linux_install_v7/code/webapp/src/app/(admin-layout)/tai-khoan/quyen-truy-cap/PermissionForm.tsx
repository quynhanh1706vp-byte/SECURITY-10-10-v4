'use client';

import { useEffect, useState } from 'react';
import { useOne, useTranslation } from '@refinedev/core';
import { CustomFormProps, IPermissionGroup, IRole } from '@types';
import { Checkbox, Form, Input, Spin, Switch, Table, TableColumnsType, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface ExtendedPermissionGroup extends IPermissionGroup {
  all?: boolean;
}

const PermissionForm = ({ formActionType, onFinish, ...formProps }: CustomFormProps) => {
  const { translate: t } = useTranslation();
  const { initialValues, form, ...restFormProps } = formProps;
  const isEdit = formActionType === 'edit';

  const { data: initDataRole, isLoading: isLoadingInitData } = useOne<IRole>({
    resource: 'roles',
    id: 0,
    queryOptions: {
      enabled: !isEdit,
    },
  });

  const [permissionGroups, setPermissionGroups] = useState<ExtendedPermissionGroup[]>([]);

  useEffect(() => {
    if (isEdit && initialValues && form) {
      form.setFieldsValue(initialValues);
    } else if (!isEdit && initDataRole?.data && form) {
      form.setFieldsValue(initDataRole.data);
    }
  }, [initialValues, form, isEdit, initDataRole]);

  useEffect(() => {
    let groups: ExtendedPermissionGroup[] = [];

    if (isEdit && initialValues?.permissionGroups) {
      // Edit mode: sử dụng permissionGroups từ initialValues
      groups = initialValues.permissionGroups.map((group: IPermissionGroup) => ({
        ...group,
        all: group.permissions?.every((p) => p.isEnabled) || false,
      }));
    } else if (!isEdit && initDataRole?.data?.permissionGroups) {
      // Create mode: sử dụng permissionGroups từ init data
      groups = initDataRole.data.permissionGroups.map((group: IPermissionGroup) => ({
        ...group,
        all: group.permissions?.every((p) => p.isEnabled) || false,
      }));
    }

    setPermissionGroups(groups);
  }, [initialValues, isEdit, initDataRole]);

  const handlePermissionChange = (groupIndex: number, permissionIndex: number | null, checked: boolean) => {
    const newGroups = [...permissionGroups];

    if (permissionIndex === null) {
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        all: checked,
        permissions: newGroups[groupIndex].permissions.map((p) => ({
          ...p,
          isEnabled: checked,
        })),
      };
    } else {
      const updatedPermissions = [...newGroups[groupIndex].permissions];
      updatedPermissions[permissionIndex] = {
        ...updatedPermissions[permissionIndex],
        isEnabled: checked,
      };

      const allEnabled = updatedPermissions.every((p) => p.isEnabled);

      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        permissions: updatedPermissions,
        all: allEnabled,
      };
    }

    setPermissionGroups(newGroups);
  };

  const columns: TableColumnsType<ExtendedPermissionGroup> = [
    {
      title: t('roles.columns.name'),
      dataIndex: 'groupName',
      key: 'groupName',
      width: 350,
    },
    {
      title: t('roles.columns.all'),
      dataIndex: 'all',
      key: 'all',
      width: 120,
      render: (value: boolean, _, index: number) => (
        <Checkbox checked={value} onChange={(e) => handlePermissionChange(index, null, e.target.checked)} />
      ),
      className: 'text-center',
    },
    {
      title: t('roles.columns.permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: { permissionName: string; isEnabled: boolean }[], _, groupIndex: number) => (
        <div className='flex flex-col gap-2'>
          {permissions?.map((permission, permissionIndex) => (
            <div key={`permission-${groupIndex}-${permissionIndex}`} className='flex items-center gap-2'>
              <Checkbox
                checked={permission.isEnabled}
                onChange={(e) => handlePermissionChange(groupIndex, permissionIndex, e.target.checked)}
              />
              <span>{permission.permissionName}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleFinish = (values: any) => {
    const finalValues = {
      ...values,
      permissionGroups: permissionGroups,
    };

    onFinish?.(finalValues);
  };

  return (
    <Spin spinning={isLoadingInitData}>
      <Form
        {...restFormProps}
        form={form}
        layout='vertical'
        initialValues={isEdit ? initialValues : initDataRole?.data}
        onFinish={handleFinish}
      >
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-6'>
            <Form.Item
              name='roleName'
              label={
                <span>
            {t('roles.form.title.label')}
                  <Tooltip title={t('validation.maxLength', { field: t('roles.form.title.label'), max: 100 })}>
              <InfoCircleOutlined className="!ml-1" style={{ color: '#faad14' }} />
            </Tooltip>
          </span>
              }
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('validation.required', { field: t('roles.form.title.label') }),
                },
                {
                  max: 100,
                  message: t('validation.maxLength', { field: t('roles.form.title.label'), max: 100 }),
                },
              ]}
            >
              <Input placeholder={t('roles.form.title.placeholder')} />
            </Form.Item>
          </div>

          <div className='col-span-6'>
            <div className='grid grid-cols-12 gap-4'>
              <div className='col-span-6'>
                <Form.Item name='enableDepartmentLevel' label={t('roles.form.enableDepartmentLevel')}>
                  <Switch />
                </Form.Item>
              </div>

              <div className='col-span-6'>
                <Form.Item name='isDefault' label={t('roles.form.isDefault')}>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='col-span-12'>
            <Form.Item
              name='description'
              label={t('roles.form.description.label')}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('validation.required', { field: t('roles.form.description.label') }),
                },
                {
                  max: 1000,
                  message: t('validation.maxLength', { field: t('roles.form.description.label'), max: 1000 }),
                },
              ]}
            >
              <Input.TextArea placeholder={t('roles.form.description.placeholder')} />
            </Form.Item>
          </div>

          <div className='col-span-12'>
            <div>{t('roles.form.permissionList')}</div>
            <div>
              <small className='text-gray-500'>{t('roles.form.hint')}</small>
            </div>

            <div className='mt-2'>
              <Table
                dataSource={permissionGroups}
                columns={columns}
                pagination={false}
                rowKey='title'
                scroll={{ y: 350 }}
              />
            </div>
          </div>
        </div>
      </Form>
    </Spin>
  );
};

export default PermissionForm;
