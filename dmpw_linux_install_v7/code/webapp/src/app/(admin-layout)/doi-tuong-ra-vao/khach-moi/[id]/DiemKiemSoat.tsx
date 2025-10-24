'use client';

import { useParams } from 'next/navigation';
import { DeleteOutlined } from '@ant-design/icons';
import { useCustomTable, useTree } from '@hooks';
import { useModal } from '@refinedev/antd';
import { useCustom, useCustomMutation, useTranslation } from '@refinedev/core';
import { IDevicesInit } from '@types';
import { Button, Input, Modal, Table, TableProps, TreeSelect, Typography } from 'antd';

const { Search } = Input;

const { Text } = Typography;

export default function DiemKiemSoat() {
  const { translate: t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const {
    tableProps: assignedTableProps,
    selectedRowKeys: assignedSelectedRowKeys,
    resetTable: assignedResetTable,
    tableQuery: { refetch: assignedRefetch },
  } = useCustomTable({
    resource: `visits/${id}/assign-doors`,
    sorters: {
      initial: [{ field: 'doorName', order: 'asc' }],
    },
  });

  const { data: devicesInit } = useCustom<IDevicesInit>({
    url: 'devices/init',
    method: 'get',
  });

  const columns: TableProps['columns'] = [
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.doorName'),
      dataIndex: 'doorName',
      width: 200,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.building'),
      dataIndex: 'building',
      width: 120,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.operationType'),
      dataIndex: 'operationType',
      render: (text: number) => devicesInit?.data?.listOperationType.find((item) => item.id === text)?.name,
      width: 150,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.verifyMode'),
      dataIndex: 'verifyMode',
      render: (text: number) => devicesInit?.data?.lstVerifyMode.find((item) => item.id === text)?.name,
      width: 150,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.accessPoints.columns.accessTime'),
      dataIndex: 'accessTimeName',
      width: 160,
    },
  ];

  const { modalProps, show, close } = useModal();

  const { mutate: unAssignMutate } = useCustomMutation();

  const handleUnAssign = () => {
    unAssignMutate(
      {
        url: `visits/${id}/unassign-doors`,
        method: 'delete',
        values: assignedSelectedRowKeys,
        successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
        errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
      },
      {
        onSuccess: () => {
          assignedRefetch();
          unAssignedRefetch();

          assignedResetTable();
          unAssignedResetTable();
        },
      },
    );
  };

  const {
    tableProps: unAssignedTableProps,
    selectedRowKeys: unAssignedSelectedRowKeys,
    handleSearch: unAssignedHandleSearch,
    setFilters: unAssignedSetFilters,
    resetTable: unAssignedResetTable,
    tableQuery: { refetch: unAssignedRefetch },
  } = useCustomTable({
    resource: `visits/${id}/unassign-doors`,
    sorters: {
      initial: [{ field: 'doorName', order: 'asc' }],
    },
  });

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const { mutate: assignMutate } = useCustomMutation();

  const handleAssign = () => {
    assignMutate(
      {
        url: `visits/${id}/assign-doors`,
        method: 'post',
        values: {
          doors: unAssignedTableProps.dataSource
            ?.filter((item: any) => unAssignedSelectedRowKeys.includes(item.id))
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
          assignedRefetch();
          unAssignedRefetch();

          assignedResetTable();
          unAssignedResetTable();
          close();
        },
      },
    );
  };

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        {assignedSelectedRowKeys.length > 0 && (
          <Text>
            {t('doi-tuong-ra-vao/khach-moi.accessPoints.selectedCount').replace(
              '{{count}}',
              assignedSelectedRowKeys.length.toString(),
            )}
          </Text>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <Button type='primary' onClick={() => show()}>
            {t('doi-tuong-ra-vao/khach-moi.accessPoints.buttons.assignAccessPoints')}
          </Button>

          {assignedSelectedRowKeys.length > 0 && (
            <Button variant='outlined' color='danger' icon={<DeleteOutlined />} onClick={handleUnAssign}>
              {t('buttons.delete')}
            </Button>
          )}
        </div>
      </div>

      <Table {...assignedTableProps} columns={columns} className='mt-2.5' scroll={{ y: '66vh' }} />

      <Modal
        {...modalProps}
        title={t('doi-tuong-ra-vao/khach-moi.accessPoints.modal.title')}
        width={628}
        onCancel={(ev) => {
          modalProps.onCancel?.(ev);
          unAssignedResetTable();
        }}
        cancelText={t('buttons.cancel')}
        okText={t('buttons.save')}
        onOk={handleAssign}
      >
        <div className='flex flex-col gap-[10px]'>
          <div className='flex gap-[10px]'>
            <Search
              placeholder={t('doi-tuong-ra-vao/khach-moi.accessPoints.placeholders.search')}
              className='w-[264px]'
              onChange={unAssignedHandleSearch}
            />

            <TreeSelect
              treeData={treeData?.data || []}
              fieldNames={{ label: 'name', value: 'id' }}
              placeholder={t('doi-tuong-ra-vao/khach-moi.accessPoints.placeholders.building')}
              multiple
              showSearch
              onSearch={handleSearchBuilding}
              filterTreeNode={false}
              styles={{
                popup: { root: { maxHeight: 400, overflow: 'auto' } },
              }}
              allowClear
              treeDefaultExpandAll
              loading={isFetching}
              className='min-w-[210px]'
              onChange={(value) => unAssignedSetFilters([{ field: 'buildingIds', operator: 'in', value }])}
            />
          </div>

          <p>
            {t('doi-tuong-ra-vao/khach-moi.accessPoints.selectedCount', {
              count: unAssignedSelectedRowKeys.length.toString(),
            })}
          </p>
          <Table {...unAssignedTableProps} columns={columns.slice(0, 3)} scroll={{ x: 'max-content', y: '66vh' }} />
        </div>
      </Modal>
    </div>
  );
}
