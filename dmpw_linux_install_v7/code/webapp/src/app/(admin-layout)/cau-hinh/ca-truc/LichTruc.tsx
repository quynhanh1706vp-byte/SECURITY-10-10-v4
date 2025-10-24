'use client';

import { useMemo } from 'react';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { $permissions } from '@constants/permmission';
import { useCustomTable, useSelectInfinite } from '@hooks';
import { EditButton, useModalForm } from '@refinedev/antd';
import { CanAccess, useCan } from '@refinedev/core';
import { useTranslation } from '@refinedev/core';
import { Input, Select, Spin, Table, TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';

import LichTrucForm from './LichTrucForm';

const { Search } = Input;

type DataType = any;

export default function ThoiGianTruyCap() {
  const { translate: t } = useTranslation();
  const { data: canDelete } = useCan({
    resource: 'access-schedules',
    action: 'delete',
    params: { authority: $permissions.DELETE_ACCESS_SCHEDULE },
  });

  const { data: canEdit } = useCan({
    resource: 'access-schedules',
    action: 'edit',
    params: { authority: $permissions.EDIT_ACCESS_SCHEDULE },
  });

  const hasDeletePermission = canDelete?.can;
  const hasEditPermission = canEdit?.can;
  const hasActionPermission = hasDeletePermission || hasEditPermission;

  const { data: canViewUser } = useCan({
    resource: 'users',
    action: 'list',
    params: { authority: $permissions.VIEW_USER },
  });

  const { selectProps: userSelectProps } = useSelectInfinite({
    resource: 'users',
    optionLabel: 'firstName',
    optionValue: 'id',
    sorters: [
      {
        field: 'firstName',
        order: 'asc',
      },
    ],
    queryOptions: {
      enabled: canViewUser?.can === true,
    },
  });

  const { tableProps, selectedRowKeys, handleDeleteSuccess, handleSearch, setFilters } = useCustomTable<DataType>(
    {
      resource: 'access-schedules',
    },
    {
      searchFieldName: 'content',
    },
  );

  const { modalProps, formProps, show, query } = useModalForm({
    resource: 'access-schedules',
    action: 'edit',
  });

  const initialValues = useMemo(() => {
    if (!formProps.initialValues) return;

    const { startTime, endTime, users, workShifts } = formProps.initialValues;

    return {
      ...formProps.initialValues,
      dateRange: [dayjs(startTime, 'DD.MM.YYYY'), dayjs(endTime, 'DD.MM.YYYY')],
      userIds: users?.map((user: any) => user.id) || [],
      workShiftIds: workShifts?.map((workShift: any) => workShift.id) || [],
    };
  }, [formProps.initialValues]);

  const columns: TableColumnsType<DataType> = [
    {
      title: t('cau-hinh/ca-truc.schedule.columns.content'),
      dataIndex: 'content',
      render: (value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>,
      // width: 200,
    },
    {
      title: t('cau-hinh/ca-truc.schedule.columns.employeeCount'),
      dataIndex: 'userQuantity',
      render: (_, record) => {
        return <div className='text-primary'>{record.userQuantity}</div>;
      },
      width: 200,
    },
    ...(hasActionPermission
      ? [
          {
            title: t('cau-hinh/ca-truc.schedule.columns.actions'),
            dataIndex: 'thaoTac',
            width: 120,
            render: (_: any, record: any) => (
              <div className='flex gap-1'>
                <EditButton
                  color='primary'
                  variant='text'
                  icon={null}
                  size='small'
                  onClick={() => show(record.id)}
                  accessControl={{ hideIfUnauthorized: true }}
                >
                  {t('cau-hinh/ca-truc.schedule.buttons.edit')}
                </EditButton>

                <DeleteButton
                  color='primary'
                  variant='text'
                  size='small'
                  icon={null}
                  resource='access-schedules'
                  recordItemId={record.id}
                  accessControl={{ hideIfUnauthorized: true }}
                  onSuccess={() => handleDeleteSuccess(record.id)}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className='flex gap-2'>
        <Search
          placeholder={t('cau-hinh/ca-truc.schedule.placeholders.search')}
          onChange={handleSearch}
          className='w-[210px]'
        />

        <CanAccess resource='users' action='list'>
          <Select
            {...userSelectProps}
            placeholder={t('cau-hinh/ca-truc.schedule.placeholders.employee')}
            mode='multiple'
            onChange={(value) => setFilters([{ field: 'userIds', operator: 'in', value }])}
            className='min-w-[210px]'
            allowClear
          />
        </CanAccess>

        {selectedRowKeys.length > 0 && hasDeletePermission && (
          <MultipleDeleteButton
            resource='access-schedules'
            ids={selectedRowKeys}
            onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
          />
        )}
      </div>

      <Table<DataType>
        {...tableProps}
        rowSelection={hasDeletePermission ? tableProps.rowSelection : undefined}
        columns={columns}
        className='mt-2.5'
        scroll={{ y: '66vh' }}
      />

      <Modal {...modalProps}>
        <Spin spinning={query?.isFetching}>
          <LichTrucForm {...formProps} initialValues={initialValues} />
        </Spin>
      </Modal>
    </div>
  );
}
