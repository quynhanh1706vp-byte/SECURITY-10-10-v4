'use client';

import React, { useState } from 'react';
import Modal from '@components/ui/Modal';
import { useCustomTable, useTree } from '@hooks';
import { CanAccess, useApiUrl, useCan, useCustom, useTranslation } from '@refinedev/core';
import { Badge, Button, Input, Select, Table, TableColumnsType, Tooltip, TreeSelect, notification } from 'antd';
import { axiosInstance } from '@providers/data-provider/utils/axios';
import { filterSelectOption } from '@lib/utils';
import { $permissions } from '@constants/permmission';

const { Search } = Input;

interface IDevice {
  id: number;
  doorName: string;
  ipAddress: string;
  deviceType: number;
  buildingName: string;
  connectionStatus: number;
}

interface UpdateFirmwareModalProps {
  open: boolean;
  onClose: () => void;
  firmware: {
    id: number;
    fileName: string;
    version: string;
    deviceType: number;
  } | null;
}

export default function UpdateFirmwareModal({ open, onClose, firmware }: UpdateFirmwareModalProps) {
  const { translate: t } = useTranslation();
  const apiUrl = useApiUrl();
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<React.Key[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user has permission to update firmware
  const { data: canUpdate } = useCan({
    resource: 'firmware-version',
    action: 'edit',
    params: { authority: $permissions.UPDATE_FIRMWARE_VERSION },
  });

  const { tableProps, handleSearch, setFilters } = useCustomTable<IDevice>({
    resource: 'devices',
    queryOptions: {
      enabled: open && !!firmware,
    },
    filters: {
      permanent: [
        {
          field: 'deviceType',
          operator: 'eq',
          value: firmware?.deviceType,
        },
        {
          field: 'status',
          operator: 'eq',
          value: 0,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: 'id',
          order: 'desc',
        },
      ],
    },
    pagination: {
      pageSize: 25,
    },
  });

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const { data: devicesInit } = useCustom({
    url: 'devices/init',
    method: 'get',
  });

  const connectionStatusOptions = [
    { label: t('firmware-version.connectionStatus.inactive'), value: 0 },
    { label: t('firmware-version.connectionStatus.active'), value: 1 },
    { label: t('firmware-version.connectionStatus.warning'), value: 2 },
  ];

  const deviceTypes = devicesInit?.data?.listDeviceType || [];
  const operationTypes = devicesInit?.data?.listOperationType || [];

  const getDeviceTypeName = (deviceTypeId: number) => {
    const deviceType = deviceTypes.find((dt: any) => dt.id === deviceTypeId);
    return deviceType?.name || deviceTypeId;
  };

  const getDisabledTooltip = (connectionStatus: number) => {
    if (connectionStatus === 0) {
      return t('firmware-version.tooltips.deviceInactive');
    }
    if (connectionStatus === 2) {
      return t('firmware-version.tooltips.deviceWarning');
    }
    return '';
  };

  const handleUpdate = async () => {
    if (!firmware || selectedDeviceIds.length === 0) return;

    try {
      setIsUpdating(true);

      const response = await axiosInstance.post(`${apiUrl}/firmware-version/${firmware.id}/update-device`, {
        processIds: selectedDeviceIds,
      });

      notification.success({
        message: t('common.success'),
        description: response?.data?.message || t('firmware-version.messages.updateSuccess', { count: selectedDeviceIds.length }),
      });

      setSelectedDeviceIds([]);
      onClose();
    } catch (error: any) {
      notification.error({
        message: t('common.error'),
        description: error?.response?.data?.message || t('firmware-version.messages.updateError'),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: TableColumnsType<IDevice> = [
    {
      title: t('firmware-version.fields.building'),
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: t('firmware-version.fields.doorName'),
      dataIndex: 'doorName',
      key: 'doorName',
    },
    {
      title: t('firmware-version.fields.deviceAddress'),
      dataIndex: 'deviceAddress',
      key: 'deviceAddress',
      width: 140,
    },
    {
      title: t('firmware-version.fields.deviceType'),
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 140,
    },
    {
      title: t('firmware-version.fields.connectionStatus'),
      dataIndex: 'connectionStatus',
      key: 'connectionStatus',
      width: 180,
      render: (status) => {
        const statusMap: Record<number, { text: string; status: 'warning' | 'success' | 'error' }> = {
          0: { text: t('firmware-version.connectionStatus.inactive'), status: 'error' },
          1: { text: t('firmware-version.connectionStatus.active'), status: 'success' },
          2: { text: t('firmware-version.connectionStatus.warning'), status: 'warning' },
        };
        const statusInfo = statusMap[status] || statusMap[0];
        return <Badge status={statusInfo.status} text={statusInfo.text} />;
      },
    },
    {
      title: t('firmware-version.fields.fwVersion'),
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: t('firmware-version.fields.process'),
      dataIndex: 'process',
      key: 'process',
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t('firmware-version.titles.updateModal', {
        fileName: firmware?.fileName || '',
        deviceType: firmware?.deviceType ? getDeviceTypeName(firmware.deviceType) : ''
      })}
      width={1400}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose} disabled={isUpdating}>{t('firmware-version.actions.cancel')}</Button>
          <CanAccess resource='firmware-version' action='edit' params={{ authority: $permissions.UPDATE_FIRMWARE_VERSION }}>
            <Button
              type='primary'
              onClick={handleUpdate}
              disabled={selectedDeviceIds.length === 0}
              loading={isUpdating}
            >
              {t('firmware-version.actions.update')} ({selectedDeviceIds.length})
            </Button>
          </CanAccess>
        </div>
      }
    >
      <div className='mb-4 flex flex-wrap gap-3'>
        <Search
          placeholder={t('firmware-version.placeholders.search')}
          onChange={handleSearch}
          className='w-[260px]'
          allowClear
        />

        <TreeSelect
          treeData={treeData?.data || []}
          fieldNames={{ label: 'name', value: 'id' }}
          placeholder={t('firmware-version.placeholders.unit')}
          multiple
          showSearch
          onSearch={handleSearchBuilding}
          filterTreeNode={false}
          styles={{
            popup: { root: { maxHeight: 400, overflow: 'auto' } },
          }}
          allowClear
          treeDefaultExpandAll
          loading={isFetching}
          maxTagCount={2}
          className='!min-w-[210px]'
          onChange={(value) => setFilters([{ field: 'buildingIds', operator: 'in', value }])}
        />

        <Select
          options={connectionStatusOptions}
          placeholder={t('firmware-version.placeholders.connectionStatus')}
          mode='multiple'
          allowClear
          maxTagCount={2}
          onChange={(value) => setFilters([{ field: 'connectionStatus', operator: 'in', value }])}
          className='!min-w-[210px]'
        />

        <Select
          options={deviceTypes}
          fieldNames={{ label: 'name', value: 'id' }}
          placeholder={t('firmware-version.placeholders.deviceType')}
          mode='multiple'
          allowClear
          maxTagCount={2}
          showSearch
          filterOption={filterSelectOption}
          onChange={(value) => setFilters([{ field: 'deviceType', operator: 'in', value }])}
          className='!min-w-[210px]'
        />

        <Select
          options={operationTypes}
          fieldNames={{ label: 'name', value: 'id' }}
          placeholder={t('firmware-version.placeholders.operationMode')}
          className='!min-w-[210px]'
          allowClear
          showSearch
          filterOption={filterSelectOption}
          onChange={(value) => setFilters([{ field: 'operationType', operator: 'eq', value }])}
        />
      </div>

      <Table<IDevice>
        {...tableProps}
        rowKey='id'
        columns={columns}
        scroll={{ x: 'max-content', y: '66vh' }}
        rowSelection={
          canUpdate?.can
            ? {
                selectedRowKeys: selectedDeviceIds,
                onChange: (keys) => setSelectedDeviceIds(keys),
                getCheckboxProps: (record) => ({
                  disabled: record.connectionStatus !== 1,
                }),
                renderCell: (_checked, record, _index, originNode) => {
                  const isDisabled = record.connectionStatus !== 1;
                  const tooltip = isDisabled ? getDisabledTooltip(record.connectionStatus) : '';

                  if (isDisabled && tooltip) {
                    return <Tooltip title={tooltip}>{originNode}</Tooltip>;
                  }
                  return originNode;
                },
              }
            : undefined
        }
      />
    </Modal>
  );
}
