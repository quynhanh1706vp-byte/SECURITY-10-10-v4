'use client';

import React, { useEffect, useState } from 'react';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { useCustomTable, useTree } from '@hooks';
import { List, useModal, useModalForm, useTable } from '@refinedev/antd';
import { CanAccess, useCan, useCustom, useNotification, useTranslation } from '@refinedev/core';
import { IDeviceReader, IEventLogReportInit } from '@types';
import { Badge, Button, Input, Select, Spin, Table, TableColumnsType, TreeSelect } from 'antd';
import { dataProvider } from '@providers/data-provider';
import { downloadFile } from '@lib/utils';
import LichSuThietBi from '../diem-kiem-soat/LichSuThietBi';
import Link from 'next/link';
import { $permissions } from '@constants/permmission';
import CameraForm from '@components/form/quan-ly-ra-vao/diem-kiem-soat/CameraForm';

const { Search } = Input;

export default function Page() {
  const { translate: t } = useTranslation();
  const {
    tableProps,
    filters,
    handleSearch,
    setFilters,
    tableQuery: { refetch, isRefetching },
  } = useCustomTable<IDeviceReader>({
    resource: 'device-readers',
  });

  const columns: TableColumnsType<IDeviceReader> = [
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.controlName'),
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <div>{record.name}</div>
          <div className='text-[0.9rem] text-gray-500'>{record.macAddress}</div>
        </div>
      ),
    },
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.deviceType'),
      dataIndex: 'deviceType',
    },
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.accessPointName'),
      dataIndex: 'deviceName',
    },
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.unit'),
      dataIndex: 'buildingName',
    },
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.connectionStatus'),
      dataIndex: 'status',
      render: (status) => {
        return (
          <Badge
            status={status ? 'success' : 'error'}
            text={
              status ? t('quan-ly-ra-vao/thiet-bi.status.connected') : t('quan-ly-ra-vao/thiet-bi.status.disconnected')
            }
          />
        );
      },
    },
    {
      title: t('quan-ly-ra-vao/thiet-bi.columns.actions'),
      key: 'action',
      render: (_, record) =>
        record.isCamera ? (
          <div className='flex items-center gap-1'>
            <CanAccess resource='device-readers' action='edit' params={{ authority: $permissions.EDIT_DEVICE_READER }}>
              {/* <Link href={`/quan-ly-ra-vao/diem-kiem-soat/${record.icuDeviceId}?tab=danh-sach-thiet-bi`}> */}
              <Button color='primary' type='link' size='small' onClick={() => showEditCamera(record.cameraId)}>
                {t('buttons.edit')}
              </Button>
              {/* </Link> */}
            </CanAccess>

            <Button
              color='primary'
              type='link'
              size='small'
              onClick={() => {
                showLichSu();
                setSelectedCamera(record);
              }}
            >
              {t('quan-ly-ra-vao/thiet-bi.buttons.history')}
            </Button>
          </div>
        ) : null,
    },
  ];

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  const { data: eventLogsInit } = useCustom<IEventLogReportInit>({
    url: 'event-logs/report/init',
    method: 'get',
  });

  const [isExporting, setIsExporting] = useState(false);
  const { open } = useNotification();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await dataProvider.custom({
        url: 'device-readers/export',
        method: 'get',
        filters,
        meta: {
          isDownload: true,
        },
      });

      downloadFile(response.data as Blob, 'Devices.xlsx');

      close();
    } catch (error: any) {
      open?.({
        message:
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          t('quan-ly-ra-vao/thiet-bi.export.error'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { modalProps: lichSuModalProps, show: showLichSu } = useModal();
  const [selectedCamera, setSelectedCamera] = useState<IDeviceReader>();

  const {
    modalProps: editCameraModalProps,
    show: showEditCamera,
    formProps: editCameraFormProps,
    formLoading: editCameraFormLoading,
  } = useModalForm({
    resource: 'cameras',
    action: 'edit',
    onMutationSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (editCameraFormProps?.initialValues?.icuId === 0) {
      editCameraFormProps.form?.setFieldValue('icuId', undefined);
    }
  }, [editCameraFormProps?.initialValues]);

  return (
    <List
      title={t('quan-ly-ra-vao/thiet-bi.title')}
      headerButtons={() => (
        <>
          <CanAccess action='export' params={{ authority: 'deviceReader.viewDeviceReader' }}>
            <Button type='primary' loading={isExporting} onClick={handleExport}>
              {t('quan-ly-ra-vao/thiet-bi.buttons.exportExcel')}
            </Button>
          </CanAccess>

          <Button type='primary' ghost icon={<ReloadOutlined />} onClick={() => refetch()}></Button>
        </>
      )}
    >
      <div>
        <div className='flex flex-wrap items-center gap-4'>
          <Search
            className='w-[210px]'
            placeholder={t('quan-ly-ra-vao/thiet-bi.placeholders.search')}
            onChange={handleSearch}
          />

          <TreeSelect
            treeData={treeData?.data || []}
            fieldNames={{ label: 'name', value: 'id' }}
            placeholder={t('quan-ly-ra-vao/thiet-bi.placeholders.unit')}
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
            onChange={(value) => setFilters([{ field: 'buildingIds', operator: 'in', value }])}
          />

          <Select
            options={eventLogsInit?.data?.doorList}
            fieldNames={{ label: 'name', value: 'id' }}
            placeholder={t('quan-ly-ra-vao/thiet-bi.placeholders.accessPoint')}
            allowClear
            mode='multiple'
            onChange={(value) => setFilters([{ field: 'deviceIds', operator: 'in', value }])}
            className='min-w-[210px]'
          />

          <Select
            className='w-[210px]'
            placeholder={t('quan-ly-ra-vao/thiet-bi.placeholders.connectionStatus')}
            allowClear
            options={[
              {
                value: 1,
                label: t('quan-ly-ra-vao/thiet-bi.status.connected'),
              },
              {
                value: 0,
                label: t('quan-ly-ra-vao/thiet-bi.status.disconnected'),
              },
            ]}
            onChange={(value) => setFilters([{ field: 'statusIds', operator: 'eq', value }])}
          />
        </div>
        <Table<IDeviceReader>
          {...tableProps}
          columns={columns}
          loading={tableProps.loading || isRefetching}
          rowSelection={undefined}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </div>

      <Modal
        {...lichSuModalProps}
        width={770}
        title={`${t('quan-ly-ra-vao/thiet-bi.modal.historyTitle')}: ${selectedCamera?.deviceType} (${selectedCamera?.name})`}
        centered
        cancelText={t('buttons.cancel')}
        okButtonProps={{
          hidden: true,
        }}
      >
        <LichSuThietBi id={selectedCamera?.cameraId} isCamera />
      </Modal>

      <Modal
        {...editCameraModalProps}
        width={580}
        onCancel={(e) => {
          editCameraModalProps.onCancel?.(e);
          editCameraFormProps.form?.resetFields();
        }}
      >
        <Spin spinning={editCameraFormLoading}>
          <CameraForm {...editCameraFormProps} />
        </Spin>
      </Modal>
    </List>
  );
}
