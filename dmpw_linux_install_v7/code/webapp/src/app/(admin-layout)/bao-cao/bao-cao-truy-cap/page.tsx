'use client';

import React, { useState } from 'react';
import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { standardFullDateTimeFormat } from '@lib/datetime';
import { downloadFile, filterSelectOption } from '@lib/utils';
import { dataProvider } from '@providers/data-provider';
import { List, useModal } from '@refinedev/antd';
import { CanAccess, CrudFilter, useList, useNotification, useTranslation } from '@refinedev/core';
import { TAccessFilterRequest, TBuilding, TEmployeeAccessReport, TInOutType } from '@types';
import {
  Button,
  DatePicker,
  Input,
  Radio,
  Select,
  Table,
  TableColumnsType,
  TimeRangePickerProps,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { $permissions } from '@constants/permmission';
import TruncatedText from '@components/ui/TruncatedText';

dayjs.extend(utc);

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, setFilters, handleSearch, filters, sorters } = useCustomTable<TEmployeeAccessReport>({
    resource: 'event-logs/report',
    sorters: {
      initial: [{ field: 'accessTime', order: 'desc' }],
    },
    filters: {
      initial: [
        {
          field: 'from',
          operator: 'eq',
          value: dayjs().subtract(29, 'day').startOf('day').format('DD.MM.YYYY HH:mm:ss'),
        },
        {
          field: 'to',
          operator: 'eq',
          value: dayjs().endOf('day').format('DD.MM.YYYY HH:mm:ss'),
        },
      ],
    },
  });

  const { data: dataInit } = useList<TAccessFilterRequest>({
    resource: 'event-logs/report/init',
  });

  const columns: TableColumnsType<TEmployeeAccessReport> = [
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.accessTime'),
      dataIndex: 'accessTime',
      key: 'accessTime',
      render: (value) => standardFullDateTimeFormat(value),
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.accessPoint'),
      dataIndex: 'doorName',
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.inOut'),
      dataIndex: 'inOut',
      key: 'inOut',
      width: 100,
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.userName'),
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.departmentName'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 200,
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.cardType'),
      dataIndex: 'cardType',
      width: 150,
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.cardId'),
      dataIndex: 'cardId',
      render: (text: string) => (
        <TruncatedText maxWidth={300} tooltipMaxWidth={400}>
          {text}
        </TruncatedText>
      ),
      width: 150,
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.eventType'),
      dataIndex: 'eventDetail',
      render: (text: string) => (
        <TruncatedText maxWidth={500} tooltipMaxWidth={600}>
          {text}
        </TruncatedText>
      ),
    },
    {
      title: t('bao-cao/truy-cap.employeeAccessReport.columns.building'),
      dataIndex: 'building',
    },
  ];

  const handleDateChange: TimeRangePickerProps['onChange'] = (dates) => {
    const newFilters: CrudFilter[] =
      dates?.[0] && dates?.[1]
        ? [
            {
              field: 'from',
              operator: 'eq',
              value: dates[0].utc().format('DD.MM.YYYY HH:mm:ss'),
            },
            {
              field: 'to',
              operator: 'eq',
              value: dates[1].utc().format('DD.MM.YYYY HH:mm:ss'),
            },
          ]
        : [
            { field: 'from', operator: 'eq', value: undefined },
            { field: 'to', operator: 'eq', value: undefined },
          ];

    setFilters(newFilters);
  };

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

  const handleInOutListOptionsChange = (values: string[]) => {
    const newFilters: CrudFilter[] = [{ field: 'inOutType', operator: 'in', value: values }];
    setFilters(newFilters);
  };

  const handleBuildingListOptionsChange = (values: string[]) => {
    const newFilters: CrudFilter[] = [{ field: 'buildingIds', operator: 'in', value: values }];
    setFilters(newFilters);
  };

  const { modalProps, show, close } = useModal();
  const { open } = useNotification();
  const [exportType, setExportType] = useState<'excel' | 'csv' | 'hancell'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await dataProvider.custom({
        url: 'event-logs/report/export',
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
        `Event_Log_${dayjs().format('DDMMYYYYhhmmss')}.${exportType === 'excel' ? 'xlsx' : 'csv'}`,
      );

      close();
    } catch (error: any) {
      open?.({
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('bao-cao/truy-cap.employeeAccessReport.notifications.exportError'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <List
      title={t('bao-cao/truy-cap.employeeAccessReport.title')}
      headerButtons={() => (
        <CanAccess resource='access-report' action='export' params={{ authority: $permissions.EXPORT_REPORT }}>
          <Button type='primary' onClick={() => show()}>
            {t('bao-cao/truy-cap.employeeAccessReport.export.title')}
          </Button>
        </CanAccess>
      )}
    >
      <div className='flex flex-wrap gap-4 py-5'>
        <div className='w-[320px]'>
          <Search placeholder={t('bao-cao/truy-cap.employeeAccessReport.filters.search')} onChange={handleSearch} />
        </div>
        <div>
          <RangePicker
            showTime
            className='w-[340px]'
            placeholder={[
              t('bao-cao/truy-cap.employeeAccessReport.filters.startTime'),
              t('bao-cao/truy-cap.employeeAccessReport.filters.endTime'),
            ]}
            onChange={handleDateChange}
            defaultValue={[dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')]}
          />
        </div>
        <div className='w-[300px]'>
          <Select
            mode='multiple'
            maxTagCount='responsive'
            style={{ width: 300 }}
            placeholder={t('bao-cao/truy-cap.employeeAccessReport.filters.unit')}
            options={buildingListOptions}
            onChange={handleBuildingListOptionsChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
        <div className='w-[300px]'>
          <Select
            mode='multiple'
            maxTagCount='responsive'
            style={{ width: 300 }}
            placeholder={t('bao-cao/truy-cap.employeeAccessReport.filters.inOut')}
            options={inOutListOptions}
            onChange={handleInOutListOptionsChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
      </div>

      <div>
        <Table<TEmployeeAccessReport>
          {...tableProps}
          rowKey='id'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </div>

      <Modal
        {...modalProps}
        title={t('bao-cao/truy-cap.employeeAccessReport.export.title')}
        okText={t('bao-cao/truy-cap.employeeAccessReport.export.okText')}
        okButtonProps={{ loading: isExporting }}
        onOk={handleExport}
      >
        <div className='flex items-center gap-2'>
          <span>{t('bao-cao/truy-cap.employeeAccessReport.export.fileFormat')}</span>
          <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
            <Radio value='excel'>Excel</Radio>
            <Radio value='csv'>CSV</Radio>
            <Radio value='hancell'>Hancell</Radio>
          </Radio.Group>
        </div>
      </Modal>
    </List>
  );
}
