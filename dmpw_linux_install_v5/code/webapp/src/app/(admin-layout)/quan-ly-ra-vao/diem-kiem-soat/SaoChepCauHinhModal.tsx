import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { useCustomMutation, useTranslation } from '@refinedev/core';
import { IDevice } from '@types';
import { Input, ModalProps, Table, TableColumnsType } from 'antd';

const { Search } = Input;

type SaoChepCauHinhProps = {
  device?: IDevice;
  modalProps: ModalProps;
  onClose: () => void;
};

export default function SaoChepCauHinhModal({ device, modalProps, onClose }: SaoChepCauHinhProps) {
  const { translate: t } = useTranslation();

  const { tableProps, selectedRowKeys, handleSearch } = useCustomTable<IDevice>({
    resource: 'devices',
    filters: {
      permanent: [{ field: 'ignoreIds', operator: 'eq', value: device?.id }],
    },
    sorters: {
      initial: [{ field: 'doorName', order: 'asc' }],
    },
    queryOptions: {
      enabled: !!device,
    },
  });

  const columns: TableColumnsType<IDevice> = [
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.columns.accessPointName'),
      dataIndex: 'doorName',
    },
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.columns.unit'),
      dataIndex: 'building',
    },
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.columns.deviceCode'),
      dataIndex: 'deviceAddress',
    },
  ];

  const { mutate, isPending } = useCustomMutation();

  return (
    <Modal
      {...modalProps}
      width={770}
      title={`${t('quan-ly-ra-vao/diem-kiem-soat.modal.copyConfigTitle')}: ${device?.doorName} (${device?.deviceAddress})`}
      centered
      okText={t('quan-ly-ra-vao/diem-kiem-soat.buttons.copy')}
      cancelText={t('buttons.cancel')}
      okButtonProps={{
        loading: isPending,
        disabled: !selectedRowKeys.length,
      }}
      onOk={() => {
        mutate(
          {
            url: `devices/${device?.id}/copy-device-settings`,
            method: 'post',
            values: selectedRowKeys,
            successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
            errorNotification: (data) => ({ type: 'error', message: data?.data?.message }),
          },
          {
            onSuccess: () => {
              onClose();
            },
          },
        );
      }}
    >
      <div className='flex items-center gap-4'>
        <Search
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.placeholders.search')}
          onChange={handleSearch}
          className='w-[260px]'
        />

        {selectedRowKeys.length > 0 && (
          <div>{t('quan-ly-ra-vao/diem-kiem-soat.selectedCount', { count: selectedRowKeys.length })}</div>
        )}
      </div>

      <Table {...tableProps} columns={columns} scroll={{ y: '40vh' }} />
    </Modal>
  );
}
