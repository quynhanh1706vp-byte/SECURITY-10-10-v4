'use client';

import { IKhachMoi } from '@types';
import { Tabs } from 'antd';
import { useTranslation } from '@refinedev/core';

import DiemKiemSoat from './DiemKiemSoat';
import LichSuTruyCap from './LichSuTruyCap';
import ThongTinChung from './ThongTinChung';

export default function DuyetKhachMoi({ data }: { data: IKhachMoi }) {
  const { translate: t } = useTranslation();
  
  const tabItems = [
    {
      key: '1',
      label: t('doi-tuong-ra-vao/khach-moi.approval.tabs.generalInfo'),
      children: <ThongTinChung id={data.id} />,
    },
    {
      key: '2',
      label: t('doi-tuong-ra-vao/khach-moi.approval.tabs.accessPoints'),
      children: <DiemKiemSoat data={data} />,
    },
    {
      key: '3',
      label: t('doi-tuong-ra-vao/khach-moi.approval.tabs.accessHistory'),
      children: <LichSuTruyCap data={data} />,
    },
  ];

  return <Tabs items={tabItems} />;
}
