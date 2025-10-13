import { forwardRef, useImperativeHandle, useState } from 'react';
import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { formatISODateTime } from '@lib/datetime';
import { useModal } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Table } from 'antd';

const Column = Table.Column;

export type LichSuKhachMoiRef = {
  show: (id: string) => void;
};

const LichSuKhachMoi = forwardRef<LichSuKhachMoiRef>((_, ref) => {
  const { translate: t } = useTranslation();
  const { modalProps, show } = useModal();

  const [id, setId] = useState<string>();

  useImperativeHandle(ref, () => ({
    show: (id: string) => {
      setId(id);
      show();
    },
  }));

  const { tableProps } = useCustomTable({
    resource: `visits/${id}/history`,
    queryOptions: {
      enabled: !!id,
    },
  });

  return (
    <Modal {...modalProps} title={t('doi-tuong-ra-vao/khach-moi.history.title')} width={650} footer={null}>
      <Table {...tableProps} rowSelection={undefined} scroll={{ y: '66vh' }}>
        <Column
          title={t('doi-tuong-ra-vao/khach-moi.history.columns.createdOn')}
          dataIndex='createdOn'
          render={(value) => formatISODateTime(value)}
          width={180}
        />
        <Column
          title={t('doi-tuong-ra-vao/khach-moi.history.columns.updatedBy')}
          dataIndex='updatedByName'
          width={180}
        />
        <Column
          title={t('doi-tuong-ra-vao/khach-moi.history.columns.oldStatus')}
          dataIndex='oldStatusString'
          width={180}
        />
        <Column
          title={t('doi-tuong-ra-vao/khach-moi.history.columns.newStatus')}
          dataIndex='newStatusString'
          width={180}
        />
        <Column title={t('doi-tuong-ra-vao/khach-moi.history.columns.notes')} dataIndex='eventDetails' width={180} />
      </Table>
    </Modal>
  );
});

LichSuKhachMoi.displayName = 'LichSuKhachMoi';

export default LichSuKhachMoi;
