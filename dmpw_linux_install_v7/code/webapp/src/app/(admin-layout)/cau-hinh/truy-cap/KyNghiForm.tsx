'use client';

import { useMemo } from 'react';
import { useOne, useTranslation } from '@refinedev/core';
import { CustomFormProps } from '@types';
import { Checkbox, DatePicker, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const FormItem = Form.Item;

export default function KyNghiForm({ formActionType, onFinish, ...formProps }: CustomFormProps) {
  const { translate: t } = useTranslation();
  const { data: defaultHoliday, isLoading: isLoadingHolidayType } = useOne<any>({
    resource: 'holidays',
    id: 0,
  });

  const holidayTypeOptions = useMemo(() => {
    if (!defaultHoliday) return [];

    return defaultHoliday.data.holidayTypeItems.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  }, [defaultHoliday]);

  const handleSubmit = (values: any) => {
    const { date, ...rest } = values;

    const formattedValues = {
      ...rest,
      companyId: 0,
      startDate: date[0].format('DD.MM.YYYY'),
      endDate: date[1].format('DD.MM.YYYY'),
    };

    if (formActionType === 'create') {
      onFinish?.([formattedValues]);
    } else {
      onFinish?.(formattedValues);
    }
  };

  return (
    <Form {...formProps} layout='vertical' onFinish={handleSubmit}>
      <div className='grid grid-cols-2 gap-6'>
        <FormItem label={t('cau-hinh/access-times.holidays.form.type')} name='type' initialValue={1}>
          <Select options={holidayTypeOptions} loading={isLoadingHolidayType} />
        </FormItem>

        <FormItem
          label={t('cau-hinh/access-times.holidays.form.name')}
          name='name'
          rules={[
            { required: true, whitespace: true, message: t('cau-hinh/access-times.holidays.form.nameRequired') },
            {
              max: 50,
              message: t('validation.maxLength', { max: 50, field: t('cau-hinh/access-times.holidays.form.name') }),
            },
          ]}
        >
          <Input placeholder={t('cau-hinh/access-times.holidays.form.namePlaceholder')} />
        </FormItem>
      </div>

      <FormItem label={t('cau-hinh/access-times.holidays.form.date')} name='date' initialValue={[dayjs(), dayjs()]}>
        <DatePicker.RangePicker className='w-full' format='DD/MM/YYYY' />
      </FormItem>

      <div className='grid grid-cols-2 gap-6'>
        <FormItem
          label={t('cau-hinh/access-times.holidays.form.remarks')}
          name='remarks'
          rules={[
            {
              max: 1000,
              message: t('validation.maxLength', {
                max: 1000,
                field: t('cau-hinh/access-times.holidays.form.remarks'),
              }),
            },
          ]}
        >
          <Input />
        </FormItem>

        <FormItem name='recursive' valuePropName='checked'>
          <Checkbox className='mt-8'>{t('cau-hinh/access-times.holidays.form.recursive')}</Checkbox>
        </FormItem>
      </div>
    </Form>
  );
}
