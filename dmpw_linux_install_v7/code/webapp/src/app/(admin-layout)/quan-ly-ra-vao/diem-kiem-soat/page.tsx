'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons';
import DongBoDuLieuForm from '@components/form/quan-ly-ra-vao/diem-kiem-soat/DongBoDuLieuForm';
import Modal from '@components/ui/Modal';
import { useCustomTable, useTree } from '@hooks';
import { eventEmitter } from '@lib/event-emitter';
import { EditButton, List, useModal, useModalForm } from '@refinedev/antd';
import { CanAccess, useCan, useCustom, useTranslate } from '@refinedev/core';
import { IDevice, IDevicesInit, IWsDeviceConnection, IWsProcessData } from '@types';
import { Badge, Button, Dropdown, Input, Progress, Select, Table, TreeSelect } from 'antd';

import LichSuThietBi from './LichSuThietBi';
import SaoChepCauHinhModal from './SaoChepCauHinhModal';
import TaiNhatKy from './TaiNhatKy';
import Link from 'next/link';
import { $permissions } from '@constants/permmission';

const { Column } = Table;
const { Search } = Input;

const getConnectionStatusMap = (
  t: any,
): Record<number, { label: string; value: number; status: 'default' | 'success' | 'error' }> => ({
  0: {
    label: t('quan-ly-ra-vao/diem-kiem-soat.status.inactive'),
    value: 0,
    status: 'default',
  },
  1: {
    label: t('quan-ly-ra-vao/diem-kiem-soat.status.active'),
    value: 1,
    status: 'success',
  },
  2: {
    label: t('quan-ly-ra-vao/diem-kiem-soat.status.warning'),
    value: 2,
    status: 'error',
  },
});

