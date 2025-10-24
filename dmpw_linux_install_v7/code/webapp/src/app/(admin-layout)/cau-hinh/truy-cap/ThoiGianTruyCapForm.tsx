'use client';

import { useTranslation } from '@refinedev/core';
import { CustomFormProps, DayDetail, DayKeys } from '@types';
import { Button, Checkbox, CheckboxOptionType, Form, Input, TimePicker, Tooltip } from 'antd';
import { Dayjs } from 'dayjs';
import { InfoCircleOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

const ThoiGianTruyCapForm = ({ onFinish, ...formProps }: CustomFormProps) => {
  const { translate: t } = useTranslation();
  const selectedDays = Form.useWatch('days', formProps.form) || [];

  const dayOptions: CheckboxOptionType<DayKeys>[] = [
    { label: t('cau-hinh/access-times.accessTimes.days.monday'), value: 'monday' },
    { label: t('cau-hinh/access-times.accessTimes.days.tuesday'), value: 'tuesday' },
    { label: t('cau-hinh/access-times.accessTimes.days.wednesday'), value: 'wednesday' },
    { label: t('cau-hinh/access-times.accessTimes.days.thursday'), value: 'thursday' },
    { label: t('cau-hinh/access-times.accessTimes.days.friday'), value: 'friday' },
    { label: t('cau-hinh/access-times.accessTimes.days.saturday'), value: 'saturday' },
    { label: t('cau-hinh/access-times.accessTimes.days.sunday'), value: 'sunday' },
  ];

  const holidayOptions: CheckboxOptionType<DayKeys>[] = [
    { label: t('cau-hinh/access-times.accessTimes.days.holidayType1'), value: 'holidayType1' },
    { label: t('cau-hinh/access-times.accessTimes.days.holidayType2'), value: 'holidayType2' },
    { label: t('cau-hinh/access-times.accessTimes.days.holidayType3'), value: 'holidayType3' },
  ];

  type TimeRange = [Dayjs, Dayjs];

  const isOverlapping = (range1?: TimeRange | null, range2?: TimeRange | null) => {
    if (!range1 || !range2) return false;

    return range1[0].isBefore(range2[1]) && range2[0].isBefore(range1[1]);
  };

  const handleSubmit = (values: any) => {
    const { timeRanges, days, ...rest } = values;

    const timeConfig: Record<string, Array<{ from: number; to: number }>> = {
      monday: [{ from: 0, to: 0 }],
      tuesday: [{ from: 0, to: 0 }],
      wednesday: [{ from: 0, to: 0 }],
      thursday: [{ from: 0, to: 0 }],
      friday: [{ from: 0, to: 0 }],
      saturday: [{ from: 0, to: 0 }],
      sunday: [{ from: 0, to: 0 }],
      holidayType1: [{ from: 0, to: 0 }],
      holidayType2: [{ from: 0, to: 0 }],
      holidayType3: [{ from: 0, to: 0 }],
    };

    const formattedTimeRanges = timeRanges.reduce((acc: DayDetail[], range: TimeRange | null) => {
      if (!range) return acc;

      const [from, to] = range;

      const formattedTimeRange = {
        from: from.get('hour') * 60 + from.get('minute'),
        to: to.get('hour') * 60 + to.get('minute'),
      };

      acc.push(formattedTimeRange);

      return acc;
    }, []);

    days.forEach((day: DayKeys) => {
      timeConfig[day] = formattedTimeRanges;
    });

    const formattedValues = {
      ...rest,
      ...timeConfig,
    };

    onFinish?.(formattedValues);
  };

  return (
    <Form {...formProps} layout='vertical' onFinish={handleSubmit}>
      <div className='grid grid-cols-2 gap-6'>
        <FormItem
          label={
            <span>
              {t('cau-hinh/access-times.accessTimes.form.name')}
              <Tooltip
                title={t('validation.maxLength', { field: t('cau-hinh/access-times.accessTimes.form.name'), max: 50 })}
              >
                <InfoCircleOutlined className='!ml-1' style={{ color: '#faad14' }} />
              </Tooltip>
            </span>
          }
          name='name'
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('cau-hinh/access-times.accessTimes.validation.nameRequired'),
            },
            {
              max: 50,
              message: t('validation.maxLength', { field: t('cau-hinh/access-times.accessTimes.form.name'), max: 50 }),
            },
          ]}
        >
          <Input placeholder={t('cau-hinh/access-times.accessTimes.placeholders.name')} />
        </FormItem>

        <FormItem
          label={
            <span>
              {t('cau-hinh/access-times.accessTimes.form.remark')}
              <Tooltip
                title={t('validation.maxLength', {
                  field: t('cau-hinh/access-times.accessTimes.form.remark'),
                  max: 1000,
                })}
              >
                <InfoCircleOutlined className='!ml-1' style={{ color: '#faad14' }} />
              </Tooltip>
            </span>
          }
          name='remarks'
          rules={[
            {
              max: 1000,
              message: t('validation.maxLength', {
                field: t('cau-hinh/access-times.accessTimes.form.remark'),
                max: 1000,
              }),
            },
          ]}
        >
          <Input placeholder={t('cau-hinh/access-times.accessTimes.placeholders.remark')} />
        </FormItem>
      </div>

      <FormItem label={t('cau-hinh/access-times.accessTimes.form.selectDays')}>
        <div className='flex gap-1'>
          <Button
            size='small'
            variant='text'
            color='primary'
            onClick={() =>
              formProps.form?.setFieldValue(
                'days',
                Array.from(new Set([...selectedDays, ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday']])),
              )
            }
          >
            {t('cau-hinh/access-times.accessTimes.form.workdays')}
          </Button>
          <Button
            size='small'
            variant='text'
            color='primary'
            onClick={() =>
              formProps.form?.setFieldValue(
                'days',
                Array.from(new Set([...selectedDays, ...['holidayType1', 'holidayType2', 'holidayType3']])),
              )
            }
          >
            {t('cau-hinh/access-times.accessTimes.form.holidays')}
          </Button>

          <Button
            size='small'
            variant='text'
            color='primary'
            onClick={() =>
              formProps.form?.setFieldValue(
                'days',
                [...dayOptions, ...holidayOptions].map((option) => option.value),
              )
            }
          >
            {t('cau-hinh/access-times.accessTimes.form.selectAll')}
          </Button>

          {selectedDays.length > 0 && (
            <Button
              size='small'
              variant='text'
              color='primary'
              onClick={() => formProps.form?.setFieldValue('days', [])}
            >
              {t('cau-hinh/access-times.accessTimes.form.clearAll')}
            </Button>
          )}
        </div>

        <FormItem name='days' noStyle initialValue={[]}>
          <Checkbox.Group
            options={[...dayOptions, ...holidayOptions]}
            className='mt-4 grid grid-cols-7 gap-6 px-[7px]'
          ></Checkbox.Group>
        </FormItem>
      </FormItem>

      <div className='mb-4 text-[#00000073] italic'>{t('cau-hinh/access-times.accessTimes.form.noAccessNote')}</div>

      <Form.List
        name='timeRanges'
        initialValue={[null, null, null, null]}
        rules={[
          {
            validator: (_, value: Array<TimeRange | null>) => {
              for (let i = 0; i < value.length; i++) {
                for (let j = 0; j < value.length; j++) {
                  if (i !== j && isOverlapping(value[i], value[j])) {
                    return Promise.reject(
                      new Error(
                        t('cau-hinh/access-times.accessTimes.form.overlapError', {
                          i: i + 1,
                          j: j + 1,
                        }),
                      ),
                    );
                  }
                }
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, _, { errors }) => (
          <Form.Item>
            <div className='grid grid-cols-4 items-start gap-6'>
              {fields.map((field, index) => (
                <div key={field.key} className='border-secondary rounded-sm border p-2'>
                  <div className='text-center'>
                    {t('cau-hinh/access-times.accessTimes.form.rangeLabel', { index: index + 1 })}
                  </div>

                  <div className='mt-2 flex items-center gap-1'>
                    <FormItem
                      name={field.name}
                      rules={[
                        {
                          validator: (_, value: TimeRange) => {
                            if (value) {
                              const [from, to] = value;
                              if (from && to && from.isSame(to)) {
                                return Promise.reject(new Error(t('validation.timeRange.invalid')));
                              }
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                      className='mb-0'
                    >
                      <TimePicker.RangePicker
                        placeholder={['hh:mm', 'hh:mm']}
                        format='HH:mm'
                        suffixIcon={null}
                        minuteStep={10}
                      />
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>

            <Form.ErrorList errors={errors} />
          </Form.Item>
        )}
      </Form.List>
    </Form>
  );
};

export default ThoiGianTruyCapForm;
