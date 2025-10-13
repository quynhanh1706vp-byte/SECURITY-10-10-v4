'use client';

import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import UserForm from '@app/(admin-layout)/tai-khoan/nguoi-dung/UserForm';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { List, useModalForm } from '@refinedev/antd';
import { useGetIdentity, useTranslation } from '@refinedev/core';
import { IAccount, IRole } from '@types';
import { Button, Input, Spin, Table, TableColumnsType } from 'antd';

const { Search } = Input;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, selectedRowKeys, handleDeleteSuccess, handleSearch } = useCustomTable<IAccount>({
    resource: 'accounts',
    sorters: {
      initial: [
        {
          field: 'email',
          order: 'desc',
        },
      ],
    },
  });

  const { data: user }: any = useGetIdentity();

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    close: closeCreateModal,
  } = useModalForm<IRole>({
    resource: 'accounts',
    action: 'create',
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    formLoading: editFormLoading,
    close: closeEditModal,
  } = useModalForm<IRole>({
    resource: 'accounts',
    action: 'edit',
  });

  const columns: TableColumnsType<IAccount> = [
    {
      title: t('accounts.list.columns.email'),
      dataIndex: 'email',
      render: (value, record) => value || record.email,
    },
    {
      title: t('accounts.list.columns.userName'),
      dataIndex: 'userName',
      render: (value, record) => value || record.userName,
    },
    {
      title: t('accounts.list.columns.role'),
      dataIndex: 'role',
    },
    {
      title: t('buttons.actions'),
      dataIndex: 'thaoTac',
      render: (_, record) => (
        <div className='flex gap-1'>
          <Button
            color='primary'
            variant='text'
            size='small'
            onClick={() => editModalShow(record.id)}
            disabled={user?.accountId === record.accountId}
          >
            {t('buttons.edit')}
          </Button>
          <DeleteButton
            resource='accounts'
            color='primary'
            variant='text'
            size='small'
            icon={null}
            recordItemId={record.id}
            onSuccess={() => handleDeleteSuccess(record.accountId)}
            disabled={user?.accountId === record.accountId}
          />
        </div>
      ),
    },
  ];

  return (
    <List
      title={t('accounts.list.title')}
      headerButtons={() => (
        <>
          <Button type='primary' onClick={() => createModalShow()}>
            {t('accounts.list.add')}
          </Button>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='accounts'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
              className='ml-auto'
            />
          )}
        </>
      )}
    >
      <div>
        <div className='flex justify-between gap-4'>
          <div className='w-[320px]'>
            <Search placeholder={t('accounts.list.search')} className='w-[264px]' onChange={handleSearch} />
          </div>
        </div>
        <Table<IAccount>
          {...tableProps}
          rowKey='id'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </div>

      <Modal
        {...createModalProps}
        width={836}
        onCancel={() => {
          closeCreateModal();
          createFormProps.form?.resetFields();
        }}
      >
        <UserForm {...createFormProps} formActionType='create' key={createModalProps.open ? 'edit' : null} />
      </Modal>

      <Modal
        {...editModalProps}
        width={836}
        confirmLoading={editFormLoading}
        onCancel={() => {
          closeEditModal();
          editFormProps.form?.resetFields();
        }}
      >
        <Spin spinning={editFormLoading}>
          <UserForm {...editFormProps} formActionType='edit' key={editModalProps.open ? 'edit' : null} />
        </Spin>
      </Modal>
    </List>
  );
}
