'use client';

import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import TruncatedText from '@components/ui/TruncatedText';
import { useCustomTable } from '@hooks';
import { List, useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { IRole } from '@types';
import { Button, Input, Spin, Table, TableColumnsType } from 'antd';

import PermissionForm from './PermissionForm';

const { Search } = Input;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, selectedRowKeys, handleSearch, handleDeleteSuccess } = useCustomTable<IRole>({
    resource: 'roles',
    sorters: {
      initial: [
        {
          field: 'email',
          order: 'desc',
        },
      ],
    },
  });
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    close: closeCreateModal,
  } = useModalForm<IRole>({
    resource: 'roles',
    action: 'create',
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    formLoading: editFormLoading,
    close: closeEditModal,
  } = useModalForm<IRole>({
    resource: 'roles',
    action: 'edit',
  });

  const columns: TableColumnsType<IRole> = [
    {
      title: t('roles.table.roleName'),
      dataIndex: 'roleName',
      render: (value) => (
        <TruncatedText maxWidth={300} tooltipMaxWidth={500}>
          {value}
        </TruncatedText>
      ),
    },
    {
      title: t('roles.table.description'),
      dataIndex: 'description',
      render: (value) => (
        <TruncatedText maxWidth={500} tooltipMaxWidth={600}>
          {value}
        </TruncatedText>
      ),
    },
    {
      title: t('roles.table.totalUsers'),
      dataIndex: 'userCount',
    },
    {
      title: t('buttons.actions'),
      dataIndex: 'actions',
      render: (_, record) => (
        <div className='flex gap-1'>
          <Button
            color='primary'
            variant='text'
            size='small'
            onClick={() => {
              editModalShow(record.id);
            }}
          >
            {t('buttons.edit')}
          </Button>
          <DeleteButton
            color='primary'
            variant='text'
            size='small'
            icon={null}
            resource='roles'
            recordItemId={record.id}
            onSuccess={() => handleDeleteSuccess(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <List
      title={t('roles.title')}
      headerButtons={() => (
        <>
          <Button type='primary' onClick={() => createModalShow()}>
            {t('roles.create')}
          </Button>

          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='roles'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
            />
          )}
        </>
      )}
    >
      <div>
        <div className='flex justify-between gap-4'>
          <div className='w-[320px]'>
            <Search placeholder={t('roles.search')} onChange={handleSearch} />
          </div>
        </div>
        <Table<IRole> {...tableProps} rowKey='id' columns={columns} className='mt-2.5' scroll={{ x: 'max-content', y: '66vh' }} />
      </div>

      <Modal
        {...createModalProps}
        width={1000}
        onCancel={() => {
          closeCreateModal();
          createFormProps.form?.resetFields();
        }}
      >
        <PermissionForm {...createFormProps} formActionType='create' key={createModalProps.open ? 'create' : null} />
      </Modal>

      <Modal
        {...editModalProps}
        width={1100}
        confirmLoading={editFormLoading}
        onCancel={() => {
          closeEditModal();
          editFormProps.form?.resetFields();
        }}
      >
        <Spin spinning={editFormLoading}>
          <PermissionForm {...editFormProps} formActionType='edit' key={editModalProps.open ? 'edit' : null} />
        </Spin>
      </Modal>
    </List>
  );
}
