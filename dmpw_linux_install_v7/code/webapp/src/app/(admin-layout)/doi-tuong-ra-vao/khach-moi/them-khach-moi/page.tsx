'use client';

import FormKhachMoi from '@app/(admin-layout)/doi-tuong-ra-vao/khach-moi/FormKhachMoi';
import { List } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Tabs } from 'antd';

export default function Page() {
  const { translate: t } = useTranslation();
  
  return (
    <List title={t('doi-tuong-ra-vao/khach-moi.titles.create')} headerButtons={() => <></>}>
      <div className='px-5'>
        <Tabs defaultActiveKey='1' items={[{ label: t('doi-tuong-ra-vao/khach-moi.tabs.generalInfo'), key: '1' }]} className='bg-white py-2' />
      </div>
      <FormKhachMoi />
    </List>
  );
}
