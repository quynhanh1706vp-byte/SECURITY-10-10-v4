'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  Loading3QuartersOutlined,
  MoreOutlined,
  PoweroffOutlined,
  ToTopOutlined,
  UserOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { useCustomTable, useTree } from '@hooks';
import { formatNumber } from '@lib/utils';
import { useCustom, useCustomMutation, useTranslation } from '@refinedev/core';
import { IDevice, IDeviceInit, IDevicesInit, IWsDeviceConnection, TAccessData } from '@types';
import { Badge, Button, Dropdown, Input, Select, Table, Tabs, TreeSelect, Typography } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { eventEmitter } from '@lib/event-emitter';

import OpenDoorModal, { TOpenDoorModalRef } from './OpenDoorModal';
import RestartDoorModal, { RestartDoorModalRef } from './RestartDoorModal';
import { useModal } from '@refinedev/antd';
import Modal from '@components/ui/Modal';
import LichSuThietBi from '@app/(admin-layout)/quan-ly-ra-vao/diem-kiem-soat/LichSuThietBi';

const Column = Table.Column<IDevice>;

const getTabsItems = (t: any) => [
  {
    key: 'all',
    label: t('giam-sat/diem-kiem-soat.tabs.all'),
  },
  {
    key: '1',
    label: t('giam-sat/diem-kiem-soat.tabs.connected'),
  },
  {
    key: '2',
    label: t('giam-sat/diem-kiem-soat.tabs.warning'),
  },
];

