'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BankOutlined, CarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Select, Tabs, TabsProps } from 'antd';

import DiemKiemSoat from './DiemKiemSoat';
import PhuongTien from './PhuongTien';
import TruyCap from './TruyCap';
import { useCan } from '@refinedev/core';
import { $permissions } from '@constants/permmission';

const getRefetchIntervalOptions = (t: any) => [
  {
    label: t('giam-sat/giam-sat.monitoring.intervals.30s'),
    value: 30000,
  },
  {
    label: t('giam-sat/giam-sat.monitoring.intervals.1m'),
    value: 60000,
  },
  {
    label: t('giam-sat/giam-sat.monitoring.intervals.5m'),
    value: 300000,
  },
  {
    label: t('giam-sat/giam-sat.monitoring.intervals.15m'),
    value: 900000,
  },
  {
    label: t('giam-sat/giam-sat.monitoring.intervals.off'),
    value: false,
  },
];

export default function Page() {
  const t = useTranslations();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(900000);
  const refetchIntervalOptions = getRefetchIntervalOptions(t);

  const { data: canViewDevice } = useCan({
    resource: 'monitoring',
    action: 'list',
    params: { authority: $permissions.VIEW_DEVICE_MONITORING },
  });

  const { data: canViewMonitor } = useCan({
    resource: 'monitoring',
    action: 'list',
    params: { authority: $permissions.VIEW_MONITORING },
  });

  const { data: canCreateVisit } = useCan({
    resource: 'visits',
    action: 'create',
    params: { authority: $permissions.ADD_VISIT },
  });

  const tabItems: TabsProps['items'] = [];
  if (canViewMonitor?.can) {
    tabItems.push({
      key: '1',
      label: (
        <div className='flex items-center gap-3 font-bold'>
          <BankOutlined size={14} /> {t('giam-sat/giam-sat.monitoring.tabs.access')}
        </div>
      ),
      children: <TruyCap refetchInterval={refetchInterval} />,
    });
  }

  if (canViewMonitor?.can) {
    tabItems.push({
      key: '2',
      label: (
        <div className='flex items-center gap-3 font-bold'>
          <EnvironmentOutlined size={14} />
          {t('giam-sat/giam-sat.monitoring.tabs.accessPoint')}
        </div>
      ),
      children: <DiemKiemSoat refetchInterval={refetchInterval} />,
    });
  }

  if (canViewDevice?.can) {
    tabItems.push({
      key: '3',
      label: (
        <div className='flex items-center gap-3 font-bold'>
          <CarOutlined size={14} />
          {t('giam-sat/giam-sat.monitoring.tabs.vehicle')}
        </div>
      ),
      children: <PhuongTien refetchInterval={refetchInterval} />,
    });
  }
  return (
    <div className='bg-[#E6F7FF] p-6'>
      <Tabs
        items={tabItems}
        tabBarExtraContent={
          <div className='flex gap-6'>
            <Select
              options={refetchIntervalOptions}
              value={refetchInterval}
              onChange={(value) => setRefetchInterval(value)}
              className='w-[200px]'
            />

            {canCreateVisit?.can && (
              <Button
                href='/doi-tuong-ra-vao/khach-moi/them-khach-moi'
                target='_blank'
                type='primary'
                icon={<UserOutlined />}
              >
                {t('giam-sat/giam-sat.monitoring.registerGuest')}
              </Button>
            )}
          </div>
        }
        className='[&_.ant-tabs-nav]:flex-nowrap [&_.ant-tabs-nav]:overflow-x-auto [&_.ant-tabs-nav]:before:hidden [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:gap-x-4 [&_.ant-tabs-tab]:whitespace-nowrap'
      ></Tabs>
    </div>
  );
}
