'use client';

import React, { useState } from 'react';
import FirmwareUploadForm from '@components/form/firmware/FirmwareUploadForm';
import UpdateFirmwareModal from '@components/modal/firmware/UpdateFirmwareModal';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { List, useModalForm } from '@refinedev/antd';
import { CanAccess, useApiUrl, useCustom, useTranslation } from '@refinedev/core';
import { Button, Select, Table, TableColumnsType, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { formatDateTime } from '@lib/datetime';
import { axiosInstance } from '@providers/data-provider/utils/axios';
import { filterSelectOption } from '@lib/utils';
import { $permissions } from '@constants/permmission';

interface IFirmware {
  id: number;
  fileName: string;
  version: string;
  deviceType: number;
  note: string;
  linkFile: string;
  createdOn: string;
}

export default function Page() {
  const { translate: t } = useTranslation();
  const apiUrl = useApiUrl();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState<IFirmware | null>(null);

  const { tableProps, selectedRowKeys, handleDeleteSuccess, setFilters } = useCustomTable<IFirmware>({
    resource: 'firmware-version',
    sorters: {
      initial: [
        {
          field: 'createdOn',
          order: 'desc',
        },
      ],
    },
  });

  // Fetch device types on page load
  const { data: initData } = useCustom({
    url: 'devices/init',
    method: 'get',
  });

  const deviceTypes = initData?.data?.listDeviceType || [];

  const {
    modalProps: uploadModalProps,
    formProps: uploadFormProps,
    show: showUploadModal,
    close: closeUploadModal,
  } = useModalForm({
    resource: 'firmware-version',
    action: 'create',
  });

  // Map deviceType id to name
  const getDeviceTypeName = (deviceTypeId: number) => {
    const deviceType = deviceTypes.find((dt: any) => dt.id === deviceTypeId);
    return deviceType?.name || deviceTypeId;
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      setDownloadingId(id);

      const response = await axiosInstance.get(`${apiUrl}/firmware-version/download?fileName=${fileName}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      notification.error({
        message: t('common.error'),
        description: error?.response?.data?.message || `Không thể tải xuống ${fileName}. Vui lòng thử lại.`,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: TableColumnsType<IFirmware> = [
    {
      title: t('firmware-version.fields.fileName'),
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: t('firmware-version.fields.version'),
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: t('firmware-version.fields.deviceType'),
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (value) => getDeviceTypeName(value),
    },
    {
      title: t('firmware-version.fields.note'),
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: t('firmware-version.fields.createdOn'),
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 180,
      render: (value) => formatDateTime(value),
    },
    {
      title: t('buttons.actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className='flex gap-1 items-center'>
          <Button
            type='link'
            size='small'
            onClick={() => handleDownload(record.id, record.fileName)}
            loading={downloadingId === record.id}
            disabled={downloadingId !== null && downloadingId !== record.id}
          >
            {t('firmware-version.actions.download')}
          </Button>
          <CanAccess resource='firmware-version' action='edit' params={{ authority: $permissions.UPDATE_FIRMWARE_VERSION }}>
            <Button
              color='primary'
              variant='text'
              size='small'
              onClick={() => {
                setSelectedFirmware(record);
                setUpdateModalOpen(true);
              }}
            >
              {t('firmware-version.actions.update')}
            </Button>
          </CanAccess>
          <CanAccess resource='firmware-version' action='delete' params={{ authority: $permissions.DELETE_FIRMWARE_VERSION }}>
            <MultipleDeleteButton
              type='link'
              icon={null}
              resource='firmware-version'
              ids={[record.id]}
              confirmMessage={t('firmware-version.deleteConfirm.message')}
              onSuccess={() => handleDeleteSuccess(record.id)}
            />
          </CanAccess>
        </div>
      ),
    },
  ];
  return (
    <List
      title={t('firmware-version.titles.list')}
      headerButtons={() => (
        <>
          <CanAccess resource='firmware-version' action='create' params={{ authority: $permissions.ADD_FIRMWARE_VERSION }}>
            <Button type='primary' icon={<UploadOutlined />} onClick={() => showUploadModal()}>
              {t('firmware-version.actions.upload')}
            </Button>
          </CanAccess>
          {selectedRowKeys.length > 0 && (
            <CanAccess resource='firmware-version' action='delete' params={{ authority: $permissions.DELETE_FIRMWARE_VERSION }}>
              <MultipleDeleteButton
                resource='firmware-version'
                ids={selectedRowKeys}
                onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
                className='ml-auto'
              />
            </CanAccess>
          )}
        </>
      )}
    >
      <div>
        <div className='mb-4 flex justify-between gap-4'>
          <Select
            mode='multiple'
            maxTagCount={2}
            options={deviceTypes}
            fieldNames={{ label: 'name', value: 'id' }}
            placeholder={t('firmware-version.placeholders.deviceType')}
            className='min-w-[300px] !max-w-[400px]'
            allowClear
            showSearch
            onChange={(value) => {
              setFilters([{ field: 'deviceTypes', operator: 'eq', value }]);
            }}
            filterOption={filterSelectOption}
          />
        </div>
        <Table<IFirmware> {...tableProps} rowKey='id' columns={columns} scroll={{ x: 'max-content', y: '66vh' }} />
      </div>
      <Modal
        {...uploadModalProps}
        title={t('firmware-version.titles.create')}
        width={600}
        onCancel={() => {
          closeUploadModal();
          uploadFormProps.form?.resetFields();
        }}
        onOk={() => uploadFormProps.form?.submit()}
      >
        <FirmwareUploadForm {...uploadFormProps} deviceTypes={deviceTypes} onSuccess={closeUploadModal} />
      </Modal>

      <UpdateFirmwareModal
        open={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedFirmware(null);
        }}
        firmware={selectedFirmware}
      />
    </List>
  );
}
