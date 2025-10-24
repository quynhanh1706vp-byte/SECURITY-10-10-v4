import { useCustomTable } from '@hooks';
import { formatDateTime } from '@lib/datetime';
import { useTranslation } from '@refinedev/core';
import { IKhachMoi } from '@types';
import { Table } from 'antd';

export default function LichSuTruyCap({ data }: { data: IKhachMoi }) {
  const { translate: t } = useTranslation();
  const { tableProps } = useCustomTable({
    resource: `visits/${data.id}/access-history`,
  });

  const columns = [
    {
      title: t('doi-tuong-ra-vao/khach-moi.approval.accessHistory.columns.accessTime'),
      dataIndex: 'accessTime',
      render: (text: string) => formatDateTime(text),
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.approval.accessHistory.columns.guestName'),
      dataIndex: 'name',
    },
  ];

  return <Table {...tableProps} columns={columns} rowSelection={undefined} scroll={{ x: 'max-content', y: '66vh' }} />;
}
