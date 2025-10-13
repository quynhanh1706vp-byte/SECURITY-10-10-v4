'use client';

import { Edit } from '@components/crud/Edit';
import { Tabs, TabsProps } from 'antd';

import DiemKiemSoat from './DiemKiemSoat';
import NhanVien from './NhanVien';
import ThongTinChung from './ThongTinChung';
import { useTranslation } from '@refinedev/core';

export default function Page() {
  const { translate: t } = useTranslation();

  const tabItems: TabsProps['items'] = [
  {
    key: '1',
    label: t('bao-cao/access-groups.accessGroups.tabs.general'),
    children: <ThongTinChung />,
  },
  {
    key: '2',
    label: t('bao-cao/access-groups.accessGroups.tabs.assignDoors'),
    children: <DiemKiemSoat />,
  },
  {
    key: '3',
    label: t('bao-cao/access-groups.accessGroups.tabs.assignUsers'),
    children: <NhanVien />,
  },
];

  return (
    <Edit footerButtons={() => null} contentClassName='p-6! pt-2!'>
      <Tabs items={tabItems} defaultActiveKey='1'></Tabs>
    </Edit>
  );
}
