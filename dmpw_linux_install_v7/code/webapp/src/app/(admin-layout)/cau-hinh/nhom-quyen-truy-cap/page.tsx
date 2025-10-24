'use client';

import dynamic from 'next/dynamic';
import DeleteButton from '@components/ui/DeleteButton';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { $permissions } from '@constants/permmission';
import { useCustomTable } from '@hooks';
import { EditButton, List, useModalForm, useSelect } from '@refinedev/antd';
import { CanAccess, useCan, useTranslation } from '@refinedev/core';
import { Button, Input, Select, Table, TableColumnsType, Typography } from 'antd';

import NhomQuyenTruyCapForm from './NhomQuyenTruyCapForm';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

const Modal = dynamic(() => import('antd').then((mod) => mod.Modal), { ssr: false });

const { Search } = Input;

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canEdit } = useCan({
    resource: 'access-groups',
    action: 'edit',
    params: { authority: $permissions.EDIT_ACCESS_GROUP },
  });

  const { data: canDelete } = useCan({
    resource: 'access-groups',
    action: 'delete',
    params: { authority: $permissions.DELETE_ACCESS_GROUP },
  });

  const { data: canCreate } = useCan({
    resource: 'access-groups',
    action: 'create',
    params: { authority: $permissions.ADD_ACCESS_GROUP },
  });

  const hasActionPermission = canEdit?.can || canDelete?.can;

  const { selectProps: deviceSelectProps } = useSelect({
    resource: 'devices',
    optionLabel: 'doorName',
    optionValue: 'id',
    sorters: [
      {
        field: 'doorName',
        order: 'asc',
      },
    ],
    onSearch: (value) => [
      {
        field: 'search',
        operator: 'eq',
        value,
      },
    ],
  });

  const { selectProps: userSelectProps } = useSelect({
    resource: 'users',
    optionLabel: 'firstName',
    optionValue: 'id',
    sorters: [
      {
        field: 'firstName',
        order: 'asc',
      },
    ],
    onSearch: (value) => [
      {
        field: 'search',
        operator: 'eq',
        value,
      },
    ],
  });

  const { tableProps, selectedRowKeys, handleSearch, handleDeleteSuccess, setFilters } = useCustomTable({
    resource: 'access-groups',
  });

  const columns: TableColumnsType<any> = [
    {
      dataIndex: 'name',
      title: t('bao-cao/access-groups.accessGroups.columns.name'),
      ellipsis: true,
      render: (value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>,
      width: 300,
    },
    {
      title: t('bao-cao/access-groups.accessGroups.columns.totalUsers'),
      dataIndex: 'totalUsers',
      width: 200,
      render: (value) => {
        return <span className='text-primary'>{value}</span>;
      },
    },
    {
      title: t('bao-cao/access-groups.accessGroups.columns.totalDoors'),
      dataIndex: 'totalDoors',
      width: 200,
      render: (value) => {
        return <span className='text-primary'>{value}</span>;
      },
    },
    ...(hasActionPermission
      ? [
          {
            title: t('bao-cao/access-groups.accessGroups.columns.actions'),
            dataIndex: 'thaoTac',
            width: 200,
            align: 'right' as const,
            render: (_: any, record: any) => (
              <div className='flex justify-end gap-1'>
                <EditButton
                  resource='access-groups'
                  accessControl={{ hideIfUnauthorized: true }}
                  recordItemId={record.id}
                  icon={null}
                  color='primary'
                  variant='text'
                  size='small'
                >
                  {t('buttons.edit')}
                </EditButton>
                <DeleteButton
                  resource='access-groups'
                  accessControl={{ hideIfUnauthorized: true }}
                  color='primary'
                  variant='text'
                  size='small'
                  icon={null}
                  recordItemId={record.id}
                  onSuccess={() => handleDeleteSuccess(record.id)}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  const { formProps, modalProps, show } = useModalForm({
    resource: 'access-groups',
    action: 'create',
  });

  return (
    <List
      resource='access-groups'
      title={t('bao-cao/access-groups.accessGroups.title')}
      canCreate={canCreate?.can}
      headerButtons={() => (
        <>
          {canCreate?.can && (
            <Button type='primary' onClick={() => show()}>
              {t('bao-cao/access-groups.accessGroups.create.button')}
            </Button>
          )}
        </>
      )}
    >
      <div className='flex flex-wrap gap-2.5'>
        <Search
          placeholder={t('bao-cao/access-groups.accessGroups.placeholders.search')}
          className='w-[264px]'
          onChange={handleSearch}
        />

        <Select
          allowClear
          {...deviceSelectProps}
          placeholder={t('bao-cao/access-groups.accessGroups.placeholders.door')}
          className='!min-w-[210px]'
          mode='multiple'
          maxTagCount={2}
          onChange={(value) => setFilters([{ field: 'doorIds', operator: 'in', value }])}
        />

        <Select
          allowClear
          {...userSelectProps}
          placeholder={t('bao-cao/access-groups.accessGroups.placeholders.user')}
          className='!min-w-[210px]'
          mode='multiple'
          maxTagCount={2}
          onChange={(value) => setFilters([{ field: 'userIds', operator: 'in', value }])}
        />

        {selectedRowKeys.length > 0 && canDelete?.can && (
          <MultipleDeleteButton
            resource='access-groups'
            ids={selectedRowKeys}
            onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
            className='ml-auto'
          />
        )}
      </div>

      <Table
        {...tableProps}
        rowSelection={canDelete?.can ? tableProps.rowSelection : undefined}
        columns={columns}
        className='mt-4'
        scroll={{ y: '66vh' }}
      />

      <Modal {...modalProps} width={500}>
        <NhomQuyenTruyCapForm id='nhom-quyen-truy-cap-form' {...formProps} />
      </Modal>
    </List>
  );
}
