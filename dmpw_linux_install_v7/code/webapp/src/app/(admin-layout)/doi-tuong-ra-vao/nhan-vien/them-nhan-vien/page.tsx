'use client';

import { useRouter } from 'next/navigation';
import ThongTinChungForm from '@app/(admin-layout)/doi-tuong-ra-vao/nhan-vien/ThongTinChungForm';
import { Create } from '@components/crud/Create';
import { useForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';

export default function Page() {
  const { translate: t } = useTranslation();
  const router = useRouter();

  const { formProps, formLoading } = useForm({
    resource: 'users',
    action: 'create',
    onMutationSuccess: () => {
      setTimeout(() => {
        router.push('/doi-tuong-ra-vao/nhan-vien');
      }, 100);
    },
  });

  return (
    <Create title={t('doi-tuong-ra-vao/nhan-vien.titles.create')} footerButtons={() => null}>
      <ThongTinChungForm formProps={formProps} />
    </Create>
  );
}
