import { useParams } from 'next/navigation';
import Modal from '@components/ui/Modal';
import { useCustomTable, useTree } from '@hooks';
import { useModal, useSelect } from '@refinedev/antd';
import { useCustom, useCustomMutation, useInvalidate, useTranslation, useUpdate } from '@refinedev/core';
import { Button, Input, Select, Table, TreeSelect, Typography } from 'antd';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { IDevicesInit } from '@types';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

const { Column } = Table;
const { Search } = Input;

export default function DiemKiemSoat() {
  const { translate: t } = useTranslation();

  const params = useParams();
  const { id } = params as { id: string };

  const { data: devicesInit } = useCustom<IDevicesInit>({
    url: 'devices/init',
    method: 'get',
  });

  const {
    tableProps,
    tableQuery: { refetch },
    selectedRowKeys,
    handleDeleteSuccess,
  } = useCustomTable({
    resource: `access-groups/${id}/doors`,
  });

  const { modalProps, show, close } = useModal();

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const {
    tableProps: unassignedTableProps,
    handleSearch: handleSearchUnassigned,
    setFilters: setUnassignedFilters,
    selectedRowKeys: unassignedSelectedRowKeys,
  } = useCustomTable({
    resource: `access-groups/${id}/unassigned-doors`,
  });

  const { mutate, isLoading } = useCustomMutation();

  const handleAssignDoors = () => {
    mutate(
      {
        url: `access-groups/${id}/assign-doors`,
        method: 'post',
        values: {
          doors: unassignedTableProps.dataSource
            ?.filter((item: any) => unassignedSelectedRowKeys.includes(item.id))
            .map((item: any) => ({
              doorId: item.id,
              tzId: item.tzId,
              companyId: item.companyId || 0,
            })),
        },
        successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
        errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
      },
      {
        onSuccess: () => {
          close();
          refetch();
        },
      },
    );
  };

  return (
    <>
      <div className='flex items-center'>
        <div className='ml-auto flex gap-6'>
          <Button type='primary' onClick={() => show()}>
            {t('bao-cao/access-groups.accessGroups.assign.addDoor')}
          </Button>

          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource={`access-groups/${id}/unassign-doors`}
              ids={selectedRowKeys}
              onSuccess={() => {
                refetch();
                handleDeleteSuccess(selectedRowKeys);
              }}
              confirmTitle={t('access-groups.unassign-doors.multipleDeleteConfirm.title')}
              confirmMessage={t('access-groups.unassign-doors.multipleDeleteConfirm.message', {
                count: selectedRowKeys.length,
              })}
              disabled={false}
            />
          )}
        </div>
      </div>

      <Table {...tableProps} className='mt-4' scroll={{ y: '66vh' }}>
        <Column
          title={t('bao-cao/access-groups.accessGroups.table.doorName')}
          dataIndex='doorName'
          width={250}
          render={(value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>}
        />
        <Column
          title={t('bao-cao/access-groups.accessGroups.table.donVi')}
          dataIndex='building'
          width={250}
          render={(value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>}
        />
        <Column
          title={t('bao-cao/access-groups.accessGroups.table.cheDoVanHanh')}
          dataIndex='operationType'
          width={200}
          render={(text: number) => devicesInit?.data?.listOperationType.find((item) => item.id === text)?.name}
        />
        <Column
          title={t('bao-cao/access-groups.accessGroups.table.cheDoKiemTra')}
          dataIndex='verifyMode'
          width={200}
          render={(text: number) => devicesInit?.data?.lstVerifyMode.find((item) => item.id === text)?.name}
        />
        <Column
          title={t('bao-cao/access-groups.accessGroups.table.khungGioKiemSoat')}
          dataIndex='doorActiveTimeZone'
          width={200}
        />
      </Table>

      <Modal
        {...modalProps}
        title={t('bao-cao/access-groups.accessGroups.assign.modal.assignDoorTitle')}
        width={1000}
        okText={t('buttons.save')}
        okButtonProps={{ loading: isLoading, onClick: handleAssignDoors }}
        cancelText={t('buttons.cancel')}
      >
        <div className='flex gap-2.5'>
          <Search placeholder={t('common.search')} className='w-[264px]' onChange={handleSearchUnassigned} />

          <TreeSelect
            treeData={treeData?.data || []}
            fieldNames={{ label: 'name', value: 'id' }}
            placeholder={t('bao-cao/access-groups.accessGroups.table.donVi')}
            multiple
            showSearch
            maxTagCount={2}
            onSearch={handleSearchBuilding}
            filterTreeNode={false}
            styles={{
              popup: { root: { maxHeight: 400, overflow: 'auto' } },
            }}
            allowClear
            treeDefaultExpandAll
            loading={isFetching}
            className='min-w-[210px]'
            onChange={(value) => setUnassignedFilters([{ field: 'buildingIds', operator: 'in', value }])}
          />
        </div>

        <p className='mt-2'>
          {t('common.selected')}: {unassignedSelectedRowKeys.length} {t('common.records')}
        </p>

        <Table {...unassignedTableProps} className='mt-4' scroll={{ y: '66vh' }}>
          <Column title={t('bao-cao/access-groups.accessGroups.table.doorName')} dataIndex='doorName' />
          <Column title={t('bao-cao/access-groups.accessGroups.table.donVi')} dataIndex='building' />
          <Column
            title={t('bao-cao/access-groups.accessGroups.table.cheDoVanHanh')}
            dataIndex='operationType'
            render={(text: number) => devicesInit?.data?.listOperationType.find((item) => item.id === text)?.name}
          />
        </Table>
      </Modal>
    </>
  );
}
