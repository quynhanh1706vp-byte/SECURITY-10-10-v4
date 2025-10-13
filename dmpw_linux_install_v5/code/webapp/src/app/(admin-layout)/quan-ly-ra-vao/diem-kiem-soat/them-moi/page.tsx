'use client';

import DiemKiemSoatForm from '@components/form/quan-ly-ra-vao/diem-kiem-soat/DiemKiemSoatForm';
import { useTranslate } from '@refinedev/core';
import { Create } from '@components/crud/Create';

export default function ThemMoiDiemKiemSoatPage() {
  const t = useTranslate();

  return (
  <Create title={t('quan-ly-ra-vao/diem-kiem-soat.modal.addDeviceTitle')} footerButtons={() => null}>
    <DiemKiemSoatForm />
  </Create>
  );
}
