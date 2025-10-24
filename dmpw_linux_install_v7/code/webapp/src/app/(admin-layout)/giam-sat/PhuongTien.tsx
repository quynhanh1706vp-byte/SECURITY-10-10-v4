'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CarOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { useCustomTable } from '@hooks';
import { eventEmitter } from '@lib/event-emitter';
import { formatNumber } from '@lib/utils';
import { useCustom, useTranslation } from '@refinedev/core';
import { TVehicleData } from '@types';
import { Avatar, Button, Popover, Select, Spin, Table, Tabs, Tag, Image, Typography } from 'antd';
import clsx from 'clsx';

import { IEventLog, IEventLogReportInit } from '@/types/event-logs';
import { IVehicleEventLog } from '@/types/vehicle-eventlog';
import dayjs from 'dayjs';

const Column = Table.Column<IVehicleEventLog>;

const getTabsItems = (t: any) => [
  {
    key: 'all',
    label: t('giam-sat/phuong-tien.tabs.all'),
  },
  {
    key: '0',
    label: t('giam-sat/phuong-tien.tabs.abnormal'),
  },
  {
    key: '1',
    label: t('giam-sat/phuong-tien.tabs.employee'),
  },
  {
    key: '2',
    label: t('giam-sat/phuong-tien.tabs.guest'),
  },
];

