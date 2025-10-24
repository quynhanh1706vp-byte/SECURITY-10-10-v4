'use client';

import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { $permissions } from '@constants/permmission';
import { List, useModalForm } from '@refinedev/antd';
import { useTranslation, useCan } from '@refinedev/core';
import { Button, Tabs } from 'antd';

import CaTruc from './CaTruc';
import CaTrucForm from './CaTrucForm';
import LichTruc from './LichTruc';
import LichTrucForm from './LichTrucForm';

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canCreateSchedule } = useCan({
    resource: 'access-schedules',
    action: 'create',
    params: { authority: $permissions.ADD_ACCESS_SCHEDULE },
  });

  const { data: canCreateWorkShift } = useCan({
    resource: 'work-shifts',
    action: 'create',
    params: { authority: $permissions.ADD_WORKING_TIME },
  });

  const hasCreateSchedulePermission =  canCreateSchedule?.can;
  const hasCreateWorkShiftPermission = canCreateWorkShift?.can;
  const hasAnyCreatePermission = hasCreateSchedulePermission || hasCreateWorkShiftPermission;

  const tabItems = [
    {
      key: '1',
      label: t('cau-hinh/ca-truc.tabs.schedule'),
      children: <LichTruc />,
    },
    {
      key: '2',
      label: t('cau-hinh/ca-truc.tabs.shifts'),
      children: <CaTruc />,
    },
  ];

  const {
    modalProps: createAccessScheduleModalProps,
    formProps: createAccessScheduleFormProps,
    show: showCreateAccessScheduleModal,
  } = useModalForm({
    resource: 'access-schedules',
    action: 'create',
  });

  const {
    modalProps: createWorkShiftModalProps,
    formProps: createWorkShiftFormProps,
    show: showCreateWorkShiftModal,
  } = useModalForm({
    resource: 'work-shifts',
    action: 'create',
  });

  return (
    <List
      title={t('cau-hinh/ca-truc.title')}
      headerButtons={() => (
        <div className='flex gap-2'>
          <Button type='primary' onClick={() => showCreateAccessScheduleModal()}>
            {t('cau-hinh/ca-truc.buttons.createSchedule')}
          </Button>

          <Button variant='outlined' color='primary' onClick={() => showCreateWorkShiftModal()}>
            {t('cau-hinh/ca-truc.buttons.addShift')}
          </Button>
        </div>
      )}
    >
      <Tabs items={tabItems} />

      <Modal
        {...createAccessScheduleModalProps}
        width={628}
        onCancel={(ev) => {
          createAccessScheduleModalProps?.onCancel?.(ev);
          createAccessScheduleFormProps?.form?.resetFields();
        }}
      >
        <LichTrucForm {...createAccessScheduleFormProps} />
      </Modal>

      <Modal
        {...createWorkShiftModalProps}
        width={800}
        onCancel={(ev) => {
          createWorkShiftModalProps?.onCancel?.(ev);
          createWorkShiftFormProps?.form?.resetFields();
        }}
      >
        <CaTrucForm {...createWorkShiftFormProps} />
      </Modal>
    </List>
  );
}
