'use client';

import React, { useState } from 'react';
import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { List, useModal } from '@refinedev/antd';
import { BaseKey, useInvalidate, useTranslation, useUpdate } from '@refinedev/core';
import { Input, Table, Typography } from 'antd';

import DanhSachDiemKiemSoat from './DanhSachDiemKiemSoat';
import TreeView from './TreeView';

const { Column } = Table;

export default function Page() {
  const { translate: t } = useTranslation();

  const [buildingIds, setBuildingIds] = useState<BaseKey[]>([]);
  const [assignBuildingId, setAssignBuildingId] = useState<BaseKey | undefined>();

  const { modalProps, show, close } = useModal();

  const { tableProps, selectedRowKeys, handleSearch, resetTable } = useCustomTable({
    resource: `buildings/${assignBuildingId}/unassign-doors`,
    sorters: {
      initial: [
        {
          field: 'doorName',
          order: 'asc',
        },
      ],
    },
    queryOptions: {
      enabled: !!assignBuildingId && modalProps.open,
    },
  });

  const invalidate = useInvalidate();

  const { mutate: assignMutate, isLoading } = useUpdate({
    resource: `buildings/${assignBuildingId}/assign-doors`,
    id: '',
    meta: { method: 'post' },
    mutationOptions: {
      onSuccess: () => {
        invalidate({
          resource: `devices`,
          invalidates: ['list'],
        });

        resetTable();
        setAssignBuildingId(undefined);
        close();
      },
    },
  });

  return (
    <List title={t('quan-ly-ra-vao/don-vi.don-vi.pageTitle')} contentProps={{ className: 'p-0! bg-transparent!' }}>
      <section className='flex gap-2'>
        <TreeView
          onSelectBuilding={setBuildingIds}
          onAssignDoor={(buildingId) => {
            setAssignBuildingId(buildingId);
            show();
          }}
        />

        <DanhSachDiemKiemSoat
          buildingIds={buildingIds}
          onAssignDoor={(buildingIds) => {
            setAssignBuildingId(buildingIds);
            show();
          }}
        />
      </section>

      <Modal
        {...modalProps}
        title={t('quan-ly-ra-vao/don-vi.don-vi.modal.assignTitle')}
        width={700}
        centered
        okText={t('buttons.save')}
        okButtonProps={{ loading: isLoading, onClick: () => assignMutate({ values: selectedRowKeys }) }}
        cancelText={t('buttons.cancel')}
        onCancel={() => {
          resetTable();
          setAssignBuildingId(undefined);
          close();
        }}
      >
        <div className='flex items-center justify-between gap-4'>
          <Input.Search placeholder={t('common.search')} className='w-[250px]' onChange={handleSearch} />

          {selectedRowKeys.length > 0 && (
            <div>{t('quan-ly-ra-vao/don-vi.don-vi.selectedCount', { count: selectedRowKeys.length })}</div>
          )}
        </div>

        <Table {...tableProps} scroll={{ y: '40vh' }} className='mt-4'>
          <Column
            title={t('quan-ly-ra-vao/don-vi.don-vi.columns.doorName')}
            dataIndex='doorName'
            render={(value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>}
          />
          <Column
            title={t('quan-ly-ra-vao/don-vi.don-vi.columns.unit')}
            dataIndex='building'
            width={150}
            render={(value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>}
          />
          <Column
            title={t('quan-ly-ra-vao/don-vi.don-vi.columns.operationMode')}
            dataIndex='operationType'
            width={150}
          />
        </Table>
      </Modal>
    </List>
  );
}
