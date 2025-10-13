'use client';

import { useState } from 'react';
import { List } from '@refinedev/antd';

import DanhSachNhanVien from './DanhSachNhanVien';
import TreeView from './TreeView';
import { useCan, useTranslation } from '@refinedev/core';
import { $permissions } from '@constants/permmission';

export default function Page() {
  const { translate: t } = useTranslation();
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);


  const { data: canViewUser } = useCan({
    resource: 'departments',
    action: 'list',
    params: { authority: $permissions.VIEW_USER_DEPARTMENT },
  });

  return (
    <List title={t('cau-hinh/departments.departments.title')} contentProps={{ className: 'p-0! bg-transparent!' }}>
      <section className='flex gap-2'>
        <TreeView onSelectDepartment={setDepartmentId} />

        {canViewUser?.can && (
          <DanhSachNhanVien departmentId={departmentId} />
        )}
      </section>
    </List>
  );
}