export default function Page() {
  const t = useTranslate();
  const connectionStatusMap = getConnectionStatusMap(t);

  const { tableProps, selectedRowKeys, handleSearch, setFilters, setSelectedRowKeys } = useCustomTable<IDevice>({
    resource: 'devices',
    sorters: {
      initial: [
        {
          field: 'doorName',
          order: 'asc',
        },
      ],
    },
  });

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const [selectedDevice, setSelectedDevice] = useState<IDevice>();
  const [processIdMap, setProcessIdMap] = useState<Record<string, string>>({});
  const [processData, setProcessData] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleProcessData = (data: IWsProcessData) => {
      setProcessData((prev) => {
        const newPercent = Math.round((data.index / data.total) * 100);
        const currentPercent = prev[data.msgId] || 0;

        return {
          ...prev,
          [data.msgId]: Math.max(newPercent, currentPercent),
        };
      });
    };

    eventEmitter.on('ws:process-data', handleProcessData);

    return () => {
      eventEmitter.off('ws:process-data', handleProcessData);
    };
  }, [processIdMap]);

  const [dataSource, setDataSource] = useState<IDevice[]>([]);
  const [realTimeData, setRealTimeData] = useState<IWsDeviceConnection>();
  /**
   * Handle device connection event from websocket
   */
  useEffect(() => {
    const handleDeviceConnection = (data: IWsDeviceConnection) => {
      setRealTimeData(data);
    };

    eventEmitter.on('ws:device-connection', handleDeviceConnection);

    return () => {
      eventEmitter.off('ws:device-connection', handleDeviceConnection);
    };
  }, []);

  useEffect(() => {
    if (!tableProps.dataSource) return;

    if (!realTimeData) {
      setDataSource([...tableProps.dataSource]);
      return;
    }

    const newDataSource = tableProps.dataSource.map((item) => {
      if (!!realTimeData && item.deviceAddress === realTimeData.deviceAddress) {
        item.connectionStatus = realTimeData.status;
        item.registerIdNumber = realTimeData.fromDbIdNumber;
      }

      return item;
    });

    setDataSource(newDataSource);
  }, [tableProps.dataSource, realTimeData]);

  const {
    modalProps: transmitDataModalProps,
    formProps: transmitDataFormProps,
    show: transmitDataModalShow,
  } = useModalForm({
    resource: 'devices/transmit-data',
    action: 'create',
    errorNotification: (error) => {
      return {
        type: 'error',
        message: error?.message || t('quan-ly-ra-vao/diem-kiem-soat.sync.error'),
      };
    },
    successNotification: (data) => {
      return {
        type: 'success',
        message: data?.data?.message || t('quan-ly-ra-vao/diem-kiem-soat.sync.success'),
      };
    },
    onMutationSuccess: (_, variables: any) => {
      const { devices } = variables as { devices: { deviceId: number; processId: string }[] };

      const newProcessIdMap = devices.reduce(
        (acc, device) => {
          acc[device.deviceId] = device.processId;
          return acc;
        },
        {} as Record<string, string>,
      );

      setProcessIdMap(newProcessIdMap);
      setSelectedRowKeys([]);
    },
  });

  const { modalProps: lichSuModalProps, show: showLichSu } = useModal();
  const { modalProps: taiNhatKyModalProps, show: showTaiNhatKy, close: closeTaiNhatKy } = useModal();
  const { modalProps: saoChepCauHinhModalProps, show: showSaoChepCauHinh, close: closeSaoChepCauHinh } = useModal();

  const { data: devicesInit } = useCustom<IDevicesInit>({
    url: 'devices/init',
    method: 'get',
  });

  const { data: canReinstall } = useCan({
    action: 'install',
    params: { authority: $permissions.REINSTALL_DEVICE_SETTING },
  });

  const { data: canCopy } = useCan({
    action: 'copy',
    params: { authority: $permissions.COPY_DEVICE_SETTING },
  });

  const { data: canHistory } = useCan({
    action: 'history',
    params: { authority: $permissions.VIEW_HISTORY_DEVICE_SETTING },
  });

  const { data: editDevice } = useCan({
    action: 'edit',
    params: { authority: $permissions.EDIT_DEVICE_SETTING },
  });
  return (
    <List
      title={t('quan-ly-ra-vao/diem-kiem-soat.title')}
      headerButtons={() => (
        <>
          {canReinstall?.can && (
            <Button
              type='primary' ghost
              icon={<ReloadOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => {
                if (selectedDevice) setSelectedDevice(undefined);
                transmitDataModalShow();
              }}
            >
              {t('quan-ly-ra-vao/diem-kiem-soat.buttons.syncData')}
            </Button>
          )}

          {
            editDevice?.can && (
              <Link href='/quan-ly-ra-vao/diem-kiem-soat/them-moi'>
                <Button type='primary'>{t('quan-ly-ra-vao/diem-kiem-soat.buttons.addDevice')}</Button>
              </Link>
            )
          }
        </>
      )}
    >
      <div className='flex flex-wrap gap-4'>
        <Search
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.placeholders.search')}
          onChange={handleSearch}
          className='w-[260px]'
        />

        <TreeSelect
          treeData={treeData?.data || []}
          fieldNames={{ label: 'name', value: 'id' }}
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.placeholders.unit')}
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
          options={devicesInit?.data?.listOperationType || []}
          fieldNames={{ label: 'name', value: 'id' }}
          mode='multiple'
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.placeholders.operationMode')}
          className='!min-w-[210px]'
          maxTagCount={2}
          allowClear
          onChange={(value) => setFilters([{ field: 'operationType', operator: 'in', value }])}
        />
        <Select
          options={Object.values(connectionStatusMap)}
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.placeholders.connectionStatus')}
          mode='multiple'
          allowClear
          maxTagCount={2}
          onChange={(value) => setFilters([{ field: 'connectionStatus', operator: 'in', value }])}
          className='!min-w-[210px]'
        />
      </div>

      <Table
        {...tableProps}
        dataSource={dataSource}
        className='mt-2.5'
        scroll={{
          x: 1500,
          y: 'calc(100vh - 380px)',
          scrollToFirstRowOnChange: true,
        }}
        rowSelection={canReinstall?.can ? tableProps.rowSelection : undefined}
      >
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.accessPointName')}
          dataIndex='doorName'
          width={180}
          fixed='left'
          render={(value, record) => (
            <div className='flex items-center gap-2'>
              {record.image && (
                <Image src={record.image} alt='image' width={32} height={32} className='size-8 shrink-0 object-cover' />
              )}
              <div className='truncate'>{value}</div>
            </div>
          )}
        />
        <Column title={t('quan-ly-ra-vao/diem-kiem-soat.columns.unit')} dataIndex='building' width={180} ellipsis />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.deviceCode')}
          dataIndex='deviceAddress'
          width={120}
          ellipsis
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.operationMode')}
          dataIndex='operationType'
          width={150}
          ellipsis
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.verificationMode')}
          dataIndex='verifyMode'
          width={150}
          ellipsis
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.timeFrame')}
          dataIndex='doorActiveTimeZone'
          width={180}
          ellipsis
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.status')}
          dataIndex='connectionStatus'
          width={180}
          render={(value: number) => (
            <Badge status={connectionStatusMap[value].status} text={connectionStatusMap[value].label} />
          )}
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.syncStatus')}
          dataIndex='connectionStatusSync'
          width={180}
          render={(_, record) => {
            const registerIdNumber = record?.registerIdNumber || 0;
            const fromDbIdNumber = record?.fromDbIdNumber || 0;
            return (
              <span>
                {registerIdNumber} / {fromDbIdNumber}
              </span>
            );
          }}
        />

        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.progress')}
          dataIndex='processId'
          width={180}
          render={(_, record) => {
            const processId = processIdMap[record.id];

            if (!processId) return;

            return <Progress percent={processData[processId]} />;
          }}
        />
        <Column
          title={t('quan-ly-ra-vao/diem-kiem-soat.columns.actions')}
          width={180}
          render={(_, record: any) => (
            <div className='flex items-center gap-1'>
              <EditButton
                color='primary'
                variant='text'
                size='small'
                icon={null}
                resource='devices'
                recordItemId={record.id}
              >
                {t('buttons.edit')}
              </EditButton>

              <Button
                color='primary'
                variant='text'
                size='small'
                onClick={() => {
                  setSelectedDevice(record);
                  transmitDataModalShow();
                }}
                hidden={canReinstall?.can === false}
              >
                {t('quan-ly-ra-vao/diem-kiem-soat.buttons.sync')}
              </Button>

              <Dropdown
                menu={{
                  items: [
                    {
                      label: t('quan-ly-ra-vao/diem-kiem-soat.menu.downloadLog'),
                      key: 'downloadLog',
                    },
                    ...(canHistory?.can
                      ? [
                          {
                            label: t('quan-ly-ra-vao/diem-kiem-soat.menu.deviceHistory'),
                            key: 'history',
                          },
                        ]
                      : []),
                    ...(canCopy?.can
                      ? [
                          {
                            label: t('quan-ly-ra-vao/diem-kiem-soat.menu.copyConfig'),
                            key: 'copyConfig',
                          },
                        ]
                      : []),
                  ],
                  onClick: ({ key }) => {
                    setSelectedDevice(record);

                    switch (key) {
                      case 'history':
                        showLichSu();
                        break;
                      case 'downloadLog':
                        showTaiNhatKy();
                        break;
                      case 'copyConfig':
                        showSaoChepCauHinh();
                        break;
                      default:
                        break;
                    }
                  },
                }}
              >
                <EllipsisOutlined className='cursor-pointer' />
              </Dropdown>
            </div>
          )}
        />
      </Table>

      <Modal
        {...transmitDataModalProps}
        width={620}
        title={
          selectedDevice
            ? `${t('quan-ly-ra-vao/diem-kiem-soat.modal.syncTitle')}: ${selectedDevice.doorName} (${selectedDevice.deviceAddress})`
            : t('quan-ly-ra-vao/diem-kiem-soat.modal.syncTitle')
        }
        okText={t('quan-ly-ra-vao/diem-kiem-soat.buttons.sync')}
        onCancel={(e) => {
          transmitDataModalProps.onCancel?.(e);
          setSelectedDevice(undefined);
          transmitDataFormProps.form?.resetFields();
        }}
      >
        <DongBoDuLieuForm
          {...transmitDataFormProps}
          ids={selectedDevice?.id ? [selectedDevice.id] : (selectedRowKeys as number[])}
          onFinish={(values) => {
            setProcessIdMap({});
            setProcessData({});

            transmitDataFormProps.onFinish?.(values);
          }}
        />
      </Modal>

      <Modal
        {...lichSuModalProps}
        width={770}
        title={`${t('quan-ly-ra-vao/diem-kiem-soat.modal.historyTitle')}: ${selectedDevice?.doorName} (${selectedDevice?.deviceAddress})`}
        centered
        cancelText={t('buttons.cancel')}
        okButtonProps={{
          hidden: true,
        }}
      >
        <LichSuThietBi id={selectedDevice?.id} />
      </Modal>

      <Modal
        {...taiNhatKyModalProps}
        width={770}
        title={`${t('quan-ly-ra-vao/diem-kiem-soat.modal.logTitle')}: ${selectedDevice?.doorName} (${selectedDevice?.deviceAddress})`}
        footer={null}
      >
        <TaiNhatKy device={selectedDevice} onClose={() => closeTaiNhatKy()} />
      </Modal>

      <SaoChepCauHinhModal
        device={selectedDevice}
        modalProps={saoChepCauHinhModalProps}
        onClose={() => closeSaoChepCauHinh()}
      />
    </List>
  );
}
