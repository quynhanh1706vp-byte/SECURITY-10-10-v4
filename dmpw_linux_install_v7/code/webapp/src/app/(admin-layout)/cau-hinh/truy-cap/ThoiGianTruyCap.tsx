'use client';

import React, { useEffect } from 'react';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { CreateButton, EditButton, useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { DayKeys, TAccessTime } from '@types';
import { Input, Spin, Table, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import ThoiGianTruyCapForm from './ThoiGianTruyCapForm';
import TruncatedText from '@components/ui/TruncatedText';

const { Search } = Input;
const { Column } = Table;

type DataType = TAccessTime;

const DAY_KEYS: DayKeys[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'holidayType1',
  'holidayType2',
  'holidayType3',
];

export default function ThoiGianTruyCap() {
  const { translate: t } = useTranslation();

  const { tableProps, handleSearch, handleDeleteSuccess, selectedRowKeys } = useCustomTable<DataType>({
    resource: 'access-times',
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    close: createModalClose,
  } = useModalForm<DataType>({
    resource: 'access-times',
    action: 'create',
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    formLoading: editFormLoading,
    query: editAccessTimeQuery,
  } = useModalForm<DataType>({
    resource: 'access-times',
    action: 'edit',
  });

  useEffect(() => {
    if (!editAccessTimeQuery?.data) return;

    const editAccessTime = editAccessTimeQuery.data.data;
    const days: DayKeys[] = [];
    const timeRanges: Array<[Dayjs, Dayjs] | null> = [null, null, null, null];

    DAY_KEYS.forEach((day) => {
      if (
        editAccessTime[day] &&
        editAccessTime[day].length > 0 &&
        (editAccessTime[day][0].from !== 0 || editAccessTime[day][0].to !== 0)
      ) {
        days.push(day);
      }
    });

    if (days.length === 0) return;

    editAccessTime[days[0]]?.forEach((timeRange, index) => {
      const { from, to } = timeRange;

      timeRanges[index] = [dayjs().startOf('day').add(from, 'minute'), dayjs().startOf('day').add(to, 'minute')];
    });

    editFormProps.form?.setFieldValue('days', days);
    editFormProps.form?.setFieldValue('timeRanges', timeRanges);
  }, [editAccessTimeQuery]);

  return (
    <div>
      <div className='flex justify-between gap-4'>
        <div className='w-[320px]'>
          <Search placeholder={t('cau-hinh/access-times.accessTimes.searchPlaceholder')} onChange={handleSearch} />
        </div>

        <div className='flex gap-4'>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='access-times'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
            />
          )}

          <CreateButton
            resource='access-times'
            type='primary'
            icon={null}
            onClick={() => {
              createModalShow();
            }}
          >
            {t('cau-hinh/access-times.accessTimes.add')}
          </CreateButton>
        </div>
      </div>

      <Table<DataType> {...tableProps} className='mt-2.5' scroll={{ x: 'max-content', y: '66vh' }}>
        <Column
          dataIndex='accessTimeName'
          title={t('cau-hinh/access-times.accessTimes.name')}
          width={400}
          render={(value) =>
            <TruncatedText maxWidth={400} tooltipMaxWidth={500}>
              {value}
            </TruncatedText>
        }
        />
        <Column
          dataIndex='remark'
          title={t('cau-hinh/access-times.accessTimes.note')}
          render={(value) => (
            <TruncatedText maxWidth={700} tooltipMaxWidth={800}>
              {value}
            </TruncatedText>
          )}
        />
        <Column
          dataIndex='action'
          title={t('common.action')}
          width={120}
          align='center'
          render={(_, record) => (
            <div className='flex justify-center gap-1'>
              <EditButton
                resource='access-times'
                icon={null}
                color='primary'
                variant='text'
                size='small'
                onClick={() => {
                  editModalShow(record.id);
                }}
              >
                {t('buttons.edit')}
              </EditButton>

              <DeleteButton
                color='primary'
                variant='text'
                size='small'
                icon={null}
                resource='access-times'
                recordItemId={record.id}
              />
            </div>
          )}
        />
      </Table>

      <Modal
        {...createModalProps}
        width={836}
        onCancel={() => {
          createModalClose();
          createFormProps.form?.resetFields();
        }}
      >
        <ThoiGianTruyCapForm {...createFormProps} />
      </Modal>

      <Modal {...editModalProps} width={836}>
        <Spin spinning={editFormLoading}>
          <ThoiGianTruyCapForm {...editFormProps} />
        </Spin>
      </Modal>
    </div>
  );
}
