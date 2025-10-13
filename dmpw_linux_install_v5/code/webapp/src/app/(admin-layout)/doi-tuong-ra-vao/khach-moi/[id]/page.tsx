'use client';

import { Edit } from '@components/crud/Edit';
import { useTranslation } from '@refinedev/core';
import { Tabs, TabsProps } from 'antd';

import FormKhachMoi from '@/app/(admin-layout)/doi-tuong-ra-vao/khach-moi/FormKhachMoi';

import DiemKiemSoat from './DiemKiemSoat';
import PhuongTien from './PhuongTien';

export default function Page() {
  const { translate: t } = useTranslation();

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('doi-tuong-ra-vao/khach-moi.tabs.generalInfo'),
      children: <FormKhachMoi />,
    },
    {
      key: '2',
      label: t('doi-tuong-ra-vao/khach-moi.tabs.assignAccessPoints'),
      children: <DiemKiemSoat />,
    },
    {
      key: '3',
      label: t('doi-tuong-ra-vao/khach-moi.tabs.vehicles'),
      children: <PhuongTien />,
    },
  ];

  return (
    <Edit
      title={t('doi-tuong-ra-vao/khach-moi.titles.edit')}
      resource='visits'
      footerButtons={() => null}
      contentClassName='p-6! pt-2!'
    >
      <Tabs items={tabItems} defaultActiveKey='1'></Tabs>
    </Edit>
  );
}
