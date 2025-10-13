'use client';

import { useMemo } from 'react';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { EditButton, useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Button, Input, Spin, Table, TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';

import CaTrucForm from './CaTrucForm';

type DataType = any;

const { Search } = Input;

export default function ThoiGianTruyCap() {
  const { translate: t } = useTranslation();
  const { tableProps, selectedRowKeys, handleDeleteSuccess, handleSearch } = useCustomTable<DataType>(
    {
      resource: 'work-shifts',
    },
    {
      searchFieldName: 'name',
    },
  );

  const {
    modalProps: editWorkShiftModalProps,
    formProps: editWorkShiftFormProps,
    show: showEditWorkShiftModal,
    query,
  } = useModalForm({
    resource: 'work-shifts',
    action: 'edit',
  });

  const initialValues = useMemo(() => {
    if (!editWorkShiftFormProps.initialValues) return undefined;

    return {
      name: editWorkShiftFormProps.initialValues?.name,
      startTime: dayjs(editWorkShiftFormProps.initialValues?.startTime, 'HH:mm'),
      endTime: dayjs(editWorkShiftFormProps.initialValues?.endTime, 'HH:mm'),
    };
  }, [editWorkShiftFormProps.initialValues]);

  const columns: TableColumnsType<DataType> = [
    {
      title: t('cau-hinh/ca-truc.shifts.columns.shift'),
      dataIndex: 'time',
      width: 200,
      render: (_, record) => {
        return `${record.startTime} - ${record.endTime}`;
      },
    },
    {
      title: t('cau-hinh/ca-truc.shifts.columns.shiftName'),
      dataIndex: 'name',
      render: (value) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>,
    },
    {
      title: t('cau-hinh/ca-truc.shifts.columns.actions'),
      dataIndex: 'thaoTac',
      width: 120,
      render: (_, record) => (
        <div className='flex gap-1'>
          <EditButton
            resource='work-shifts'
            color='primary'
            icon={null}
            variant='text'
            size='small'
            onClick={() => showEditWorkShiftModal(record.id)}
          >
            {t('buttons.edit')}
          </EditButton>

          <DeleteButton
            resource='work-shifts'
            color='primary'
            variant='text'
            size='small'
            icon={null}
            recordItemId={record.id}
            onSuccess={() => handleDeleteSuccess(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className='flex gap-2'>
        <Search
          placeholder={t('cau-hinh/ca-truc.shifts.placeholders.search')}
          onChange={handleSearch}
          className='w-[210px]'
        />

        {selectedRowKeys.length > 0 && (
          <MultipleDeleteButton
            resource='work-shifts'
            ids={selectedRowKeys}
            onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
          />
        )}
      </div>

      <Table<DataType> {...tableProps} columns={columns} className='mt-2.5' scroll={{ y: '66vh' }} />

      <Modal {...editWorkShiftModalProps} width={628}>
        <Spin spinning={query?.isFetching}>
          <CaTrucForm {...editWorkShiftFormProps} initialValues={initialValues} />
        </Spin>
      </Modal>
    </div>
  );
}