export default function DiemKiemSoat({ refetchInterval }: { refetchInterval: number | false }) {
  const { translate: t } = useTranslation();
  const [isExpand, setIsExpand] = useState(false);
  const tabsItems = getTabsItems(t);

  const { data: accessRes } = useCustom<TAccessData>({
    url: 'dashboard/access',
    method: 'get',
    config: {
      query: {
        type: 1,
        accessDate: dayjs().startOf('day').format('DD.MM.YYYY HH:mm:ss'),
      },
    },
    queryOptions: { refetchInterval },
  });

  const accessData = accessRes?.data;

  const {
    query: { data: treeData, isFetching: isFetchingBuilding },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const { data: devicesInit } = useCustom<IDevicesInit>({
    url: 'devices/init',
    method: 'get',
  });

  const { data: deviceInit } = useCustom<IDeviceInit>({
    url: 'device-init',
    method: 'get',
  });

  const { tableProps, selectedRowKeys, setFilters, handleSearch } = useCustomTable<IDevice>({
    resource: 'devices',
    sorters: {
      initial: [{ field: 'doorName', order: 'asc' }],
    },
    queryOptions: {
      refetchInterval,
    },
  });

  const [dataSource, setDataSource] = useState<IDevice[]>([]);
  const [realTimeData, setRealTimeData] = useState<IWsDeviceConnection>();

  useEffect(() => {
    if (!tableProps.dataSource) return;

    if (!realTimeData) {
      setDataSource([...tableProps.dataSource]);
      return;
    }

    const newDataSource = tableProps.dataSource.map((item) => {
      if (!!realTimeData && item.deviceAddress === realTimeData.deviceAddress) {
        item.doorStatusId = realTimeData.doorStatusId;
      }

      return item;
    });

    setDataSource(newDataSource);
  }, [tableProps.dataSource, realTimeData]);

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

  const openDoorModalRef = useRef<TOpenDoorModalRef>(null);
  const restartDoorModalRef = useRef<RestartDoorModalRef>(null);

  const { mutate, isPending: isSyncing } = useCustomMutation();

  const handleSync = (ids: number[]) => {
    mutate({
      url: 'devices/send-device-instruction',
      method: 'post',
      values: { ids, command: 'SetTime' },
      successNotification: (data: any) => ({ type: 'success', message: data?.data?.message }),
      errorNotification: (data: any) => ({ type: 'error', message: data?.message }),
    });
  };

  const [selectedDevice, setSelectedDevice] = useState<IDevice>();
  const { modalProps: lichSuModalProps, show: showLichSu } = useModal();

  return (
    <div>
      {!isExpand && (
        <div className='mb-4 grid grid-cols-2 gap-6'>
          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/diem-kiem-soat.stats.totalPoints')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(accessData?.totalDevices)}</div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/diem-kiem-soat.stats.offlinePoints')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(accessData?.totalOfflineDevices)}</div>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-6 bg-white p-6'>
        <div className='flex items-center justify-between'>
          <div className='text-base font-medium'>{t('giam-sat/diem-kiem-soat.title')}</div>

          <Tabs
            items={tabsItems}
            defaultActiveKey='all'
            className='[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:before:hidden'
            onChange={(value) =>
              setFilters([{ field: 'connectionStatus', operator: 'eq', value: value === 'all' ? undefined : +value }])
            }
          />
        </div>

        <div className='flex gap-6'>
          <div className='flex min-w-0 flex-1 gap-6'>
            <div className='flex flex-wrap gap-3'>
              <Input.Search
                placeholder={t('giam-sat/diem-kiem-soat.placeholders.search')}
                className='w-[200px]'
                onChange={handleSearch}
              />
              <TreeSelect
                treeData={treeData?.data || []}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder={t('giam-sat/diem-kiem-soat.placeholders.unit')}
                allowClear
                showSearch
                multiple
                filterTreeNode={false}
                styles={{
                  popup: { root: { maxHeight: 400, overflow: 'auto' } },
                }}
                treeDefaultExpandAll
                loading={isFetchingBuilding}
                className='min-w-[400px]'
                onSearch={handleSearchBuilding}
                onChange={(value) => setFilters([{ field: 'buildingIds', operator: 'in', value }])}
              />
              <Select
                options={devicesInit?.data?.listOperationType}
                fieldNames={{ label: 'name', value: 'id' }}
                mode='multiple'
                placeholder={t('giam-sat/diem-kiem-soat.placeholders.operationMode')}
                allowClear
                className='min-w-[200px]'
                onChange={(value) => setFilters([{ field: 'operationType', operator: 'in', value }])}
              />
            </div>

            {selectedRowKeys.length > 0 && (
              <div className='flex gap-2'>
                <Button
                  type='primary'
                  icon={<ToTopOutlined className='-rotate-90' />}
                  onClick={() => openDoorModalRef.current?.show(selectedRowKeys as number[])}
                >
                  {t('giam-sat/diem-kiem-soat.buttons.openDoor')}
                </Button>

                <Button
                  color='primary'
                  variant='outlined'
                  icon={<PoweroffOutlined />}
                  onClick={() => restartDoorModalRef.current?.show(selectedRowKeys as number[])}
                >
                  {t('giam-sat/diem-kiem-soat.buttons.restart')}
                </Button>

                <Button
                  color='primary'
                  variant='outlined'
                  icon={<Loading3QuartersOutlined />}
                  onClick={() => handleSync(selectedRowKeys as number[])}
                  loading={isSyncing}
                >
                  {t('giam-sat/diem-kiem-soat.buttons.sync')}
                </Button>
              </div>
            )}
          </div>

          <Button
            variant='outlined'
            color='primary'
            icon={
              isExpand ? (
                <FullscreenExitOutlined className='text-[18px]' />
              ) : (
                <FullscreenOutlined className='text-[18px]' />
              )
            }
            className='ml-auto'
            onClick={() => setIsExpand(!isExpand)}
          />
        </div>

        <Table
          {...tableProps}
          dataSource={dataSource}
          scroll={{ x: 'max-content', scrollToFirstRowOnChange: true, y: '66vh' }}
        >
          <Column
            dataIndex='doorName'
            title={t('giam-sat/diem-kiem-soat.columns.accessPoint')}
            fixed
            width={300}
            render={(value) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[300px]'>
                {value}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='building'
            width={200}
            title={t('giam-sat/diem-kiem-soat.columns.unit')}
            render={(value, record) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value || record.building}
              </Typography.Text>
            )}
          />
          <Column dataIndex='operationType' title={t('giam-sat/diem-kiem-soat.columns.operationMode')} />
          <Column dataIndex='doorActiveTimeZone' title={t('giam-sat/diem-kiem-soat.columns.timeFrame')} />
          <Column
            dataIndex='doorStatus'
            title={t('giam-sat/diem-kiem-soat.columns.eventStatus')}
            render={(_, record) => {
              const doorStatus = deviceInit?.data?.doorStatus.find((item) => item.id === record.doorStatusId);

              return (
                <Badge
                  color={doorStatus?.backgroundColor ? `#${doorStatus?.backgroundColor}` : 'blue'}
                  text={doorStatus?.name}
                  className='text-nowrap'
                />
              );
            }}
          />
          <Column
            dataIndex='action'
            title={t('giam-sat/diem-kiem-soat.columns.actions')}
            render={(_, record) => (
              <div className='flex items-center gap-1'>
                <Button
                  color='primary'
                  variant='text'
                  size='small'
                  onClick={() => openDoorModalRef.current?.show([record.id])}
                >
                  {t('giam-sat/diem-kiem-soat.buttons.openDoor')}
                </Button>

                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'sync',
                        label: t('giam-sat/diem-kiem-soat.menu.sync'),
                      },
                      {
                        key: 'log',
                        label: t('giam-sat/diem-kiem-soat.menu.deviceLog'),
                      },
                      {
                        key: 'restart',
                        label: t('giam-sat/diem-kiem-soat.menu.restart'),
                      },
                    ],
                    onClick: (selectedItem) => {
                      switch (selectedItem.key) {
                        case 'sync':
                          handleSync([record.id]);
                          break;
                        case 'restart':
                          restartDoorModalRef.current?.show([record.id]);
                          break;
                        default:
                          setSelectedDevice(record);
                          showLichSu();
                          break;
                      }
                    },
                  }}
                >
                  <Button color='primary' variant='text' size='small'>
                    <MoreOutlined className='rotate-90 text-[14px]' />
                  </Button>
                </Dropdown>
              </div>
            )}
          />
        </Table>
      </div>

      <OpenDoorModal ref={openDoorModalRef} />
      <RestartDoorModal ref={restartDoorModalRef} />

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
    </div>
  );
}
