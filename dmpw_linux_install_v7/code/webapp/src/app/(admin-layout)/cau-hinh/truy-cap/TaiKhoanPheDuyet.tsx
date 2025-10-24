'use client';

import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { useModal } from '@refinedev/antd';
import { useTranslation, useUpdate } from '@refinedev/core';
import { Button, Input, Modal, Table, TableColumnsType } from 'antd';
import React from 'react';

const { Search } = Input;

type DataType = any;

export default function TaiKhoanPheDuyet() {
  const { translate: t } = useTranslation();

  const { tableProps, selectedRowKeys, handleSearch, handleDeleteSuccess } = useCustomTable<DataType>({
    resource: 'settings/visit/first-approver',
  });
  const { modalProps, show, close } = useModal();

  const columns: TableColumnsType<DataType> = [
    {
      title: t('cau-hinh/access-times.settings.visit.check-manager.columns.email'),
      dataIndex: 'email',
      width: 150,
    },
    {
      title: t('cau-hinh/access-times.settings.visit.check-manager.columns.userName'),
      dataIndex: 'userName',
      width: 150,
    },
    {
      title: t('cau-hinh/access-times.settings.visit.check-manager.columns.departmentName'),
      dataIndex: 'departmentName',
      width: 120,
    },
    {
      title: t('cau-hinh/access-times.settings.visit.check-manager.columns.position'),
      dataIndex: 'position',
      width: 120,
    },
  ];

  const {
    tableProps: accountTableProps,
    selectedRowKeys: accountSelectedRowKeys,
    setSelectedRowKeys: setAccountSelectedRowKeys,
    handleSearch: handleAccountSearch,
  } = useCustomTable<DataType>({
    resource: 'accounts',
    filters: {
      permanent: [
        {
          field: 'ignoreApprovalVisit',
          operator: 'eq',
          value: true,
        },
      ],
    },
  });

  const { mutate, isPending } = useUpdate({
    resource: 'settings/visit/first-approver',
    id: '',
    meta: {
      method: 'post',
    },
    mutationOptions: {
      onSuccess: () => {
        close();
        setAccountSelectedRowKeys([]);
      },
    },
  });

  return (
    <div>
      <div className='flex justify-between gap-4'>
        <div className='w-[320px]'>
          <Search placeholder={t('cau-hinh/access-times.accessTimes.searchPlaceholder')} onChange={handleSearch} />
        </div>

        <div className='flex gap-4'>
          <Button type='primary' onClick={show}>
            {t('cau-hinh/access-times.settings.visit.check-manager.titles.create')}
          </Button>

          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='settings/visit/first-approver'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
            />
          )}
        </div>
      </div>

      <Table {...tableProps} rowKey='accountId' columns={columns} className='mt-2.5' scroll={{ y: '66vh' }} />

      <Modal
        {...modalProps}
        title={t('settings/visit/check-manager.titles.create')}
        width={786}
        okButtonProps={{ loading: isPending }}
        cancelButtonProps={{ variant: 'outlined', color: 'primary' }}
        okText={t('buttons.save')}
        cancelText={t('buttons.cancel')}
        onCancel={() => {
          close();
          setAccountSelectedRowKeys([]);
        }}
        onOk={() =>
          mutate({
            values: accountSelectedRowKeys,
          })
        }
      >
        <div className='flex justify-between gap-4'>
          <Search
            placeholder={t('cau-hinh/access-times.accessTimes.searchPlaceholder')}
            onChange={handleAccountSearch}
            className='w-[320px]'
          />

          <Button
            type='primary'
            loading={isPending}
            onClick={() =>
              mutate({
                values: accountSelectedRowKeys,
              })
            }
          >
            {t('buttons.save')}
          </Button>
        </div>
        <Table
          {...accountTableProps}
          rowKey='accountId'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </Modal>
    </div>
  );
}
