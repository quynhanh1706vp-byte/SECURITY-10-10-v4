'use client';

import React, { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { standardFullDateTimeFormat } from '@lib/datetime';
import { downloadFile, filterSelectOption } from '@lib/utils';
import { dataProvider } from '@providers/data-provider';
import { List, useModal } from '@refinedev/antd';
import { CanAccess, CrudFilter, useList, useNotification, useTranslation } from '@refinedev/core';
import { TBuilding, TInOutType, TVisitInitReport, TVisitReport } from '@types';
import { Avatar, Button, DatePicker, Input, Radio, Select, Table, TableColumnsType, TimeRangePickerProps } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { $permissions } from '@constants/permmission';

dayjs.extend(utc);

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, setFilters, handleSearch, filters, sorters } = useCustomTable<TVisitReport>({
    resource: 'visits/report',
    sorters: {
      initial: [{ field: 'accessTime', order: 'desc' }],
    },
    filters: {
      initial: [
        {
          field: 'from',
          operator: 'eq',
          value: dayjs().subtract(29, 'day').startOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
        },
        {
          field: 'to',
          operator: 'eq',
          value: dayjs().endOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
        },
      ],
    },
  });

  const columns: TableColumnsType<TVisitReport> = [
    {
      title: t('bao-cao/visit-report.columns.accessTime'),
      dataIndex: 'accessTime',
      key: 'accessTime',
      render: (value) => standardFullDateTimeFormat(value)
    },
    {
      title: t('bao-cao/visit-report.columns.doorName'),
      dataIndex: 'doorName',
      key: 'doorName',
    },
    {
      title: t('bao-cao/visit-report.columns.cardType'),
      dataIndex: 'cardType',
      key: 'cardType',
    },
    {
      title: t('bao-cao/visit-report.columns.inOut'),
      dataIndex: 'inOut',
      key: 'inOut',
    },
    {
      title: t('bao-cao/visit-report.columns.userName'),
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: TVisitReport) => (
        <>
          <Avatar
            src={record?.avatar ? record.avatar : undefined}
            icon={!record?.avatar && <UserOutlined />}
            size='small'
            style={{ marginRight: 8 }}
          />
          {text}
        </>
      ),
    },
    {
      title: t('bao-cao/visit-report.columns.inviter'),
      dataIndex: 'visiteeName',
      key: 'visiteeName',
    },
    {
      title: t('bao-cao/visit-report.columns.department'),
      dataIndex: 'visiteeDepartment',
      key: 'visiteeDepartment',
    },
    {
      title: t('bao-cao/visit-report.columns.approver'),
      dataIndex: 'approverName1',
      key: 'approverName1',
    },
    {
      title: t('bao-cao/visit-report.columns.eventType'),
      dataIndex: 'eventDetail',
      key: 'eventDetail',
    },
    {
      title: t('bao-cao/visit-report.columns.eventTime'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value) => (value ? standardFullDateTimeFormat(value) : ''),
    },
  ];

  const handleDateChange: TimeRangePickerProps['onChange'] = (dates) => {
    let newFilters: CrudFilter[] = [];

    if (dates && dates[0] && dates[1]) {
      const [start, end] = dates;

      newFilters = [
        { field: 'from', operator: 'eq', value: start.utc().format('DD.MM.YYYY HH:mm:ss') },
        { field: 'to', operator: 'eq', value: end.utc().format('DD.MM.YYYY HH:mm:ss') },
      ];
    } else {
      newFilters = [
        { field: 'from', operator: 'eq', value: undefined },
        { field: 'to', operator: 'eq', value: undefined },
      ];
    }

    setFilters(newFilters);
  };

  const { data: dataInit } = useList<TVisitInitReport>({
    resource: 'visits/report/init',
  });

  const buildingListOptions = React.useMemo(() => {
    if (!dataInit?.buildingList) return [];
    return dataInit.buildingList.map((item: TBuilding) => ({
      label: item.name,
      value: item.id,
    }));
  }, [dataInit?.buildingList]);

  const inOutListOptions = React.useMemo(() => {
    if (!dataInit?.inOutList) return [];
    return dataInit.inOutList.map((item: TInOutType) => ({
      label: item.name,
      value: item.id,
    }));
  }, [dataInit?.inOutList]);

  const handleBuildingListOptionsChange = (values: string[]) => {
    const newFilters: CrudFilter[] = [{ field: 'buildingIds', operator: 'in', value: values }];
    setFilters(newFilters);
  };

  const handleInOutListOptionsChange = (values: string[]) => {
    const newFilters: CrudFilter[] = [{ field: 'inOutType', operator: 'in', value: values }];
    setFilters(newFilters);
  };

  const { modalProps, show, close } = useModal();
  const { open } = useNotification();
  const [exportType, setExportType] = useState<'excel' | 'csv'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await dataProvider.custom({
        url: 'visits/report/export',
        method: 'get',
        filters,
        sorters,
        query: {
          exportType,
        },
        meta: {
          isDownload: true,
        },
      });

      downloadFile(
        response.data as Blob,
        `Visit_Report_${dayjs().format('DDMMYYYYhhmmss')}.${exportType === 'excel' ? 'xlsx' : 'csv'}`,
      );

      close();
    } catch (error: any) {
      open?.({
        message: error?.response?.data?.message || error?.response?.message || error?.message || t('bao-cao/visit-report.export.error'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <List
      title={t('bao-cao/visit-report.title')}
      headerButtons={() => (
        <CanAccess resource="visit-report" action='export' params={{ authority: $permissions.EXPORT_VISIT }}>
        <Button type='primary' onClick={() => show()}>
          {t('bao-cao/visit-report.export.button')}
        </Button>
        </CanAccess>
      )}
    >
      <div className='flex flex-wrap gap-4 py-3'>
        <div className='w-[320px]'>
          <Search placeholder={t('bao-cao/visit-report.placeholders.search')} onChange={handleSearch} />
        </div>
        <div>
          <RangePicker
            showTime
            className='w-[340px]'
            placeholder={[t('bao-cao/visit-report.placeholders.startTime'), t('bao-cao/visit-report.placeholders.endTime')]}
            onChange={handleDateChange}
            defaultValue={[dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')]}
          />
        </div>
        <div>
          <Select
            mode='multiple'
            maxTagCount={2}
            style={{ minWidth: 300 }}
            placeholder={t('bao-cao/visit-report.placeholders.building')}
            options={buildingListOptions}
            onChange={handleBuildingListOptionsChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
        <div>
          <Select
            mode='multiple'
            maxTagCount={2}
            style={{ minWidth: 300 }}
            placeholder={t('bao-cao/visit-report.placeholders.inOut')}
            options={inOutListOptions}
            onChange={handleInOutListOptionsChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
      </div>

      <div>
        <Table<TVisitReport>
          {...tableProps}
          rowKey='id'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 1600, y: '66vh' }}
        />
      </div>

      <Modal
        {...modalProps}
        title={t('bao-cao/visit-report.export.title')}
        okText={t('bao-cao/visit-report.export.download')}
        okButtonProps={{ loading: isExporting }}
        onOk={handleExport}
      >
        <div className='flex items-center gap-2'>
          <span>{t('bao-cao/visit-report.export.fileFormat')}</span>
          <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
            <Radio value='excel'>Excel</Radio>
            <Radio value='csv'>CSV</Radio>
          </Radio.Group>
        </div>
      </Modal>
    </List>
  );
}
