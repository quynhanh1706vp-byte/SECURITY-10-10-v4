'use client';

import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import { UserOutlined } from '@ant-design/icons';
import DeleteButton from '@components/ui/DeleteButton';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { EditButton, List, useModal } from '@refinedev/antd';
import { CanAccess, useCan, useCustom, useTranslation } from '@refinedev/core';
import { TUser, TUserInit } from '@types';
import { Avatar, Badge, Button, Dropdown, Input, Select, Space, Table, TableColumnsType } from 'antd';
import ModalImportExcel from '@components/import/ModalImportExcel';
import { $permissions } from '@constants/permmission';
import { formatDateTime } from '@lib/datetime';

const { Search } = Input;

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canEdit } = useCan({
    resource: 'users',
    action: 'edit',
    params: { authority: $permissions.EDIT_USER },
  });

  const { data: canDelete } = useCan({
    resource: 'users',
    action: 'delete',
    params: { authority: $permissions.DELETE_USER },
  });

  const hasActionPermission = canEdit?.can || canDelete?.can;

  const {
    tableProps,
    selectedRowKeys,
    handleSearch,
    handleDeleteSuccess,
    setFilters,
    tableQuery: { refetch },
  } = useCustomTable<TUser>({
    resource: 'users',
    sorters: {
      initial: [
        {
          field: 'firstName',
          order: 'asc',
        },
      ],
    },
    filters: {
      initial: [
        {
          field: 'isValid',
          operator: 'in',
          value: [0, 1],
        },
      ],
    },
  });

  const columns: TableColumnsType<TUser> = useMemo(() => {
    return [
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.name'),
        dataIndex: 'name',
        key: 'name',
        width: 240,
        render: (_: any, record: TUser) => (
          <Space>
            <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} />
            {record?.firstName} {record?.lastName}
          </Space>
        ),
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.employeeCode'),
        dataIndex: 'userCode',
        key: 'userCode',
        width: 120,
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.department'),
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: 120,
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.workType'),
        dataIndex: 'workTypeName',
        key: 'workTypeName',
        width: 180,
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.status'),
        dataIndex: 'status',
        key: 'status',
        render: (status: number) => {
          const statusName = status === 0
            ? t('doi-tuong-ra-vao/nhan-vien.status.active')
            : t('doi-tuong-ra-vao/nhan-vien.status.inactive');

          return <Badge color={status ? 'red' : 'blue'} text={statusName} />;
        },
        width: 180,
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.effectiveDate'),
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: 180,
        render: (value) => formatDateTime(value),
      },
      {
        title: t('doi-tuong-ra-vao/nhan-vien.columns.expiredDate'),
        dataIndex: 'expiredDate',
        key: 'expiredDate',
        width: 180,
        render: (value) => formatDateTime(value),
      },
      ...(hasActionPermission
        ? [
            {
              title: t('doi-tuong-ra-vao/nhan-vien.columns.actions'),
              key: 'action',
              width: 150,
              render: (_: any, record: TUser) => (
                <div className='flex gap-1'>
                  <EditButton
                    variant='text'
                    color='primary'
                    icon={null}
                    size='small'
                    resource='users'
                    recordItemId={record.id}
                    accessControl={{ hideIfUnauthorized: true }}
                  >
                    {t('buttons.edit')}
                  </EditButton>

                  <DeleteButton
                    resource='users'
                    color='primary'
                    variant='text'
                    size='small'
                    recordItemId={record.id}
                    onSuccess={() => handleDeleteSuccess(record.id)}
                    accessControl={{ hideIfUnauthorized: true }}
                  />
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [t, hasActionPermission, handleDeleteSuccess]);

  const { data: userInitRes } = useCustom<TUserInit>({
    url: 'users/init',
    method: 'get',
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
  });

  const userInit = React.useMemo(() => userInitRes?.data, [userInitRes]);

  const { show: showImportExcel, close: closeImportExcel, modalProps: importExcelModalProps } = useModal();

  const handleStatusChange = (value: number | undefined) => {
    setFilters((prev) => [
      ...prev.filter((f) => (f as any).field !== 'isValid'),
      value === undefined
        ? { field: 'isValid', operator: 'in', value: [0, 1] }
        : { field: 'isValid', operator: 'eq', value },
    ]);
  };

  const handleImportSuccess = () => {
    refetch();
  };

  return (
    <List
      resource='users'
      title={t('doi-tuong-ra-vao/nhan-vien.title')}
      headerButtons={() => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='users'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
              className='ml-auto'
              accessControl={{ hideIfUnauthorized: true }}
            />
          )}

          <CanAccess resource='users' action='create' params={{ authority: $permissions.ADD_USER }}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'form',
                    label: (
                      <Link href='/doi-tuong-ra-vao/nhan-vien/them-nhan-vien'>
                        {t('doi-tuong-ra-vao/nhan-vien.buttons.addFromForm')}
                      </Link>
                    ),
                  },
                  {
                    key: 'excel',
                    label: t('doi-tuong-ra-vao/nhan-vien.buttons.importExcel'),
                    onClick: () => showImportExcel(),
                  },
                ],
              }}
            >
              <Button type='primary'>{t('doi-tuong-ra-vao/nhan-vien.buttons.addEmployee')}</Button>
            </Dropdown>
          </CanAccess>
        </div>
      )}
    >
      <div className='flex flex-wrap items-center gap-4 py-5'>
        <Search
          placeholder={t('doi-tuong-ra-vao/nhan-vien.placeholders.search')}
          onChange={handleSearch}
          className='w-full sm:w-[250px]'
        />

        <Select
          allowClear
          mode='multiple'
          placeholder={t('doi-tuong-ra-vao/nhan-vien.placeholders.department')}
          options={userInit?.departments}
          fieldNames={{ label: 'name', value: 'id' }}
          onChange={(values) => setFilters([{ field: 'departmentIds', operator: 'in', value: values }])}
          className='w-full sm:w-[250px]'
          maxTagCount={2}
        />

        <Select
          placeholder={t('doi-tuong-ra-vao/nhan-vien.placeholders.status')}
          onChange={handleStatusChange}
          options={userInit?.userStatus}
          fieldNames={{ label: 'name', value: 'id' }}
          allowClear
          className='w-full sm:w-[250px]'
        />
      </div>

      <Table<TUser>
        {...tableProps}
        rowSelection={canDelete?.can ? tableProps.rowSelection : undefined}
        columns={columns}
        className='mt-2.5'
        scroll={{ x: 'max-content', y: '66vh', scrollToFirstRowOnChange: true }}
      />

      <ModalImportExcel
        open={importExcelModalProps.open as boolean}
        onCancel={closeImportExcel}
        onSuccess={handleImportSuccess}
        fileName='user_example'
        importUrl='users/import'
        exampleUrl='/import/user_example.xlsx'
        type='xlsx'
        title={t('doi-tuong-ra-vao/nhan-vien.modal.importTitle')}
        width={500}
      />
    </List>
  );
}
