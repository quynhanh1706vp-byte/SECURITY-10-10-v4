import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';
import CameraForm from '@components/form/quan-ly-ra-vao/diem-kiem-soat/CameraForm';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { useModal, useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { IDeviceReader } from '@types';
import { Button, Spin, Table, TableColumnsType } from 'antd';

import LichSuThietBi from '@/app/(admin-layout)/quan-ly-ra-vao/diem-kiem-soat/LichSuThietBi';

export default function DanhSachThietBi() {
  const { translate: t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const {
    tableProps,
    tableQuery: { refetch },
    selectedRowKeys,
    handleDeleteSuccess,
  } = useCustomTable<IDeviceReader>({
    resource: 'device-readers',
    filters: {
      permanent: [{ field: 'deviceIds', operator: 'eq', value: id }],
    },
  });

  const {
    modalProps: addCameraModalProps,
    show: showAddCamera,
    formProps: addCameraFormProps,
  } = useModalForm({
    resource: 'cameras',
    action: 'create',
    onMutationSuccess: () => {
      refetch();
    },
  });

  const {
    modalProps: editCameraModalProps,
    show: showEditCamera,
    formProps: editCameraFormProps,
    query,
  } = useModalForm({
    resource: 'cameras',
    action: 'edit',
    onMutationSuccess: () => {
      refetch();
    },
  });

  const [selectedCamera, setSelectedCamera] = useState<IDeviceReader>();

  const { show: showLichSu, close: closeLichSu, modalProps: LichSuModalProps } = useModal();

  const columns: TableColumnsType<IDeviceReader> = [
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.deviceList.columns.deviceType'),
      dataIndex: 'deviceType',
    },
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.deviceList.columns.deviceName'),
      dataIndex: 'name',
    },
    {
      title: t('quan-ly-ra-vao/diem-kiem-soat.deviceList.columns.actions'),
      render: (_, record) => {
        const { isCamera } = record;

        return (
          isCamera && (
            <div>
              <Button
                type='link'
                size='small'
                onClick={() => {
                  showEditCamera(record.cameraId);
                }}
              >
                {t('buttons.edit')}
              </Button>

              <Button
                type='link'
                size='small'
                onClick={() => {
                  setSelectedCamera(record);
                  showLichSu();
                }}
              >
                {t('quan-ly-ra-vao/diem-kiem-soat.buttons.history')}
              </Button>

              <DeleteButton
                resource='cameras'
                color='primary'
                variant='text'
                size='small'
                icon={null}
                recordItemId={record.cameraId}
                onSuccess={() => {
                  handleDeleteSuccess(record.cameraId);
                  refetch();
                }}
                className='ml-2'
              />
            </div>
          )
        );
      },
    },
  ];

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-base leading-6 font-medium'>{t('quan-ly-ra-vao/diem-kiem-soat.deviceList.title')}</h2>

        <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
          {selectedRowKeys.length > 0 && (
            <>
              <MultipleDeleteButton
                resource='cameras'
                ids={selectedRowKeys}
                onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
              />
            </>
          )}

          <Button type='primary' onClick={() => showAddCamera()}>
            {t('quan-ly-ra-vao/diem-kiem-soat.deviceList.buttons.addCamera')}
          </Button>
        </div>
      </div>

      <Table<IDeviceReader>
        {...tableProps}
        columns={columns}
        className='mt-2.5'
        rowSelection={undefined}
        scroll={{ x: 'max-content', y: '66vh' }}
      />

      <Modal {...addCameraModalProps} width={580}>
        <CameraForm {...addCameraFormProps} initialValues={{ icuId: +id }} />
      </Modal>

      <Modal {...editCameraModalProps} width={580}>
        <Spin spinning={query?.isFetching}>
          <CameraForm {...editCameraFormProps} />
        </Spin>
      </Modal>

      <Modal
        {...LichSuModalProps}
        title={`${t('quan-ly-ra-vao/diem-kiem-soat.modal.historyTitle')}: ${selectedCamera?.deviceType} (${selectedCamera?.name})`}
        width={730}
        footer={
          <Button variant='outlined' color='primary' onClick={closeLichSu}>
            {t('buttons.close')}
          </Button>
        }
      >
        <LichSuThietBi id={selectedCamera?.cameraId} isCamera open={LichSuModalProps.open} />
      </Modal>
    </div>
  );
}
