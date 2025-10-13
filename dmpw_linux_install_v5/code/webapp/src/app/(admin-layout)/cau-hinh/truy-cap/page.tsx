'use client';

import { List } from '@refinedev/antd';
import { Tabs } from 'antd';

import KhachMoi from './KhachMoi';
import KyNghi from './KyNghi';
import TaiKhoanPheDuyet from './TaiKhoanPheDuyet';
import ThoiGianTruyCap from './ThoiGianTruyCap';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { $permissions } from '@constants/permmission';
import { useCan } from '@refinedev/core';

export default function Page() {
  const t = useTranslations();

  const [tabKey, setTabKey] = useState('access-time');

  const { data: canViewAccessTime } = useCan({
    resource: 'access-times',
    action: 'list',
    params: { authority: $permissions.VIEW_ACCESS_TIME },
  });

  const { data: canViewHoliday } = useCan({
    resource: 'holidays',
    action: 'list',
    params: { authority: $permissions.VIEW_HOLIDAY },
  });

  const { data: canViewVisitSetting } = useCan({
    resource: 'settings/visit',
    action: 'list',
    params: { authority: $permissions.EDIT_VISIT_SETTING },
  });

  useEffect(() => {
    if (canViewAccessTime?.can) {
      setTabKey('access-time');
    } else if (canViewHoliday?.can) {
      setTabKey('holiday');
    } else if (canViewVisitSetting?.can) {
      setTabKey('guest');
    }
  }, [canViewAccessTime?.can, canViewHoliday?.can, canViewVisitSetting?.can]);

  const tabItems = [
    ...(canViewAccessTime?.can
      ? [
          {
            key: 'access-time',
            label: t('cau-hinh/access-times.accessTimes.tabs.access-time'),
            children: <ThoiGianTruyCap />,
          },
        ]
      : []),
    ...(canViewHoliday?.can
      ? [
          {
            key: 'holiday',
            label: t('cau-hinh/access-times.accessTimes.tabs.holiday'),
            children: <KyNghi />,
          },
        ]
      : []),
    ...(canViewVisitSetting?.can
      ? [
          {
            key: 'settings/visit',
            label: t('cau-hinh/access-times.accessTimes.tabs.guest'),
            children: <KhachMoi />,
          },
          {
            key: 'approver',
            label: t('cau-hinh/access-times.accessTimes.tabs.approver'),
            children: <TaiKhoanPheDuyet />,
          },
        ]
      : []),
  ];
  return (
    <List title={t('cau-hinh/access-times.accessTimes.title')}>
      <Tabs items={tabItems} activeKey={tabKey} onChange={setTabKey} />
    </List>
  );
}
