'use client';
import React, { useMemo, useState } from 'react';
import Modal from '@components/ui/Modal';
import { useCustomTable } from '@hooks';
import { standardFullDateTimeFormat } from '@lib/datetime';
import { downloadFile, filterSelectOption } from '@lib/utils';
import { dataProvider } from '@providers/data-provider';
import { List, useModal, useSelect } from '@refinedev/antd';
import { CanAccess, CrudFilter, useNotification, useTranslation } from '@refinedev/core';
import { TSystemLog } from '@types';
import {
  Button,
  DatePicker,
  Input,
  Radio,
  Select,
  Table,
  TableColumnsType,
  TimeRangePickerProps,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidv4 } from 'uuid';
import { $permissions } from '@constants/permmission';
import TruncatedText from '@components/ui/TruncatedText';

dayjs.extend(utc);

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, setFilters, handleSearch, filters, sorters } = useCustomTable<TSystemLog>({
    resource: 'system-logs',
    sorters: {
      initial: [{ field: 'operationTime', order: 'desc' }],
    },
    filters: {
      initial: [
        {
          field: 'startDate',
          operator: 'eq',
          value: dayjs().subtract(29, 'day').startOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
        },
        { field: 'endDate', operator: 'eq', value: dayjs().endOf('day').utc().format('DD.MM.YYYY HH:mm:ss') },
      ],
    },
  });

  const { selectProps: typeListSelectProps } = useSelect({
    resource: 'system-logs/type-list',
    optionLabel: 'text',
    optionValue: 'value',
  });

  const { selectedObjectType, selectedActionType } = useMemo(() => {
    const selectedObjectType = filters.find(
      (filter) => filter.operator === 'eq' && filter.field === 'objectType',
    )?.value;
    const selectedActionType = filters.find(
      (filter) => filter.operator === 'eq' && filter.field === 'actionType',
    )?.value;

    return { selectedObjectType, selectedActionType };
  }, [filters]);

  const { selectProps: actionListSelectProps } = useSelect({
    resource: 'system-logs/action-list',
    optionLabel: 'text',
    optionValue: 'value',
    queryOptions: {
      enabled: !!selectedObjectType,
    },
    filters: [{ field: 'systemLogType', operator: 'eq', value: selectedObjectType }],
  });

  const columns: TableColumnsType<TSystemLog> = [
    {
      title: t('bao-cao/log.systemLogs.columns.operationTime'),
      dataIndex: 'operationTime',
      key: 'operationTime',
      render: (value) => standardFullDateTimeFormat(value),
    },
    {
      title: t('bao-cao/log.systemLogs.columns.userAccount'),
      dataIndex: 'userAccount',
      key: 'userAccount',
    },
    {
      title: t('bao-cao/log.systemLogs.columns.operationType'),
      dataIndex: 'operationType',
      key: 'operationType',
    },
    {
      title: t('bao-cao/log.systemLogs.columns.action'),
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: t('bao-cao/log.systemLogs.columns.message'),
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: t('bao-cao/log.systemLogs.columns.details'),
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (text: string) =>
        <TruncatedText maxWidth={500} tooltipMaxWidth={600}>
          {text}
        </TruncatedText>
    },
  ];
  const dataSources = tableProps.dataSource?.map((item) => ({
    ...item,
    uuid: item.uuid || uuidv4(),
  }));

  const handleDateChange: TimeRangePickerProps['onChange'] = (dates) => {
    let newFilters: CrudFilter[] = [];

    if (dates && dates[0] && dates[1]) {
      const [start, end] = dates;

      newFilters = [
        { field: 'startDate', operator: 'eq', value: start.utc().format('DD.MM.YYYY HH:mm:ss') },
        { field: 'endDate', operator: 'eq', value: end.utc().format('DD.MM.YYYY HH:mm:ss') },
      ];
    } else {
      newFilters = [
        { field: 'startDate', operator: 'eq', value: undefined },
        { field: 'endDate', operator: 'eq', value: undefined },
      ];
    }

    setFilters(newFilters);
  };

  const handleObjectTypeChange = (value: any) => {
    const newFilters: CrudFilter[] = [{ field: 'objectType', operator: 'eq', value }];

    if (value) {
      newFilters.push({ field: 'actionType', operator: 'eq', value: '' }); // empty string for all action types
    } else if (selectedActionType) {
      newFilters.push({ field: 'actionType', operator: 'eq', value: undefined });
    }

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
        url: 'system-logs/export',
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
        `System_Log_${dayjs().format('DDMMYYYYhhmmss')}.${exportType === 'excel' ? 'xlsx' : 'csv'}`,
      );

      close();
    } catch (error: any) {
      open?.({
        message:
          error?.response?.data?.message || error?.message || t('bao-cao/log.systemLogs.notifications.exportError'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <List
      title={t('bao-cao/log.systemLogs.title')}
      headerButtons={() => (
        <CanAccess resource='system-logs' action='export' params={{ authority: $permissions.EXPORT_SYSTEM_LOG }}>
          <Button type='primary' onClick={() => show()}>
            {t('bao-cao/log.systemLogs.export.title')}
          </Button>
        </CanAccess>
      )}
    >
      <div className='flex flex-wrap gap-4 py-3'>
        <div className='w-[320px]'>
          <Search placeholder={t('bao-cao/log.systemLogs.filters.search')} allowClear onChange={handleSearch} />
        </div>
        <div>
          <RangePicker
            showTime
            // allowClear
            className='w-[340px]'
            placeholder={[t('bao-cao/log.systemLogs.filters.startTime'), t('bao-cao/log.systemLogs.filters.endTime')]}
            onChange={handleDateChange}
            defaultValue={[dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')]}
          />
        </div>
        <div className='min-w-[300px]'>
          <Select
            {...typeListSelectProps}
            allowClear
            className='w-full'
            placeholder={t('bao-cao/log.systemLogs.filters.operationType')}
            onChange={handleObjectTypeChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
        <div className='min-w-[300px]'>
          <Select
            {...actionListSelectProps}
            value={selectedActionType}
            disabled={!selectedObjectType}
            className='w-full'
            placeholder={t('bao-cao/log.systemLogs.filters.actionType')}
            onChange={(value) => {
              setFilters([{ field: 'actionType', operator: 'eq', value }]);
            }}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
      </div>
      <div>
        <Table<TSystemLog>
          {...tableProps}
          rowSelection={undefined}
          dataSource={dataSources}
          rowKey='uuid'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </div>

      <Modal
        {...modalProps}
        title={t('bao-cao/log.systemLogs.export.title')}
        okText={t('bao-cao/log.systemLogs.export.okText')}
        okButtonProps={{ loading: isExporting }}
        onOk={handleExport}
      >
        <div className='flex items-center gap-2'>
          <span>{t('bao-cao/log.systemLogs.export.fileFormat')}</span>
          <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
            <Radio value='excel'>Excel</Radio>
            <Radio value='csv'>CSV</Radio>
          </Radio.Group>
        </div>
      </Modal>
    </List>
  );
}
