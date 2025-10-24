'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import ModalImportExcel from '@components/import/ModalImportExcel';
import DeleteButton from '@components/ui/DeleteButton';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { formatDateTime } from '@lib/datetime';
import { EditButton, List, useModal } from '@refinedev/antd';
import {
  CanAccess,
  CrudFilter,
  useCan,
  useCustom,
  useCustomMutation,
  useGetIdentity,
  useTranslation,
} from '@refinedev/core';
import { IKhachMoi, IUser, IVisitsInit } from '@types';
import {
  Avatar,
  Badge,
  Button,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Modal,
  Select,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import { TimeRangePickerProps } from 'antd/lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import DuyetKhachMoi from './duyet-khach-moi';
import { fileds } from './fileds';
import LichSuKhachMoi, { LichSuKhachMoiRef } from './LichSuKhachMoi';
import { $permissions } from '@constants/permmission';

dayjs.extend(utc);

const { Search } = Input;
const { RangePicker } = DatePicker;

type DataType = any;

export default function Page() {
  const { translate: t } = useTranslation();
  const router = useRouter();
  const { STATUS_COLOR_MAP, mapStatusData } = fileds();

  const {
    tableProps,
    selectedRowKeys,
    setFilters,
    handleSearch,
    handleDeleteSuccess,
    resetTable,
    tableQuery: { refetch, isRefetching },
  } = useCustomTable(
    {
      resource: 'visits',
      sorters: {
        initial: [
          {
            field: 'applyDate',
            order: 'asc',
          },
        ],
      },
      filters: {
        initial: [
          { field: 'startDateFrom', operator: 'eq', value: dayjs().startOf('day').utc().format('DD.MM.YYYY HH:mm:ss') },
          { field: 'endDateFrom', operator: 'eq', value: dayjs().endOf('day').utc().format('DD.MM.YYYY HH:mm:ss') },
        ],
      },
    },
    {
      searchFieldName: 'visitorName',
    },
  );

  const { data: initVisits } = useCustom<IVisitsInit>({
    url: 'visits/init',
    method: 'get',
  });

  const { show: showImportExcel, close: closeImportExcel, modalProps: importExcelModalProps } = useModal();
  const { show: showModalDuyet, close: closeModalDuyet, modalProps: ModalDuyetProps } = useModal();

  const selectOptions = useMemo(() => {
    return initVisits?.data?.visitStatus?.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  }, [initVisits?.data?.visitStatus]);

  const statusColorMap = useMemo(() => {
    if (!initVisits?.data?.visitStatus) {
      return STATUS_COLOR_MAP;
    }
    return mapStatusData(initVisits.data.visitStatus);
  }, [initVisits?.data?.visitStatus]);

  const accountApprover1 = useMemo(() => {
    return (id: string) => {
      return initVisits?.data?.accounts?.find((account) => account.id === Number(id))?.email || t('common.unknown');
    };
  }, [initVisits?.data?.visitTarget]);

  const handleDateChange: TimeRangePickerProps['onChange'] = (dates) => {
    let newFilters: CrudFilter[] = [];

    if (dates && dates[0] && dates[1]) {
      const [start, end] = dates;
      newFilters = [
        { field: 'startDateFrom', operator: 'eq', value: dayjs(start).utc().format('DD.MM.YYYY HH:mm:ss') },
        { field: 'endDateFrom', operator: 'eq', value: dayjs(end).utc().format('DD.MM.YYYY HH:mm:ss') },
      ];
    } else {
      newFilters = [
        { field: 'startDateFrom', operator: 'eq', value: undefined },
        { field: 'endDateFrom', operator: 'eq', value: undefined },
      ];
    }

    setFilters(newFilters);
  };

  const handleStatusChange = (value: any) => {
    const newFilters: CrudFilter[] = [{ field: 'processStatus', operator: 'eq', value }];

    if (value) {
      newFilters.push({ field: 'processStatus', operator: 'eq', value: '' }); // empty string for all action types
    }

    setFilters(newFilters);
  };

  const historyModalRef = useRef<LichSuKhachMoiRef>(null);

  const { data: user } = useGetIdentity<IUser>();

  const [selectedVisit, setSelectedVisit] = useState<IKhachMoi | null>(null);

  const { data: canAdd } = useCan({
    resource: 'visits',
    action: 'create',
    params: { authority: $permissions.ADD_VISIT },
  });

  const { data: canHistory } = useCan({
    resource: 'visits',
    action: 'history',
    params: { authority: $permissions.VIEW_HISTORY_VISIT },
  });

  const { data: canEdit } = useCan({
    resource: 'visits',
    action: 'edit',
    params: { authority: $permissions.EDIT_VISIT },
  });

  const { data: canDelete } = useCan({
    resource: 'visits',
    action: 'delete',
    params: { authority: $permissions.DELETE_VISIT },
  });

  const { data: canApprove } = useCan({
    resource: 'visits',
    action: 'approve',
    params: { authority: $permissions.APPROVE_VISIT },
  });

  const hasActionPermission = canEdit?.can || canDelete?.can || canApprove?.can;

  const columns: TableColumnsType<IKhachMoi> = [
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.name'),
      dataIndex: 'visitorName',
      key: 'visitorName',
      width: 200,
      render: (_: any, record) => (
        <div className='flex items-center gap-2 overflow-hidden'>
          <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} />
          <div className='flex-1 truncate'>{record.visitorName}</div>
        </div>
      ),
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.visitFrom'),
      dataIndex: 'startDate',
      width: 170,
      render: (value) => formatDateTime(value, 'DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.visitTo'),
      dataIndex: 'endDate',
      width: 170,
      render: (value) => formatDateTime(value, 'DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.hostPerson'),
      dataIndex: 'visiteeName',
      width: 150,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.department'),
      dataIndex: 'visitorDepartment',
      width: 150,
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.approver'),
      dataIndex: 'approver1',
      width: 170,
      ellipsis: true,
      render: (_: any, record) => accountApprover1(record.approver1),
    },
    {
      title: t('doi-tuong-ra-vao/khach-moi.columns.status'),
      dataIndex: 'statusCode',
      width: 170,
      render: (statusCode: number) => {
        const status =
          statusCode in statusColorMap
            ? statusColorMap[statusCode as keyof typeof statusColorMap]
            : { color: 'gray', text: t('common.unknown') };
        return <Badge color={status.color} text={status.text} />;
      },
    },
    ...(hasActionPermission
      ? [
          {
            title: t('doi-tuong-ra-vao/khach-moi.columns.actions'),
            key: 'actions',
            width: 150,
            render: (_: any, record: DataType) => (
              <div className='flex items-center gap-2'>
                <CanAccess action='approve' params={{ authority: $permissions.APPROVE_VISIT }}>
                  <Button
                    color='primary'
                    variant='text'
                    size='small'
                    disabled={record.statusCode !== 0 || accountApprover1(record.approver1) !== user?.username}
                    onClick={() => confirmDuyet(record)}
                  >
                    {t('doi-tuong-ra-vao/khach-moi.buttons.approve')}
                  </Button>
                </CanAccess>

                <EditButton
                  color='primary'
                  variant='text'
                  icon={null}
                  size='small'
                  resource='visits'
                  recordItemId={record.id}
                  accessControl={{ hideIfUnauthorized: true }}
                >
                  {t('doi-tuong-ra-vao/khach-moi.buttons.edit')}
                </EditButton>

                <Dropdown
                  menu={{
                    items: [
                      ...(canAdd?.can
                        ? [
                            {
                              key: 'copy',
                              label: t('doi-tuong-ra-vao/khach-moi.buttons.copy'),
                              onClick: () => router.push(`/doi-tuong-ra-vao/khach-moi/them-khach-moi?copyId=${record.id}`),
                            },
                          ]
                        : []),
                      ...(canHistory?.can
                        ? [
                            {
                              key: 'history',
                              label: t('doi-tuong-ra-vao/khach-moi.buttons.history'),
                              onClick: () => historyModalRef.current?.show(record.id),
                            },
                          ]
                        : []),
                      {
                        key: 'delete',
                        label: (
                          <DeleteButton
                            type='text'
                            className='!text-foreground static h-auto justify-start bg-transparent px-0 after:absolute after:inset-0'
                            resource='visits'
                            id={record.id}
                            onSuccess={() => handleDeleteSuccess(record.id)}
                            accessControl={{ hideIfUnauthorized: true }}
                          />
                        ),
                      },
                    ],
                  }}
                  placement='bottomLeft'
                  trigger={['click']}
                >
                  <Button color='primary' variant='text' icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleAddFromForm = () => {
    router.push('/doi-tuong-ra-vao/khach-moi/them-khach-moi');
  };

  const handleAddFromExcel = () => {
    showImportExcel();
  };

  const confirmDuyet = (record: DataType) => {
    setSelectedVisit(record);
    showModalDuyet();
  };

  const { mutate: duyetKhachMoi } = useCustomMutation();

  const handleApprove = (approved: boolean) => {
    duyetKhachMoi(
      {
        url: `visits/${selectedVisit?.id}/approved`,
        method: 'patch',
        values: {
          approved,
        },
        successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
        errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
      },
      {
        onSuccess: () => {
          closeModalDuyet();
          refetch();
        },
      },
    );
  };

  const handleImportSuccess = () => {
    refetch();
  };

  const dropdownMenu = (
    <Menu>
      <Menu.Item key='form' onClick={handleAddFromForm}>
        {t('doi-tuong-ra-vao/khach-moi.buttons.addFromForm')}
      </Menu.Item>
      <Menu.Item key='excel' onClick={handleAddFromExcel}>
        {t('doi-tuong-ra-vao/khach-moi.buttons.addFromExcel')}
      </Menu.Item>
    </Menu>
  );

  return (
    <List
      resource='visits'
      title={t('doi-tuong-ra-vao/khach-moi.title')}
      headerButtons={() => (
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='visits'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
              className='ml-auto'
              accessControl={{ hideIfUnauthorized: true }}
            />
          )}

          <CanAccess resource='visits' action='create' params={{ authority: $permissions.ADD_VISIT }}>
            <Dropdown overlay={dropdownMenu}>
              <Button type='primary'>{t('doi-tuong-ra-vao/khach-moi.buttons.addGuest')}</Button>
            </Dropdown>
          </CanAccess>
        </div>
      )}
    >
      <div className='flex gap-4 py-5'>
        <div className='w-[320px]'>
          <Search placeholder={t('doi-tuong-ra-vao/khach-moi.placeholders.search')} onChange={handleSearch} />
        </div>
        <div>
          <RangePicker
            className='w-[320px]'
            placeholder={[
              t('doi-tuong-ra-vao/khach-moi.placeholders.startDate'),
              t('doi-tuong-ra-vao/khach-moi.placeholders.endDate'),
            ]}
            showTime={{ format: 'HH:mm' }}
            format='DD/MM/YYYY HH:mm'
            defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}
            onChange={handleDateChange}
          />
        </div>
        <div className='w-[300px]'>
          <Select
            allowClear
            style={{ width: 300 }}
            placeholder={t('doi-tuong-ra-vao/khach-moi.placeholders.approvalStatus')}
            options={selectOptions}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      <Table<DataType>
        {...tableProps}
        rowSelection={canDelete?.can ? tableProps.rowSelection : undefined}
        loading={tableProps.loading || isRefetching}
        rowKey='id'
        columns={columns}
        className='mt-2.5'
        showSorterTooltip={false}
        scroll={{ y: '66vh', scrollToFirstRowOnChange: true }}
      />

      <Modal
        {...ModalDuyetProps}
        title={t('doi-tuong-ra-vao/khach-moi.modal.approveTitle')}
        width={800}
        footer={null}
        centered
      >
        <DuyetKhachMoi data={selectedVisit!} />

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button color='primary' variant='outlined' onClick={closeModalDuyet} style={{ marginRight: 8 }}>
            {t('doi-tuong-ra-vao/khach-moi.buttons.close')}
          </Button>

          <Button color='danger' variant='solid' onClick={() => handleApprove(false)} style={{ marginRight: 8 }}>
            {t('doi-tuong-ra-vao/khach-moi.buttons.reject')}
          </Button>

          <Button type='primary' onClick={() => handleApprove(true)}>
            {t('doi-tuong-ra-vao/khach-moi.buttons.approve')}
          </Button>
        </div>
      </Modal>

      <ModalImportExcel
        open={importExcelModalProps.open as boolean}
        onCancel={closeImportExcel}
        onSuccess={handleImportSuccess}
        fileName='Visit_Template'
        importUrl='visits/import'
        exampleUrl='visits/import-template'
        type='xlsx'
        title={t('doi-tuong-ra-vao/khach-moi.modal.importTitle')}
        width={500}
      />

      <LichSuKhachMoi ref={historyModalRef} />
    </List>
  );
}
