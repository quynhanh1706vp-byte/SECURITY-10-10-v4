'use client';

import React from 'react';
import { useCustomTable } from '@hooks';
import { useCustom, useTranslation } from '@refinedev/core';
import { IDevicesInit, IKhachMoi } from '@types';
import { Table } from 'antd';

type DataType = any;

export default function BangKiemSoat({ data }: { data: IKhachMoi }) {
  const { translate: t } = useTranslation();
  const { tableProps } = useCustomTable({
    resource: `visits/${data.id}/assign-doors`,
    sorters: {
      initial: [{ field: 'doorName', order: 'asc' }],
    },
  });

  const { data: devicesInit } = useCustom<IDevicesInit>({
    url: 'devices/init',
    method: 'get',
  });

  const columns = [
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.doorName'),
      dataIndex: 'doorName',
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.building'),
      dataIndex: 'building',
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.verifyMode'),
      dataIndex: 'verifyMode',
      render: (text: number) => devicesInit?.data?.lstVerifyMode.find((item) => item.id === text)?.name,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.operationType'),
      dataIndex: 'operationType',
      render: (text: number) => devicesInit?.data?.listOperationType.find((item) => item.id === text)?.name,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.accessTime'),
      dataIndex: 'accessTimeName',
    },
  ];

  return <Table<DataType> {...tableProps} columns={columns} rowSelection={undefined} scroll={{ x: 'max-content', y: '66vh' }} />;
}
