'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  UserOutlined,
  VerticalAlignMiddleOutlined,
  WeiboOutlined,
} from '@ant-design/icons';
import { useCustomTable } from '@hooks';
import { eventEmitter } from '@lib/event-emitter';
import { formatNumber } from '@lib/utils';
import { NumberField } from '@refinedev/antd';
import { useCustom, useTranslation } from '@refinedev/core';
import { Avatar, Button, Select, Table, Tabs, Tag, Image, Typography } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { TAccessData } from '@/types/dashboard';
import { IEventLog, IEventLogReportInit } from '@/types/event-logs';

const Column = Table.Column<IEventLog>;

const getTabsItems = (t: any) => [
  {
    key: 'all',
    label: t('giam-sat/truy-cap.tabs.all'),
  },
  {
    key: '0',
    label: t('giam-sat/truy-cap.tabs.abnormal'),
  },
  // {
  //   key: 'canh-bao-phong-ban',
  //   label: t('giam-sat/truy-cap.tabs.department'),
  // },
  {
    key: '1',
    label: t('giam-sat/truy-cap.tabs.employee'),
  },
  {
    key: '2',
    label: t('giam-sat/truy-cap.tabs.guest'),
  },
];

export default function TruyCap({ refetchInterval }: { refetchInterval: number | false }) {
  const { translate: t } = useTranslation();
  const [isExpand, setIsExpand] = useState(false);
  const tabsItems = getTabsItems(t);

  const { data: eventLogsInit } = useCustom<IEventLogReportInit>({
    url: 'event-logs/report/init',
    method: 'get',
  });

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

  const tagMap: Record<string, ReactNode> = {
    0: <Tag color='error'>{t('giam-sat/truy-cap.tags.warning')}</Tag>,
    1: <Tag color='success'>{t('giam-sat/truy-cap.tags.employee')}</Tag>,
    2: <Tag color='warning'>{t('giam-sat/truy-cap.tags.guest')}</Tag>,
  };

  const { tableProps, setFilters, current, filters, pageSize } = useCustomTable<IEventLog>({
    resource: 'event-logs',
    pagination: {
      pageSize: 20,
    },
    sorters: {
      initial: [{ field: 'accessTime', order: 'desc' }],
    },
    queryOptions: { refetchInterval },
  });

  const [dataSource, setDataSource] = useState<IEventLog[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!tableProps?.dataSource) return;

    setDataSource([...tableProps.dataSource]);
    setTotal(tableProps.pagination ? tableProps.pagination.total || 0 : 0);
  }, [tableProps?.dataSource]);

  const [cardData, setCardData] = useState<IEventLog[]>([]);

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
  }, [selectedDoorIds, selectedEventType]);

  useEffect(() => {
    const handleEventLog = (data: IEventLog) => {
      // filter by doorIds and eventType
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
  }, [current, selectedDoorIds, selectedEventType, pageSize]);

  return (
    <div>
      {!isExpand && (
        <div className='mb-4 grid grid-cols-2 gap-6 lg:grid-cols-4'>
          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-sm text-black/45 sm:text-base'>{t('giam-sat/truy-cap.stats.todayAccess')}</div>
            <div className='text-primary mt-2 flex items-center justify-between'>
              <VerticalAlignMiddleOutlined className='text-[16px] sm:text-[18px]' />
              <NumberField value={accessData?.totalAccessEvents || 0} className='text-xl text-inherit sm:text-2xl' />
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-sm text-black/45 sm:text-base'>{t('giam-sat/truy-cap.stats.employeeInOut')}</div>
            <div className='text-primary mt-2 flex items-center justify-between'>
              <UserOutlined className='text-[16px] sm:text-[18px]' />
              <div className='text-xl sm:text-2xl'>
                {`${formatNumber(accessData?.totalUsers)}/${formatNumber(accessData?.totalUsersIn)}/${formatNumber(
                  accessData?.totalUsersOut,
                )}`}
              </div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-sm text-black/45 sm:text-base'>{t('giam-sat/truy-cap.stats.guestInOut')}</div>
            <div className='text-primary mt-2 flex items-center justify-between'>
              <UserOutlined className='text-[16px] sm:text-[18px]' />
              <div className='text-xl sm:text-2xl'>
                {`${formatNumber(accessData?.totalVisits)}/${formatNumber(accessData?.totalVisitsIn)}/${formatNumber(
                  accessData?.totalVisitsOut,
                )}`}
              </div>
            </div>
          </div>

          <div className='border-primary rounded-[10px] border bg-white p-6'>
            <div className='text-sm text-black/45 sm:text-base'>{t('giam-sat/truy-cap.stats.abnormalEvents')}</div>
            <div className='text-primary mt-2 flex items-center justify-between'>
              <WeiboOutlined className='text-error text-[16px] sm:text-[18px]' />
              <div className='text-xl sm:text-2xl'>{formatNumber(accessData?.totalAbnormalEvents)}</div>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-6 bg-white p-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          <div className='text-base font-medium'>{t('giam-sat/truy-cap.title')}</div>

          <div className='w-full overflow-x-auto sm:w-auto'>
            <Tabs
              items={tabsItems}
              className='[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:flex-nowrap [&_.ant-tabs-nav]:overflow-x-auto [&_.ant-tabs-nav]:before:hidden [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:gap-x-4 [&_.ant-tabs-tab]:whitespace-nowrap'
              onChange={(tabKey) => {
                setFilters([
                  { field: 'objectType', operator: 'eq', value: tabKey === 'all' ? undefined : Number(tabKey) },
                ]);
              }}
            />
          </div>
        </div>

        <div className='flex gap-3'>
          <div className='flex min-w-0 flex-1 flex-wrap gap-3'>
            <Select
              options={eventLogsInit?.data?.doorList}
              fieldNames={{ label: 'name', value: 'id' }}
              optionFilterProp='name'
              placeholder={t('giam-sat/truy-cap.placeholders.accessPoint')}
              allowClear
              mode='multiple'
              onChange={(value) => setFilters([{ field: 'doorIds', operator: 'in', value }])}
              className='min-w-[210px]'
            />
            <Select
              options={eventLogsInit?.data?.eventTypeList}
              fieldNames={{ label: 'name', value: 'id' }}
              optionFilterProp='name'
              placeholder={t('giam-sat/truy-cap.placeholders.eventType')}
              allowClear
              mode='multiple'
              onChange={(value) => setFilters([{ field: 'eventType', operator: 'eq', value }])}
              className='min-w-[210px]'
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
            className='ml-auto'
            onClick={() => setIsExpand(!isExpand)}
          />
        </div>

        {cardData?.length > 0 && (
          <div
            className='grid gap-2 overflow-auto'
            style={{ gridTemplateColumns: `repeat(${cardData?.length || 0}, 200px)` }}
          >
            {cardData?.map((item, index) => (
              <div key={index} className={clsx('border', item.type === 0 ? 'border-error' : 'border-primary')}>
                <div className='py-2 text-center font-medium'>
                  <div className='h-[22px]'>{item.doorName}</div>
                  <div>{dayjs(item.unixTime * 1000).format('DD/MM/YYYY HH:mm:ss')}</div>
                </div>

                <div className='flex items-center justify-center bg-[#262626] py-2.5'>
                  <Avatar
                    src={item.resultCheckIn}
                    size={100}
                    shape='square'
                    icon={<UserOutlined />}
                    className={clsx('[&_img]:object-contain', {
                      'border-black bg-gray-400': !item.resultCheckIn,
                    })}
                  />
                </div>

                <div className='space-y-2.5 p-2.5 text-center'>
                  <div className='flex justify-center'>
                    {tagMap[item.objectType]}
                    <div
                      className={clsx({
                        'text-error': item.objectType === 0,
                        'text-warning': item.objectType === 1,
                        'text-[#1890FF]': item.objectType === 2,
                      })}
                    >
                      {item.userName}
                    </div>
                  </div>

                  <div className='text-xs text-black/45'>
                    {t('giam-sat/truy-cap.fields.contact')}: {item.visitTarget}
                  </div>
                  <div className='text-xs text-black/45'>
                    {t('giam-sat/truy-cap.fields.event')}: {item.eventDetail}
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
          scroll={{ x: 'max-content', y: '66vh' }}
        >
          <Column
            dataIndex='resultCheckIn'
            width='100px'
            title={t('giam-sat/truy-cap.columns.image')}
            render={(_, record) =>
              record.resultCheckIn && (
                <Image
                  src={record.resultCheckIn}
                  alt={t('giam-sat/truy-cap.columns.image')}
                  width={80}
                  height={30}
                  className='object-contain'
                />
              )
            }
          />
          <Column
            dataIndex='unixTime'
            title={t('giam-sat/truy-cap.columns.time')}
            render={(value) => dayjs(value * 1000).format('DD/MM/YYYY HH:mm:ss')}
          />
          <Column
            dataIndex='objectType'
            className='!min-w-[100px]'
            title={t('giam-sat/truy-cap.columns.object')}
            render={(value) => tagMap[value]}
          />
          <Column
            dataIndex='cardType'
            title={t('giam-sat/truy-cap.columns.identification')}
            className='!min-w-[100px]'
          />
          <Column
            dataIndex='doorName'
            title={t('giam-sat/truy-cap.columns.accessPoint')}
            className='!min-w-[150px]'
            render={(value) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='building'
            title={t('giam-sat/truy-cap.columns.unit')}
            className='!min-w-[100px]'
            render={(value, record) => (
              <Typography.Text ellipsis={{ tooltip: value }} className='max-w-[150px]'>
                {value || record.building}
              </Typography.Text>
            )}
          />
          <Column
            dataIndex='eventDetail'
            title={t('giam-sat/truy-cap.placeholders.eventType')}
            className='!min-w-[100px]'
          />
        </Table>
      </div>

      <div className='-mx-6 mt-6 -mb-6 flex justify-end bg-white p-6'>
        <Link href='/bao-cao/bao-cao-truy-cap'>{t('giam-sat/truy-cap.buttons.viewAll')}</Link>
      </div>
    </div>
  );
}
