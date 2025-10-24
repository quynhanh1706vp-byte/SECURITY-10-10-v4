'use client';

import { useState } from 'react';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useCustomTable } from '@hooks';
import { useUpdate, useTranslation } from '@refinedev/core';
import { TUser } from '@types';
import { Button, Select, Table, Typography } from 'antd';

const { Column } = Table;

const { Option } = Select;
const { Title } = Typography;

export default function DiemKiemSoatTable({ user }: { user: TUser | undefined }) {
  const { translate: t } = useTranslation();
  const { tableProps } = useCustomTable({
    resource: `access-groups/${user?.accessGroupId}/doors`,
    queryOptions: {
      enabled: !!user?.accessGroupId,
    },
  });

  const [isEdit, setIsEdit] = useState(false);
  const [accessGroupId, setAccessGroupId] = useState(user?.accessGroupId);

  const { mutate, isPending: isUpdating } = useUpdate({
    resource: 'users',
    id: user?.id,
    mutationOptions: {
      onSuccess: () => {
        setIsEdit(false);
      },
    },
  });

  const handleUpdate = () => {
    mutate({
      values: {
        ...user,
        accessGroupId,
      },
    });
  };

  return (
    <div>
      <div>
        <div className='mb-2 text-sm leading-[22px]'>{t('doi-tuong-ra-vao/nhan-vien.accessPoints.accessGroup')}</div>

        <div className='flex gap-1'>
          <Select
            options={user?.accessGroups}
            fieldNames={{ label: 'name', value: 'id' }}
            value={accessGroupId}
            onChange={(value) => setAccessGroupId(value)}
            disabled={!isEdit}
            className='w-[368px]'
          >
            <Option value='full'>{t('doi-tuong-ra-vao/nhan-vien.accessPoints.fullAccess')}</Option>
          </Select>

          {!isEdit ? (
            <Button icon={<EditOutlined />} onClick={() => setIsEdit(true)} />
          ) : (
            <div className='flex gap-2'>
              <Button type='primary' icon={<SaveOutlined />} loading={isUpdating} onClick={handleUpdate} />

              <Button
                variant='outlined'
                color='primary'
                icon={<CloseOutlined />}
                onClick={() => {
                  setAccessGroupId(user?.accessGroupId);
                  setIsEdit(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} className='px-2 py-4'>
          {t('doi-tuong-ra-vao/nhan-vien.accessPoints.title')}
        </Title>
      </div>

      <Table {...tableProps} className='mt-2.5' rowSelection={undefined} scroll={{ x: 'max-content', y: '66vh' }}>
        <Column title={t('doi-tuong-ra-vao/nhan-vien.accessPoints.columns.accessPointName')} dataIndex='doorName' />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.accessPoints.columns.unit')} dataIndex='building' />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.accessPoints.columns.operationMode')} dataIndex='operationType' className="!min-w-[80px]" />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.accessPoints.columns.verificationMode')} dataIndex='verifyMode' className="!min-w-[80px]" />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.accessPoints.columns.timeFrame')} dataIndex='timezone' />
      </Table>
    </div>
  );
}
