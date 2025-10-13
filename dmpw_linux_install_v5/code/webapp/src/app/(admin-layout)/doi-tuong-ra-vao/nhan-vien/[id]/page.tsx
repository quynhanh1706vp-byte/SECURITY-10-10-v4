'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Dinhdanh from '@app/(admin-layout)/doi-tuong-ra-vao/nhan-vien/[id]/(dinh-danh)/DinhDanh';
import DiemKiemSoat from '@app/(admin-layout)/doi-tuong-ra-vao/nhan-vien/[id]/DiemKiemSoat';
import PhuongTien from '@app/(admin-layout)/doi-tuong-ra-vao/nhan-vien/[id]/PhuongTien';
import ThongTinChungForm from '@app/(admin-layout)/doi-tuong-ra-vao/nhan-vien/ThongTinChungForm';
import { Edit } from '@components/crud/Edit';
import { useForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { TUser } from '@types';
import { Badge, Space, Spin, Tabs } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { translate: t } = useTranslation();

  const router = useRouter();

  const { formProps, query, formLoading } = useForm<TUser>({
    resource: 'users',
    action: 'edit',
    id,
    onMutationSuccess: () => {
      setTimeout(() => {
        router.push(`/doi-tuong-ra-vao/nhan-vien`);
      }, 100);
    },
  });

  const user = query?.data?.data;

  const initialValues = useMemo(() => {
    return {
      ...formProps.initialValues,
      effectiveDate: formProps.initialValues?.effectiveDate
        ? dayjs.utc(formProps.initialValues?.effectiveDate, 'DD.MM.YYYY HH:mm:ss').local()
        : undefined,
      expiredDate: formProps.initialValues?.expiredDate
        ? dayjs.utc(formProps.initialValues?.expiredDate, 'DD.MM.YYYY HH:mm:ss').local()
        : undefined,
      birthDay: formProps.initialValues?.birthDay
        ? dayjs.utc(formProps.initialValues?.birthDay, 'DD.MM.YYYY HH:mm:ss').local()
        : undefined,
      gender: +formProps.initialValues?.gender,
      status: formProps.initialValues?.status ? 0 : 1, // Convert boolean to 0 or 1
    };
  }, [formProps.initialValues]);

  const tabItems = [
    {
      key: '1',
      label: t('doi-tuong-ra-vao/nhan-vien.tabs.generalInfo'),
      children: <ThongTinChungForm formProps={{ ...formProps, initialValues }} />,
    },
    {
      key: '2',
      label: (
        <Space>
          {t('doi-tuong-ra-vao/nhan-vien.tabs.accessPoints')}
          <Badge count={undefined} style={{ backgroundColor: '#d9d9d9', color: '#000' }} />
        </Space>
      ),
      children: <DiemKiemSoat user={user} />,
    },
    {
      key: '3',
      label: (
        <Space>
          {t('doi-tuong-ra-vao/nhan-vien.tabs.identification')}
          <Badge count={user?.cardList?.length || 0} style={{ backgroundColor: '#d9d9d9', color: '#000' }} />
        </Space>
      ),
      children: <Dinhdanh user={user} />,
    },
    {
      key: '4',
      label: (
        <Space>
          {t('doi-tuong-ra-vao/nhan-vien.tabs.vehicles')}
          <Badge count={undefined} style={{ backgroundColor: '#d9d9d9', color: '#000' }} />
        </Space>
      ),
      children: <PhuongTien user={user} />,
    },
  ];
  return (
    <Edit title={t('doi-tuong-ra-vao/nhan-vien.titles.edit')} resource='users' footerButtons={() => null}>
      <Spin spinning={formLoading}>
        <Tabs items={tabItems} />
      </Spin>
    </Edit>
  );
}
