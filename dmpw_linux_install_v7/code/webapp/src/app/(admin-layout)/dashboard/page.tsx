'use client';

import { useMemo, useState } from 'react';
import {
  CarOutlined,
  StopOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  UserOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import PendingApprovalIcon from '@components/icons/dashboard/PendingApprovalIcon';
import { useSelect } from '@refinedev/antd';
import { BaseOption, useCustom, useTranslation } from '@refinedev/core';
import { IDevice } from '@types';
import type { SelectProps } from 'antd';
import { Card, DatePicker, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { StaffIcon, WeibuIcon } from '@/components/icons';
import { TAccessData, TVehicleData, TVisitData } from '@/types/dashboard';

export default function Page() {
  const { translate: t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const { data: accessData } = useCustom<TAccessData>({
    url: 'dashboard/access',
    method: 'get',
    config: {
      query: {
        type: 0,
        accessDate: selectedDate.startOf('day').format('DD.MM.YYYY HH:mm:ss'),
      },
    },
  });

  const { data: visitorData } = useCustom<TVisitData>({
    url: 'dashboard/visit',
    method: 'get',
    config: {
      query: {
        visitDate: selectedDate.startOf('day').format('DD.MM.YYYY HH:mm:ss'),
      },
    },
  });

  const { data: vehicleData } = useCustom<TVehicleData>({
    url: 'dashboard/vehicle',
    method: 'get',
    config: {
      query: {
        accessDate: selectedDate.startOf('day').format('DD.MM.YYYY HH:mm:ss'),
      },
    },
  });

  const { selectProps: deviceSelectProps } = useSelect<IDevice>({
    resource: 'devices',
    optionLabel: 'doorName',
    optionValue: 'id',
    sorters: [
      {
        field: 'doorName',
        order: 'asc',
      },
    ],
    filters: [
      {
        field: 'operationType',
        operator: 'eq',
        value: 0,
      },
    ],
    onSearch: (value) => [
      {
        field: 'search',
        operator: 'eq',
        value,
      },
    ],
  });

  const [selectedDevices, setSelectedDevices] = useState<BaseOption[]>([]);

  // Metric cards data
  const metricCards = useMemo(() => {
    return [
      {
        title: t('dashboard.metric.access.total'),
        value: accessData?.data?.totalAccessEvents ?? 0,
        icon: <VerticalAlignMiddleOutlined className='text-[18px] text-[#1890FF]' />,
        borderColor: '#1890FF',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.access.abnormal'),
        value: accessData?.data?.totalAbnormalEvents ?? 0,
        icon: <WeibuIcon />,
        borderColor: '#1890FF',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.access.offlineDevices'),
        value: accessData?.data?.totalOfflineDevices ?? 0,
        icon: <StopOutlined className='text-[18px] text-red-500' />,
        borderColor: '#1890FF',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.staff.total'),
        value: accessData?.data?.totalUsers ?? 0,
        icon: <TeamOutlined className='text-[18px] text-blue-500' />,
        borderColor: '#1890FF',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.staff.accessed'),
        value: accessData?.data?.totalUsersAccess ?? 0,
        icon: (
          <span className='flex items-center'>
            <UserDeleteOutlined className='text-[18px] text-[#1890FF]' />
            <VerticalAlignMiddleOutlined className='text-[18px] text-[#1890FF]' />
          </span>
        ),
        borderColor: '#1890FF',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.visitor.total'),
        value: accessData?.data?.totalVisits ?? 0,
        icon: <UserOutlined className='text-[18px] text-[#FA8C16]' />,
        borderColor: '#FA8C16',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.visitor.entered'),
        value: visitorData?.data?.totalVisitorAccess ?? 0,
        icon: (
          <div>
            <UserOutlined className='text-[18px] text-[#FA8C16]' />
            <VerticalAlignTopOutlined className='-rotate-90 text-[18px] text-[#FA8C16]' />
          </div>
        ),
        borderColor: '#FA8C16',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.visitor.left'),
        value: accessData?.data?.totalVisitsOut ?? 0,
        icon: (
          <div>
            <UserOutlined className='text-[18px] text-[#FA8C16]' />
            <VerticalAlignTopOutlined className='rotate-90 text-[18px] text-[#FA8C16]' />
          </div>
        ),
        borderColor: '#FA8C16',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.visitor.registered'),
        value: visitorData?.data?.totalRegisteredVisitor ?? 0,
        icon: <UserOutlined className='text-[18px] text-[#FA8C16]' />,
        borderColor: '#FA8C16',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.visitor.awaiting'),
        value: visitorData?.data?.totalAwaitingVisitors ?? 0,
        icon: (
          <span className='flex items-center'>
            <UserDeleteOutlined className='text-[18px] text-[#FA8C16]' />
            <PendingApprovalIcon className='text-[18px] text-[#FA8C16]' />
          </span>
        ),
        borderColor: '#FA8C16',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.vehicle.total'),
        value: vehicleData?.data?.totalVehicles ?? 0,
        icon: <CarOutlined className='text-[18px] text-[#028661]' />,
        borderColor: '#028661',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.vehicle.entered'),
        value: vehicleData?.data?.totalVehiclesIn ?? 0,
        icon: (
          <div>
            <CarOutlined className='text-[18px] text-[#028661]' />
            <VerticalAlignTopOutlined className='-rotate-90 text-[18px] text-[#028661]' />
          </div>
        ),
        borderColor: '#028661',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.vehicle.left'),
        value: vehicleData?.data?.totalVehiclesOut ?? 0,
        icon: (
          <div>
            <CarOutlined className='text-[18px] text-[#028661]' />
            <VerticalAlignTopOutlined className='rotate-90 text-[18px] text-[#028661]' />
          </div>
        ),
        borderColor: '#028661',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.vehicle.staff'),
        value: vehicleData?.data?.totalVehiclesOfUser ?? 0,
        icon: (
          <div className='flex items-center gap-0.5'>
            <CarOutlined className='text-[18px] text-[#028661]' />
            <StaffIcon className='text-[18px] text-[#028661]' />
          </div>
        ),
        borderColor: '#028661',
        bgColor: 'bg-[#FFF]',
      },
      {
        title: t('dashboard.metric.vehicle.visitor'),
        value: vehicleData?.data?.totalVehiclesOfVisit ?? 0,
        icon: (
          <span className='flex items-center gap-1'>
            <CarOutlined className='text-[18px] text-[#028661]' />
            <UserOutlined className='text-[18px] text-[#028661]' />
          </span>
        ),
        borderColor: '#028661',
        bgColor: 'bg-[#FFF]',
      },
    ];
  }, [accessData, visitorData, vehicleData]);

  const chartData = useMemo(() => {
    const data: Array<{
      time: string;
      in: number;
      out: number;
      doorName: string;
      buildingName: string;
    }> = [];

    if (accessData?.data?.eventChartData) {
      const times = Array.from({ length: 24 }, (_, i) => i);

      times.forEach((time) => {
        const timePoint = {
          time: `${time}:00`,
          in: 0,
          out: 0,
          doorName: '',
          buildingName: '',
        };

        const selectedDeviceIds = selectedDevices.map((d) => d.value);

        // Sum up values for all doors at this time point
        accessData.data.eventChartData.forEach((device) => {
          if (selectedDeviceIds.includes(device.deviceId) || selectedDeviceIds.length === 0) {
            timePoint.in += device.inData[time] || 0;
            timePoint.out += device.outData[time] || 0;
            timePoint.doorName = device.doorName;
            timePoint.buildingName = device.buildingName;
          }
        });

        data.push(timePoint);
      });
    }

    return data;
  }, [accessData, selectedDevices]);

  return (
    <div className='bg-[#E6F7FF]'>
      <div className='p-6'>
        {/* Header with date picker */}
        <div className='mb-6 flex items-center gap-4'>
          <DatePicker
            allowClear={false}
            value={selectedDate}
            format='DD/MM/YYYY'
            className='w-32'
            onChange={setSelectedDate}
          />
        </div>

        {/* Metrics Grid */}
        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {metricCards.map((card, index) => (
            <Card
              key={index}
              className={`border-[1px] ${card.bgColor} rounded-[10px] transition-shadow duration-200 hover:shadow-lg`}
              styles={{ body: { padding: '24px' } }}
              style={{ borderColor: card.borderColor }}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='font-roboto mb-2 text-sm leading-[20px] font-normal tracking-[0px] text-[rgba(0,0,0,0.45)]'>
                    {card.title}
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    {card.icon}
                    <span
                      className='text-2xl leading-[20px] font-normal tracking-[0px]'
                      style={{ color: card.borderColor }}
                    >
                      {card.value}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <Card className='rounded-[16px] bg-white shadow-lg'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-[rgba(0, 0, 0, 0.85)] text-lg font-semibold'>{t('dashboard.chart.title')}</h3>
            <div className='text-gray-400'>...</div>
          </div>

          <Select<BaseOption[]>
            {...(deviceSelectProps as SelectProps<BaseOption[]>)}
            value={selectedDevices}
            labelInValue
            allowClear={false}
            placeholder={t('dashboard.chart.deviceFilterPlaceholder')}
            mode='multiple'
            onChange={(value) => setSelectedDevices(value)}
            className='mb-4 min-w-80'
            maxTagCount='responsive'
          />

          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={chartData}
                margin={{
                  left: -40,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis dataKey='time' padding={{ left: 20, right: 0 }} />
                <YAxis tickLine={false} />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='in'
                  stroke='#1890ff'
                  name={t('dashboard.chart.nameIn')}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='out'
                  stroke='#fa8c16'
                  name={t('dashboard.chart.nameOut')}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
