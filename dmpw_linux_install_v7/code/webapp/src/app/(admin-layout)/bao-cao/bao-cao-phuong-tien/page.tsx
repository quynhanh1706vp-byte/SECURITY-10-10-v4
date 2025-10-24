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
import { TBuilding, TInOutType, TVisitReport } from '@types';
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  Radio,
  Select,
  Table,
  Image,
  TableColumnsType,
  TimeRangePickerProps,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { $permissions } from '@constants/permmission';

dayjs.extend(utc);

const { Search } = Input;
const { RangePicker } = DatePicker;

type DataType = any;

export default function Page() {
  const { translate: t } = useTranslation();
  const { tableProps, setFilters, handleSearch, filters, sorters } = useCustomTable<TVisitReport>({
    resource: 'vehicle-eventlog',
    sorters: {
      initial: [{ field: 'eventTime', order: 'desc' }],
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

  const columns: TableColumnsType<DataType> = [
    {
      title: t('bao-cao/vehicle-report.columns.accessTime'),
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (value) => standardFullDateTimeFormat(value),
    },
    {
      title: t('bao-cao/vehicle-report.columns.accessPoint'),
      dataIndex: 'doorName',
      key: 'doorName',
    },
    {
      title: t('bao-cao/vehicle-report.columns.inOut'),
      dataIndex: 'inOut',
      key: 'inOut',
      width: 80,
    },
    {
      title: t('bao-cao/vehicle-report.columns.vehicleOwner'),
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      render: (text: string, record: TVisitReport) =>
        text && (
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
      title: t('bao-cao/vehicle-report.columns.object'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 200,
    },
    {
      title: t('bao-cao/vehicle-report.columns.licensePlate'),
      dataIndex: 'vehicleImage',
      key: 'vehicleImage',
      render: (text) => {
        let arr = text;
        if (typeof text === 'string') {
          try {
            arr = JSON.parse(text);
          } catch {
            return null;
          }
        }
        if (!Array.isArray(arr) || !arr[0]?.Link) return null;
        return <Image width={80} height={30} src={arr[0].Link} />;
      },
    },
    {
      title: t('bao-cao/vehicle-report.columns.vehicleType'),
      dataIndex: 'cardType',
      key: 'cardType',
      width: 80,
    },
    {
      title: t('bao-cao/vehicle-report.columns.model'),
      dataIndex: 'model',
      key: 'model',
      width: 80,
    },
    {
      title: t('bao-cao/vehicle-report.columns.color'),
      dataIndex: 'vehicleColor',
      key: 'vehicleColor',
      width: 80,
    },
    {
      title: t('bao-cao/vehicle-report.columns.eventType'),
      dataIndex: 'eventDetail',
      key: 'eventDetail',
    },
  ];

  const { data: dataInit } = useList<any>({
    resource: 'vehicle-eventlog/report/init',
  });

  const buildingListOptions = React.useMemo(() => {
    if (!dataInit?.itemLists?.buildingList) return [];
    return dataInit?.itemLists?.buildingList.map((item: TBuilding) => ({
      label: item.name,
      value: item.id,
    }));
  }, [dataInit?.itemLists?.buildingList]);

  const inOutListOptions = React.useMemo(() => {
    if (!dataInit?.itemLists?.inOutList) return [];
    return dataInit?.itemLists?.inOutList.map((item: TInOutType) => ({
      label: item.name,
      value: item.id,
    }));
  }, [dataInit?.itemLists?.inOutList]);

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
        url: 'vehicle-eventlog/export',
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
        `Vehicle_Report_${dayjs().format('DDMMYYYYhhmmss')}.${exportType === 'excel' ? 'xlsx' : 'csv'}`,
      );

      close();
    } catch (error: any) {
      open?.({
        message:
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          t('bao-cao/vehicle-report.export.error'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <List
      title={t('bao-cao/vehicle-report.title')}
      headerButtons={() => (
        <CanAccess resource='vehicle-eventlog' action='export' params={{ authority: $permissions.EXPORT_REPORT }}>
          <Button type='primary' onClick={() => show()}>
            {t('bao-cao/vehicle-report.export.button')}
          </Button>
        </CanAccess>
      )}
    >
      <div className='flex flex-wrap gap-4 py-3'>
        <div className='w-[320px]'>
          <Search placeholder={t('bao-cao/vehicle-report.placeholders.search')} onChange={handleSearch} />
        </div>
        <div>
          <RangePicker
            className='w-[340px]'
            placeholder={[
              t('bao-cao/vehicle-report.placeholders.startTime'),
              t('bao-cao/vehicle-report.placeholders.endTime'),
            ]}
            onChange={handleDateChange}
            showTime
            defaultValue={[dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')]}
          />
        </div>
        <div className='w-[300px]'>
          <Select
            mode='multiple'
            maxTagCount='responsive'
            style={{ width: 300 }}
            placeholder={t('bao-cao/vehicle-report.placeholders.building')}
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
            placeholder={t('bao-cao/vehicle-report.placeholders.inOut')}
            options={inOutListOptions}
            onChange={handleInOutListOptionsChange}
            showSearch
            filterOption={filterSelectOption}
          />
        </div>
      </div>

      <div>
        <Table<DataType>
          {...tableProps}
          rowKey='id'
          columns={columns}
          className='mt-2.5'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </div>

      <Modal
        {...modalProps}
        title={t('bao-cao/vehicle-report.export.title')}
        okText={t('bao-cao/vehicle-report.export.download')}
        okButtonProps={{ loading: isExporting }}
        onOk={handleExport}
      >
        <div className='flex items-center gap-2'>
          <span>{t('bao-cao/vehicle-report.export.fileFormat')}</span>
          <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
            <Radio value='excel'>Excel</Radio>
            <Radio value='csv'>CSV</Radio>
          </Radio.Group>
        </div>
      </Modal>
    </List>
  );
}
