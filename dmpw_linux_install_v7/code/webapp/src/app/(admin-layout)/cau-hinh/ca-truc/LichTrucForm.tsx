'use client';

import { useEffect, useMemo } from 'react';
import { useSelectInfinite, useTree } from '@hooks';
import { mergeOptions } from '@lib/utils';
import { useSelect } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { IUser } from '@types';
import { DatePicker, Form, FormProps, Input, Radio, Select, Tooltip, TreeSelect } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { InfoCircleOutlined } from '@ant-design/icons';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

export default function LichTrucForm(formProps: Omit<FormProps, 'children'>) {
  const { translate: t } = useTranslation();
  const scheduleType = Form.useWatch('scheduleType', formProps.form) || 'department';

  const initialValues = formProps.initialValues;

  useEffect(() => {
    if (initialValues && !initialValues?.departmentId) {
      formProps.form?.setFieldValue('scheduleType', 'event');
    }
  }, [initialValues]);

  const selectDefaultOptions = useMemo(() => {
    return {
      workShifts: initialValues?.workShifts?.map((workShift: any) => ({
        label: workShift.name,
        value: workShift.id,
      })),
      users: initialValues?.users?.map((user: any) => ({
        label: user.name,
        value: user.id,
      })),
    };
  }, [initialValues]);

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchDepartment,
  } = useTree({
    resource: 'departments/get-department-tree',
  });

  const { selectProps: workShiftSelectProps } = useSelect({
    resource: 'work-shifts',
    optionLabel: 'name',
    optionValue: 'id',
    onSearch: (value) => [{ field: 'search', operator: 'eq', value }],
  });

  const { selectProps: userSelectProps } = useSelectInfinite<IUser>({
    resource: 'users',
    optionLabel: 'firstName',
    optionValue: 'id',
    sorters: [
      {
        field: 'firstName',
        order: 'asc',
      },
    ],
  });

  const handleSubmit = (values: any) => {
    const { dateRange, ...rest } = values;

    const payload = {
      ...rest,
      userQuantity: rest.userIds.length,
      startTime: dateRange[0].format('DD.MM.YYYY'),
      endTime: dateRange[1].format('DD.MM.YYYY'),
    };

    formProps.onFinish?.(payload);
  };

  return (
    <Form {...formProps} layout='vertical' onFinish={handleSubmit}>
      <FormItem name='scheduleType' initialValue='department'>
        <RadioGroup>
          <Radio value='department'>{t('cau-hinh/ca-truc.form.schedule.types.department')}</Radio>
          <Radio value='event'>{t('cau-hinh/ca-truc.form.schedule.types.event')}</Radio>
        </RadioGroup>
      </FormItem>

      <div className='grid grid-cols-2 gap-6'>
        {scheduleType === 'department' && (
          <FormItem
            name='departmentId'
            label={t('cau-hinh/ca-truc.form.schedule.fields.department')}
            rules={[{ required: true, message: t('cau-hinh/ca-truc.form.schedule.validation.departmentRequired') }]}
          >
            <TreeSelect
              treeData={treeData?.data || []}
              fieldNames={{ label: 'departmentName', value: 'id' }}
              placeholder={t('cau-hinh/ca-truc.form.schedule.placeholders.department')}
              showSearch
              onSearch={handleSearchDepartment}
              filterTreeNode={false}
              styles={{
                popup: { root: { maxHeight: 400, overflow: 'auto' } },
              }}
              allowClear
              treeDefaultExpandAll
              loading={isFetching}
              className='min-w-[210px]'
            />
          </FormItem>
        )}

        <FormItem
          name='content'
          label={
            <span>
              {t('cau-hinh/ca-truc.form.schedule.fields.content')}
              <Tooltip
                title={t('validation.maxLength', {
                  max: 200,
                  field: t('cau-hinh/ca-truc.form.schedule.fields.content'),
                })}
              >
                <InfoCircleOutlined style={{ color: '#faad14', marginLeft: 6 }} />
              </Tooltip>
            </span>
          }
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('cau-hinh/ca-truc.form.schedule.validation.contentRequired'),
            },
            {
              max: 200,
              message: t('validation.maxLength', {
                max: 200,
                field: t('cau-hinh/ca-truc.form.schedule.fields.content'),
              }),
            },
          ]}
          className={clsx(scheduleType === 'event' && 'col-span-2')}
        >
          <Input placeholder={t('cau-hinh/ca-truc.form.schedule.placeholders.content')} />
        </FormItem>
      </div>

      <FormItem
        label={t('cau-hinh/ca-truc.form.schedule.fields.dateRange')}
        name='dateRange'
        initialValue={[dayjs(), dayjs()]}
        rules={[
          {
            required: true,
            message: t('cau-hinh/ca-truc.form.schedule.validation.dateRangeRequired'),
          },
        ]}
        className='mb-2'
      >
        <DatePicker.RangePicker allowClear={false} className='w-full' format='DD/MM/YYYY' />
      </FormItem>

      <div className='mb-4 text-xs text-[#868A8F]'>{t('cau-hinh/ca-truc.form.schedule.notes.dateRange')}</div>

      <div className='grid grid-cols-2 gap-6'>
        <FormItem
          name='workShiftIds'
          label={t('cau-hinh/ca-truc.form.schedule.fields.shifts')}
          rules={[
            {
              required: true,
              message: t('cau-hinh/ca-truc.form.schedule.validation.shiftsRequired'),
            },
          ]}
        >
          <Select
            {...workShiftSelectProps}
            options={mergeOptions(workShiftSelectProps.options, selectDefaultOptions.workShifts)}
            mode='multiple'
            maxTagCount={2}
            placeholder={t('cau-hinh/ca-truc.form.schedule.placeholders.shifts')}
          />
        </FormItem>

        <FormItem
          name='userIds'
          label={t('cau-hinh/ca-truc.form.schedule.fields.employees')}
          rules={[
            {
              required: true,
              message: t('cau-hinh/ca-truc.form.schedule.validation.employeesRequired'),
            },
          ]}
        >
          <Select
            {...userSelectProps}
            options={mergeOptions(userSelectProps.options, selectDefaultOptions.users)}
            mode='multiple'
            maxTagCount={2}
            placeholder={t('cau-hinh/ca-truc.form.schedule.placeholders.employees')}
          />
        </FormItem>
      </div>
    </Form>
  );
}