export default function PhuongTien({ refetchInterval }: { refetchInterval: number | false }) {
  const { translate: t } = useTranslation();
  const [isExpand, setIsExpand] = useState(false);
  const tabsItems = getTabsItems(t);

  const { data: eventLogInit } = useCustom<IEventLogReportInit>({
    url: 'event-logs/report/init',
    method: 'get',
  });

  const { data: dashboardVehicle } = useCustom<TVehicleData>({
    url: 'dashboard/vehicle',
    method: 'get',
  });

  const { tableProps, setFilters, current, filters, pageSize } = useCustomTable<IVehicleEventLog>({
    resource: 'vehicle-eventlog',
    pagination: {
      pageSize: 20,
    },
    sorters: {
      initial: [{ field: 'eventTime', order: 'desc' }],
    },
    queryOptions: { refetchInterval },
  });

  const [dataSource, setDataSource] = useState<IVehicleEventLog[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!tableProps?.dataSource) return;

    setDataSource([...tableProps.dataSource]);
    setTotal(tableProps.pagination ? tableProps.pagination.total || 0 : 0);
  }, [tableProps?.dataSource]);

  const [cardData, setCardData] = useState<IVehicleEventLog[]>([]);

  const { objectType, selectedDoorIds, selectedEventType } = useMemo(() => {
    return {
      objectType: filters.find((filter) => filter.operator === 'eq' && filter.field === 'objectType')?.value,
      selectedDoorIds: filters.find((filter) => filter.operator === 'in' && filter.field === 'doorIds')?.value || [],
      selectedEventType:
        filters.find((filter) => filter.operator === 'eq' && filter.field === 'eventType')?.value || [],
    };
  }, [filters]);

  useEffect(() => {
    setCardData((prev) => {
      let newData = [...prev];

      if (selectedDoorIds.length) {
        newData = newData.filter((item) => selectedDoorIds.includes(item.icuId));
      }

      if (selectedEventType.length) {
        newData = newData.filter((item) => selectedEventType.includes(item.eventType));
      }

      if (typeof objectType === 'number') {
        newData = newData.filter((item) => item.objectType === objectType);
      }

      return newData;
    });
  }, [selectedDoorIds, selectedEventType, objectType]);

  useEffect(() => {
    const handleEventLog = (data: IVehicleEventLog) => {
      // 6: Phương tiện oto, 17xemay
      if (data.cardTypeId !== 6 && data.cardTypeId !== 17) return;

      // Filter by doorIds and eventType
      if (
        (selectedDoorIds.length && !selectedDoorIds.includes(data.icuId)) ||
        (selectedEventType.length && !selectedEventType.includes(data.eventType))
      ) {
        return;
      }

      // Lọc theo objectType 0 (Cảnh báo) và 1 (Nhân viên) và 2 (Khách)
      if (objectType === 0 && (data.userId || data.visitId)) return;
      if (objectType === 1 && !data.userId) return;
      if (objectType === 2 && !data.visitId) return;

      if (data.eventLogId) {
        setCardData((prev) => {
          const newData = [...prev];

          const index = newData.findIndex((item) => item.id === data.eventLogId);

          if (index !== -1) {
            newData[index] = data;
          } else {
            newData.unshift(data);
          }
          return newData.slice(0, pageSize);
        });

        if (current === 1) {
          setDataSource((prev) => {
            const newData = [...prev];

            const index = newData.findIndex((item) => item.id === data.eventLogId);

            if (index !== -1) {
              newData[index] = data;
            } else {
              newData.unshift(data);
              setTotal((prev) => prev + 1);
            }

            return newData.slice(0, pageSize);
          });
        }
      } else {
        setCardData((prev) => [data, ...prev].slice(0, pageSize));

        if (current === 1) {
          setDataSource((prev) => [data, ...prev].slice(0, pageSize));
          setTotal((prev) => prev + 1);
        }
      }
    };

    eventEmitter.on('ws:event-log', handleEventLog);

    return () => {
      eventEmitter.off('ws:event-log', handleEventLog);
    };
  }, [current, objectType, selectedDoorIds, selectedEventType, pageSize]);

  const tagMap: Record<number, ReactNode> = {
    0: <Tag color='error'>{t('giam-sat/phuong-tien.tags.warning')}</Tag>,
    1: <Tag color='success'>{t('giam-sat/phuong-tien.tags.employee')}</Tag>,
    2: <Tag color='warning'>{t('giam-sat/phuong-tien.tags.guest')}</Tag>,
  };

  const parseVehicleImage = (item: IVehicleEventLog) => {
    if (item.resultCheckIn) return item.resultCheckIn;

    if (!item.vehicleImage) return;

    try {
      const data = JSON.parse(item.vehicleImage);
      return data[0]?.Link;
    } catch (error) {
      return;
    }
  };

  return (
    <div>
      {!isExpand && (
        <div className='mb-4 grid grid-cols-2 gap-6 lg:grid-cols-5'>
          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/phuong-tien.stats.totalVehicles')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(dashboardVehicle?.data?.totalVehicles)}</div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/phuong-tien.stats.vehiclesIn')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(dashboardVehicle?.data?.totalVehiclesIn)}</div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/phuong-tien.stats.vehiclesOut')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(dashboardVehicle?.data?.totalVehiclesOut)}</div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/phuong-tien.stats.employeeVehicles')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(dashboardVehicle?.data?.totalVehiclesOfUser)}</div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-black/45'>{t('giam-sat/phuong-tien.stats.guestVehicles')}</div>
            <div className='text-primary flex justify-between'>
              <VerticalAlignMiddleOutlined className='text-[18px]' />

              <div className='text-2xl'>{formatNumber(dashboardVehicle?.data?.totalVehiclesOfVisit)}</div>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-6 bg-white p-6'>
        <div className='flex items-center justify-between'>
          <div className='text-base font-medium'>{t('giam-sat/phuong-tien.title')}</div>

          <Tabs
            items={tabsItems}
            className='[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:before:hidden'
            onChange={(tabKey) => {
              setFilters([
                { field: 'objectType', operator: 'eq', value: tabKey === 'all' ? undefined : Number(tabKey) },
              ]);
            }}
          />
        </div>

        <div className='flex gap-6'>
          <div className='flex gap-3'>
            <Select
              options={eventLogInit?.data?.doorList}
              fieldNames={{ label: 'name', value: 'id' }}
              optionFilterProp='name'
              mode='multiple'
              allowClear
              onChange={(value) => setFilters([{ field: 'doorIds', operator: 'in', value }])}
              placeholder={t('giam-sat/phuong-tien.placeholders.accessPoint')}
              className='min-w-[200px]'
            />
            <Select
              options={eventLogInit?.data?.eventTypeList}
              fieldNames={{ label: 'name', value: 'id' }}
              optionFilterProp='name'
              mode='multiple'
              allowClear
              onChange={(value) => setFilters([{ field: 'eventType', operator: 'in', value }])}
              placeholder={t('giam-sat/phuong-tien.placeholders.eventType')}
              className='min-w-[200px]'
            />
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
            className='ml-auto shrink-0'
            onClick={() => setIsExpand(!isExpand)}
          />
        </div>

        {cardData?.length > 0 && (
          <div
            className='grid gap-2 overflow-auto'
            style={{ gridTemplateColumns: `repeat(${cardData.length || 0}, 200px)` }}
          >
            {cardData.map((item, index) => (
              <div key={index} className={clsx('border', item.objectType === 0 ? 'border-error' : 'border-primary')}>
                <div className='py-2 text-center font-medium'>
                  <div>{item.doorName}</div>
                  <div>{item.eventTime}</div>
                </div>

                <div className='flex items-center justify-center bg-[#262626] py-2.5'>
                  <Avatar
                    src={parseVehicleImage(item)}
                    size={100}
                    shape='square'
                    icon={<CarOutlined />}
                    className={clsx('[&_img]:object-contain', {
                      'border-black bg-gray-400': !parseVehicleImage(item),
                    })}
                  />
                </div>

                <div className='space-y-2.5 p-2.5 text-center'>
                  <div className='flex justify-center'>
                    {tagMap[item.objectType]}
                    <div
                      className={clsx({
                        'text-error': item.objectType === 0,
                        'text-success': item.objectType === 1,
                        'text-warning': item.objectType === 2,
                      })}
                    >
                      {item.userName}
                    </div>
                  </div>

                  <div className='text-xs text-black/45'>
                    {t('giam-sat/phuong-tien.fields.plateNumber')}: {item.cardId}
                  </div>
                  <div className='text-xs text-black/45'>
                    {t('giam-sat/phuong-tien.fields.event')}: {item.eventDetail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Table
          {...tableProps}
          dataSource={dataSource}
          pagination={{
            ...tableProps.pagination,
            total,
          }}
          rowSelection={undefined}
          scroll={{ x: 'max-content', scrollToFirstRowOnChange: true, y: '66vh' }}
        >
          <Column
            dataIndex='vehicleImage'
            title={t('giam-sat/phuong-tien.columns.image')}
            render={(_, record) =>
              parseVehicleImage(record) && (
                <Image
                  src={parseVehicleImage(record)}
                  alt={t('giam-sat/phuong-tien.columns.image')}
                  width={80}
                  height={30}
                  className='object-contain'
                />
              )
            }
          />
          <Column
            dataIndex='unixTime'
            title={t('giam-sat/phuong-tien.columns.time')}
            render={(value) => dayjs(value * 1000).format('DD/MM/YYYY HH:mm:ss')}
          />
          <Column
            dataIndex='plateNumber'
            title={t('giam-sat/phuong-tien.columns.plateNumber')}
            render={(value, record) => <>{value || record.cardId}</>}
          />
          <Column
            dataIndex='userName'
            title={t('giam-sat/phuong-tien.columns.vehicleOwner')}
            width={150}
            render={(value) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='objectType'
            className='!min-w-[100px]'
            title={t('giam-sat/phuong-tien.columns.object')}
            render={(value) => <>{tagMap[value]}</>}
          />
          <Column
            dataIndex='doorName'
            title={t('giam-sat/phuong-tien.columns.accessPoint')}
            className='!min-w-[150px]'
            render={(value) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='building'
            title={t('giam-sat/phuong-tien.columns.unit')}
            className='!min-w-[100px]'
            render={(value, record) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value || record.building}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='eventDetail'
            title={t('giam-sat/phuong-tien.columns.eventDetails')}
            className='!min-w-[100px]'
          />
        </Table>
      </div>

      <div className='-mx-6 mt-6 -mb-6 flex justify-end bg-white p-6'>
        <Link href='/bao-cao/bao-cao-phuong-tien'>{t('giam-sat/phuong-tien.buttons.viewAll')}</Link>
      </div>
    </div>
  );
}
