'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Show } from '@refinedev/antd';
import { useCan, useTranslation } from '@refinedev/core';
import { Tabs } from 'antd';

import DanhSachThietBi from './DanhSachThietBi';
import ThongTinChung from './ThongTinChung';
import { $permissions } from '@constants/permmission';

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canViewDeviceReader } = useCan({
    resource: 'device-readers',
    action: 'list',
    params: { authority: $permissions.VIEW_DEVICE_READER },
  });

  const tabItems = [
    {
      key: 'thong-tin-chung',
      label: t('quan-ly-ra-vao/diem-kiem-soat.tabs.generalInfo'),
      children: <ThongTinChung />,
    },
    ...(canViewDeviceReader?.can
      ? [
          {
            key: 'danh-sach-thiet-bi',
            label: t('quan-ly-ra-vao/diem-kiem-soat.tabs.deviceList'),
            children: <DanhSachThietBi />,
          },
        ]
      : []),
  ];
  const { id } = useParams();

  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tab || 'thong-tin-chung');

  const router = useRouter();

  return (
    <Show title={t('quan-ly-ra-vao/diem-kiem-soat.detail.title')} headerButtons={() => <></>}>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          router.replace(`/quan-ly-ra-vao/diem-kiem-soat/${id}?tab=${key}`);
        }}
      />
    </Show>
  );
}
