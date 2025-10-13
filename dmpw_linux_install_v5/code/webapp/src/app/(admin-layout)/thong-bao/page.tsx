'use client';

import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Switch, Table, TableColumnType, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCustomMutation, useUpdate } from '@refinedev/core';
import { useTranslation } from '@refinedev/core';
import { INotification } from '@types';
import DeleteButton from '@components/ui/DeleteButton';
import { List } from '@refinedev/antd';
import { useCustomTable } from '@hooks';

export default function NotificationsPage() {
  const { translate: t } = useTranslation();

  const {
    tableProps,
    setFilters,
    filters,
    sorters,
    resetTable,
    tableQuery: { refetch },
  } = useCustomTable<INotification>({
    resource: 'notifications',
    sorters: {
      permanent: [
        {
          field: '1',
          order: 'desc',
        },
      ],
    },
  });

  const { mutate: readAllMutate, isPending: isReadAllPending } = useCustomMutation();
  const { mutate: deleteAllMutate, isPending: isDeleteAllPending } = useCustomMutation();
  const { mutate: updateMutate } = useUpdate({
    resource: 'notifications',
  });

  const handleMarkAllAsRead = () => {
    readAllMutate(
      {
        method: 'put',
        url: 'read-all-notifications',
        values: {},
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleClearAllRead = () => {
    deleteAllMutate(
      {
        method: 'delete',
        url: 'delete-all-notifications',
        values: {},
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleToggleRead = (id: number, status: boolean) => {
    updateMutate({
      id,
      values: {
        status: !status,
      },
      successNotification: false,
    });
  };

  const columns: TableColumnType<INotification>[] = [
    {
      title: t('notifications-system.titles.notification'),
      dataIndex: 'transType',
      width: 200,
      render: (text: string) => (
        <Typography.Text strong className='text-base'>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: t('notifications-system.columns.content'),
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Paragraph ellipsis={{ rows: 2, tooltip: text }} className='mb-0 truncate'>
          {text}
        </Typography.Paragraph>
      ),
    },
    {
      title: t('notifications-system.columns.createdTime'),
      dataIndex: 'createdOn',
      width: 180,
      render: (date: string) => (
        <div className='text-sm'>
          <div>{dayjs(date).format('DD.MM.YYYY HH:mm:ss')}</div>
          <div className='text-xs text-gray-500 italic'>
            {t('notifications-system.dayAgo', { count: dayjs().diff(dayjs(date), 'day') })}
          </div>
        </div>
      ),
    },
    {
      title: '',
      width: 100,
      align: 'right',
      render: (_: any, record: INotification) => (
        <div className='flex items-center gap-2'>
          <Switch size='small' checked={!record.status} onChange={() => handleToggleRead(record.id, record.status)} />

          <DeleteButton
            resource='notifications'
            recordItemId={record.id}
            confirmTitle={t('notifications-system.deleteConfirm.title')}
            confirmMessage={t('notifications-system.deleteConfirm.message')}
            variant='text'
            size='small'
            hideText
            icon={<DeleteOutlined className='text-[20px] text-red-500' />}
            className='border-0 p-1 leading-0'
            isNeedConfirm={false}
            successNotification={false}
          />
        </div>
      ),
    },
  ];

  return (
    <List
      title={t('notifications-system.title')}
      headerButtons={() => (
        <div className='flex gap-3'>
          <Button
            onClick={handleMarkAllAsRead}
            loading={isReadAllPending}
            className='border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
          >
            {t('notifications-system.buttons.markAsRead')}
          </Button>

          <Button danger onClick={handleClearAllRead} loading={isDeleteAllPending}>
            {t('notifications-system.buttons.deleteRead')}
          </Button>
        </div>
      )}
    >
      <Table<INotification> {...tableProps} columns={columns} rowSelection={undefined} />
    </List>
  );
}
