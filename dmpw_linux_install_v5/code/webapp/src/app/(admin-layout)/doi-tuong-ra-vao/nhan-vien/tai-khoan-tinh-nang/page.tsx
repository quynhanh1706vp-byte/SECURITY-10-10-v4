'use client';

import { DeleteButton, useTable } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Button, Table, TableProps } from 'antd';

type DataType = any;

const rowSelection: TableProps<DataType>['rowSelection'] = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
};

export default function DinhDanhTable() {
  const { translate: t } = useTranslation();
  const columns = [
    {
      title: t('doi-tuong-ra-vao/nhan-vien.accountFeatures.columns.accountName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('doi-tuong-ra-vao/nhan-vien.accountFeatures.columns.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('doi-tuong-ra-vao/nhan-vien.accountFeatures.columns.permissions'),
      dataIndex: 'phanQuyen',
      key: 'phanQuyen',
    },
    {
      title: t('doi-tuong-ra-vao/nhan-vien.accountFeatures.columns.actions'),
      dataIndex: 'thaoTac',
      render: (_: any, record: any) => (
        <div className='flex gap-1'>
          <Button color='primary' variant='text' size='small'>
            {t('buttons.edit')}
          </Button>

          <DeleteButton
            color='primary'
            variant='text'
            size='small'
            icon={null}
            recordItemId={record.id}
            successNotification={{
              description: t('common.success'),
              message: t('doi-tuong-ra-vao/nhan-vien.accountFeatures.deleteSuccess', { name: record.licensePlate }),
              type: 'success',
            }}
          />
        </div>
      ),
    },
  ];

  const { tableProps, current, setCurrent } = useTable<DataType>({
    resource: 'doi-tuong-ra-vao/them-nhan-vien/tai-khoan-tinh-nang',
  });

  return (
    <div>
      <Table<DataType>
        {...tableProps}
        rowKey='id'
        columns={columns}
        className='mt-2.5'
        rowSelection={rowSelection}
        showSorterTooltip={false}
        scroll={{ x: 'max-content', y: '66vh' }}
      />
    </div>
  );
}
