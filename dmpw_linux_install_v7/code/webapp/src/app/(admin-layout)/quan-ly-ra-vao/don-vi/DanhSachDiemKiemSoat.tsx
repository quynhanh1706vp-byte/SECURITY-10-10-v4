import React, { useEffect } from 'react';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { useCan, useTranslation } from '@refinedev/core';
import { BaseKey } from '@refinedev/core';
import { Button, Table, Tabs, Typography } from 'antd';

const { Column } = Table;

type DanhSachDiemKiemSoatProps = {
  buildingIds: BaseKey[];
  onAssignDoor: (buildingId: BaseKey) => void;
};

export default function DanhSachDiemKiemSoat({ buildingIds, onAssignDoor }: DanhSachDiemKiemSoatProps) {
  const { translate: t } = useTranslation();

  const {
    tableProps,
    selectedRowKeys,
    tableQuery: { refetch },
    handleDeleteSuccess,
    resetTable,
  } = useCustomTable({
    resource: 'devices',
    filters: {
      permanent: [
        {
          field: 'buildingIds',
          operator: 'in',
          value: buildingIds,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: 'doorName',
          order: 'asc',
        },
      ],
    },
    queryOptions: {
      enabled: buildingIds.length > 0,
    },
  });

  useEffect(() => {
    resetTable();
  }, [buildingIds]);

  const { data: canEdit } = useCan({
    action: 'edit',
    params: { authority: 'building.editBuilding' },
  });

  const { data: canDelete } = useCan({
    action: 'delete',
    params: { authority: 'building.deleteBuilding' },
  });

  const TabContent = () => {
    if (buildingIds.length === 0) return;

    return (
      <div>
        <div className='flex items-center justify-between gap-4'>
          <div>
            {selectedRowKeys.length > 0 && (
              <span>{t('quan-ly-ra-vao/don-vi.common.selectedCount', { count: selectedRowKeys.length })}</span>
            )}
          </div>
          <div className='flex gap-4'>
            {canEdit?.can && (
              <Button type='primary' onClick={() => onAssignDoor(buildingIds[0])} disabled={selectedRowKeys.length > 0}>
                {t('quan-ly-ra-vao/don-vi.buildings.assignDoors.button')}
              </Button>
            )}

            {selectedRowKeys.length > 0 && canDelete?.can && (
              <MultipleDeleteButton
                resource={`buildings/${buildingIds[0]}/unassign-doors`}
                ids={selectedRowKeys}
                confirmTitle={t('buildings.unassignDoors.multipleDeleteConfirm.title')}
                confirmMessage={t('buildings.unassignDoors.multipleDeleteConfirm.message', {
                  count: selectedRowKeys.length,
                })}
                onSuccess={() => {
                  refetch();
                  handleDeleteSuccess(selectedRowKeys);
                }}
              >
                {t('buttons.delete')}
              </MultipleDeleteButton>
            )}
          </div>
        </div>

        <Table {...tableProps} className='mt-4' scroll={{ y: '100%' }}>
          <Column
            title={t('quan-ly-ra-vao/don-vi.buildings.fields.doorName')}
            dataIndex='doorName'
            width={300}
            render={(value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>}
          />
          <Column title={t('quan-ly-ra-vao/don-vi.buildings.fields.cheDoKiemTra')} dataIndex='verifyMode' width={200} />
          <Column
            title={t('quan-ly-ra-vao/don-vi.buildings.fields.cheDoVanHanh')}
            dataIndex='operationType'
            width={150}
          />
          <Column
            title={t('quan-ly-ra-vao/don-vi.buildings.fields.activeTz')}
            dataIndex='doorActiveTimeZone'
            width={160}
          />
          <Column
            title={t('quan-ly-ra-vao/don-vi.buildings.fields.passageTz')}
            dataIndex='doorPassageTimeZone'
            width={210}
          />
        </Table>
      </div>
    );
  };

  return (
    <div className='min-w-0 flex-1 bg-white p-2.5'>
      <Tabs
        items={[
          {
            key: '1',
            label: t('quan-ly-ra-vao/don-vi.buildings.tabs.controlPoints'),
            children: <TabContent />,
          },
        ]}
      ></Tabs>
    </div>
  );
}
