'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getValueFromEvent } from '@refinedev/antd';
import { file2Base64, useCustom, useTranslate } from '@refinedev/core';
import { TUser, TUserInit } from '@types';
import { Button, Col, DatePicker, Form, FormProps, Input, Row, Select, Spin, Switch, Upload } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const FormItem = Form.Item<TUser>;

interface ThongTinChungFormProps {
  formProps: FormProps;
}

export default function ThongTinChungForm({ formProps }: ThongTinChungFormProps) {
  const t = useTranslate();
  const isEditMode = !!formProps.initialValues;
  const [initialLoading, setInitialLoading] = useState(true);

  const { data: userInitRes, isLoading: isLoadingUserInit } = useCustom<TUserInit>({
    url: 'users/init',
    method: 'get',
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
  });

  const userInit = useMemo(() => userInitRes?.data, [userInitRes]);

  const { data: userDefault, isLoading: isLoadingUserDefault } = useCustom<TUser>({
    url: 'users/0',
    method: 'get',
    queryOptions: {
      enabled: !isEditMode, // Only call when creating new user
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (formProps.initialValues) {
      return;
    }

    setTimeout(() => {
      formProps.form?.setFieldsValue({
        userCode: userDefault?.data?.userCode,
        departmentId: userDefault?.data?.departmentId,
        workType: userDefault?.data?.workType,
        gender: userDefault?.data?.gender || 0,
        status: 1,
      });
    }, 0);

    setImageUrl(userDefault?.data?.avatar);
  }, [userDefault?.data]);

  useEffect(() => {
    if (formProps.initialValues) {
      setImageUrl(formProps.initialValues?.avatar);
    }
  }, [formProps.initialValues]);

  const [imageUrl, setImageUrl] = useState<string>();

  const uploadImage = Form.useWatch('uploadImage', formProps.form);

  useEffect(() => {
    if (uploadImage?.[0]) {
      file2Base64(uploadImage[0]).then((base64String) => {
        setImageUrl(base64String);
      });
    }
  }, [uploadImage]);

  const handleSubmit = async (values: any) => {
    const { uploadImage } = values;

    const file = uploadImage?.[0];
    let base64String = undefined;

    if (file?.originFileObj) {
      base64String = await file2Base64(file);
    }

    formProps.onFinish?.({
      ...(formProps.initialValues || userDefault?.data),
      ...values,
      avatar: base64String || formProps.initialValues?.avatar || userDefault?.data?.avatar,
      birthDay: values.birthDay?.startOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
      effectiveDate: values.effectiveDate?.startOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
      expiredDate: values.expiredDate?.endOf('day').utc().format('DD.MM.YYYY HH:mm:ss'),
      status: values.status ? 0 : 1,
      gender: !!values.gender,
    });
  };

  const isLoading = initialLoading || isLoadingUserInit || (!isEditMode && isLoadingUserDefault);

  return (
    <Spin spinning={isLoading} tip={t('common.loadingData')}>
      <Form {...formProps} layout='vertical' onFinish={handleSubmit}>
        <Row gutter={24}>
          {/* Ảnh nhân viên */}
          <Col span={4}>
            <FormItem
              name='uploadImage'
              valuePropName='fileList'
              getValueFromEvent={getValueFromEvent}
              className='mb-0'
            >
              <Upload
                listType='picture-card'
                beforeUpload={() => false}
                showUploadList={false}
                maxCount={1}
                accept='image/*'
                className='[&_.ant-upload]:aspect-square [&_.ant-upload]:h-full [&_.ant-upload]:w-full'
              >
                {imageUrl ? (
                  <Image src={imageUrl} alt='image' width={200} height={200} className='h-full w-full object-cover' />
                ) : (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {t('doi-tuong-ra-vao/nhan-vien.form.uploadImage')}
                    </div>
                  </div>
                )}
              </Upload>
            </FormItem>
          </Col>
          {/* Thông tin chung */}
          <Col span={20}>
            <div className='grid grid-cols-3 gap-4'>
              {/* <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.employeeCode')}
                name='userCode'
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: t('doi-tuong-ra-vao/nhan-vien.form.validation.employeeCode'),
                  },
                  {
                    max: 100,
                    message: t('validation.maxLength', {
                      max: 100,
                      field: t('doi-tuong-ra-vao/nhan-vien.form.fields.employeeCode'),
                    }),
                  },
                  noSpecialCharsRule(t('doi-tuong-ra-vao/nhan-vien.form.validation.noSpecialChars')),
                ]}
              >
                <Input
                  placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.employeeCode')}
                  disabled={isEditMode}
                />
              </FormItem> */}

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.employeeName')}
                name='firstName'
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: t('doi-tuong-ra-vao/nhan-vien.form.validation.employeeName'),
                  },
                  {
                    max: 100,
                    message: t('validation.maxLength', {
                      max: 100,
                      field: t('doi-tuong-ra-vao/nhan-vien.form.fields.employeeName'),
                    }),
                  },
                ]}
              >
                <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.employeeName')} />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.birthDate')}
                name='birthDay'
                // rules={[
                //   {
                //     validator: (_, value) => {
                //       if (value && value.isAfter()) {
                //         return Promise.reject(t('validation.birthDayInPast', { field: t('doi-tuong-ra-vao/nhan-vien.form.fields.birthDate') }) );
                //       }
                //       return Promise.resolve();
                //     },
                //   },
                // ]}
              >
                <DatePicker
                  className='w-full'
                  placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.birthDate')}
                  format='DD/MM/YYYY'
                  disabledDate={(current) => current && current >= dayjs().startOf('day')}
                />
              </FormItem>

              <FormItem label={t('doi-tuong-ra-vao/nhan-vien.form.fields.gender')} name='gender'>
                <Select
                  options={userInit?.genders}
                  fieldNames={{ label: 'name', value: 'id' }}
                  placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.gender')}
                />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.phone')}
                name='homePhone'
                rules={[
                  {
                    max: 20,
                    message: t('validation.maxLength', {
                      max: 20,
                      field: t('doi-tuong-ra-vao/nhan-vien.form.fields.phone'),
                    }),
                  },
                  {
                    pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/,
                    message: t('doi-tuong-ra-vao/nhan-vien.form.validation.phoneFormat'),
                  },
                ]}
              >
                <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.phone')} />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.email')}
                name='email'
                rules={[
                  { type: 'email', message: t('doi-tuong-ra-vao/nhan-vien.form.validation.emailFormat') },
                  {
                    max: 50,
                    message: t('validation.maxLength', {
                      max: 50,
                      field: t('doi-tuong-ra-vao/nhan-vien.form.fields.email'),
                    }),
                  },
                ]}
              >
                <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.email')} />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.department')}
                name='departmentId'
                rules={[{ required: true, message: t('doi-tuong-ra-vao/nhan-vien.form.validation.department') }]}
              >
                <Select
                  options={userInit?.departments}
                  fieldNames={{ label: 'name', value: 'id' }}
                  placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.department')}
                  showSearch
                  optionFilterProp='name'
                />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.position')}
                name='position'
                rules={[
                  {
                    max: 100,
                    message: t('validation.maxLength', {
                      max: 100,
                      field: t('doi-tuong-ra-vao/nhan-vien.form.fields.position'),
                    }),
                  },
                ]}
              >
                <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.position')} />
              </FormItem>

              <FormItem
                label={t('doi-tuong-ra-vao/nhan-vien.form.fields.active')}
                name='status'
                valuePropName='checked'
              >
                <Switch checkedChildren='ON' unCheckedChildren='OFF' />
              </FormItem>
            </div>
          </Col>
        </Row>

        <div className='bg-background -mx-3 h-2'></div>

        {/* Thời gian ra vào */}
        <div>
          <div className='-mx-2 border-b p-2 text-[16px] leading-6 font-medium'>
            {t('doi-tuong-ra-vao/nhan-vien.form.sections.accessTime')}
          </div>

          <div className='py-2'>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem
                  label={t('doi-tuong-ra-vao/nhan-vien.form.fields.workType')}
                  name='workType'
                  rules={[
                    {
                      required: true,
                      message: t('doi-tuong-ra-vao/nhan-vien.form.validation.workType'),
                    },
                  ]}
                >
                  <Select
                    options={userInit?.workTypes}
                    fieldNames={{ label: 'name', value: 'id' }}
                    placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.workType')}
                  ></Select>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={t('doi-tuong-ra-vao/nhan-vien.form.fields.effectiveDate')}
                  name='effectiveDate'
                  rules={[
                    {
                      required: true,
                      message: t('doi-tuong-ra-vao/nhan-vien.form.validation.effectiveDate'),
                    },
                    {
                      validator: (_, value, callback) => {
                        const expiredDate = formProps.form?.getFieldValue('expiredDate');
                        if (value && expiredDate && value >= expiredDate) {
                          callback(t('doi-tuong-ra-vao/nhan-vien.form.validation.effectiveDateBeforeExpired'));
                        }
                        callback();
                      },
                    },
                  ]}
                  dependencies={['expiredDate']}
                  initialValue={dayjs()}
                >
                  <DatePicker
                    className='w-full'
                    placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.effectiveDate')}
                    format='DD/MM/YYYY'
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={t('doi-tuong-ra-vao/nhan-vien.form.fields.expiredDate')}
                  name='expiredDate'
                  rules={[
                    {
                      required: true,
                      message: t('doi-tuong-ra-vao/nhan-vien.form.validation.expiredDate'),
                    },
                    {
                      validator: (_, value, callback) => {
                        if (value && value < formProps.form?.getFieldValue('effectiveDate')) {
                          callback(t('doi-tuong-ra-vao/nhan-vien.form.validation.expiredDateAfterEffective'));
                        }
                        if (value && value.year() > 9999) {
                          callback(t('doi-tuong-ra-vao/nhan-vien.form.validation.expiredDateMaxYear'));
                        }
                        callback();
                      },
                    },
                  ]}
                  dependencies={['effectiveDate']}
                  initialValue={dayjs('30/12/9999', 'DD/MM/YYYY')}
                >
                  <DatePicker
                    className='w-full'
                    placeholder={t('doi-tuong-ra-vao/nhan-vien.form.placeholders.expiredDate')}
                    format='DD/MM/YYYY'
                  />
                </FormItem>
              </Col>
            </Row>
          </div>
        </div>

        <div className='bg-background -mx-3 h-2'></div>

        <div className='flex justify-end gap-2 pt-3'>
          <Link href={`/doi-tuong-ra-vao/nhan-vien/`}>
            <Button>{t('buttons.cancel')}</Button>
          </Link>

          <Button type='primary' htmlType='submit'>
            {t('buttons.save')}
          </Button>
        </div>
      </Form>
    </Spin>
  );
}
