'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTree } from '@hooks';
import { getValueFromEvent, useForm } from '@refinedev/antd';
import { file2Base64, useTranslation } from '@refinedev/core';
import { Button, Col, Form, Input, InputNumber, Row, Select, Spin, Switch, Tooltip, TreeSelect, Upload } from 'antd';

import { IDevice, IDeviceFormValues } from '@/types';

const FormItem = Form.Item<IDeviceFormValues>;

export default function DiemKiemSoatForm() {
  const {id} = useParams<{ id: string }>();
  const { translate: t } = useTranslation();

  // Use '0' as default id for create mode, which makes the API call to devices/0
  const deviceId = id || '0';
  const action = id ? 'edit' : 'create';

  const {
    query: { data: treeData, isFetching },
    handleSearch: handleSearchBuilding,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  // Use internal useForm hook - always pass id (either real id or '0' for create)
  const { formProps, query, mutation } = useForm<IDeviceFormValues>({
    resource: 'devices',
    action,
    id: deviceId,
    redirect: 'list',
  });

  const deviceData = query?.data?.data as IDevice | undefined;

  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (deviceData?.image) {
      setImageUrl(deviceData.image);
    }
  }, [deviceData?.image]);

  const uploadImage = Form.useWatch<IDeviceFormValues['uploadImage']>('uploadImage', formProps.form);

  useEffect(() => {
    if (uploadImage?.[0]) {
      file2Base64(uploadImage[0]).then((base64String) => {
        setImageUrl(base64String);
      });
    }
  }, [uploadImage]);

  const handleSubmit = async (values: IDeviceFormValues) => {
    const { uploadImage, ...restValues } = values;

    const file = uploadImage?.[0];
    let base64String = undefined;

    if (file?.originFileObj) {
      base64String = await file2Base64(file);
    }

    formProps.onFinish?.({
      ...restValues,
      image: base64String || deviceData?.image,
      companyId: deviceData?.companyId || 0,
    } as any);
  };

  return (
    <Spin spinning={query?.isLoading}>
      <Form
        {...formProps}
        layout='vertical'
        className='flex flex-col gap-2'
        onFinish={(values) => handleSubmit(values as IDeviceFormValues)}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <FormItem
              label={t('devices.form.labels.deviceImage')}
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
                className='!max-h-[300px] !max-w-[300px] [&_.ant-upload]:aspect-square [&_.ant-upload]:h-full [&_.ant-upload]:w-full'
              >
                {imageUrl ? (
                  <Image src={imageUrl} alt='image' width={200} height={200} className='h-full w-full object-cover' />
                ) : (
                  <div>
                    <PlusOutlined className='mb-2 text-[14px]' />
                    <div className='text-center text-[#00000073]'>
                      {t('devices.form.placeholders.uploadDeviceImage')}
                    </div>
                  </div>
                )}
              </Upload>
            </FormItem>
          </Col>

          <Col xs={24} sm={24} md={16} lg={16}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <FormItem
                  label={t('devices.form.labels.deviceName')}
                  name='doorName'
                  rules={[
                    { required: true, whitespace: true, message: t('devices.form.validation.deviceNameRequired') },
                    {
                      max: 100,
                      message: t('validation.maxLength', { field: t('devices.form.labels.deviceName'), max: 100 }),
                    },
                  ]}
                >
                  <Input placeholder={t('devices.form.placeholders.enterDeviceName')} />
                </FormItem>
              </Col>

              <Col xs={24} sm={12}>
                <FormItem label={t('devices.form.labels.unit')} name='buildingId'>
                  <TreeSelect
                    treeData={treeData?.data || []}
                    fieldNames={{ label: 'name', value: 'id' }}
                    placeholder={t('devices.form.placeholders.selectUnit')}
                    allowClear
                    showSearch
                    onSearch={handleSearchBuilding}
                    filterTreeNode={false}
                    styles={{
                      popup: { root: { maxHeight: 400, overflow: 'auto' } },
                    }}
                    treeDefaultExpandAll
                    loading={isFetching}
                    className='min-w-[210px]'
                  />
                </FormItem>
              </Col>

              <Col xs={24} sm={12}>
                <FormItem
                  label={t('devices.form.labels.operationMode')}
                  name='operationType'
                  rules={[{ required: true, message: t('devices.form.validation.operationModeRequired') }]}
                >
                  <Select
                    options={deviceData?.operationTypeItems || []}
                    fieldNames={{ label: 'name', value: 'id' }}
                    placeholder={t('devices.form.placeholders.selectOperationMode')}
                  />
                </FormItem>
              </Col>

              <Col xs={24} sm={12}>
                <FormItem
                  label={t('devices.form.labels.controlTimeframe')}
                  name='activeTimezoneId'
                  rules={[
                    {
                      required: true,
                      message: t('devices.form.validation.controlTimeframeRequired'),
                    },
                  ]}
                >
                  <Select
                    options={deviceData?.activeTimezoneItems || []}
                    fieldNames={{ label: 'name', value: 'id' }}
                    placeholder={t('devices.form.placeholders.selectControlTimeframe')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem
                  label={t('devices.form.labels.checkMode')}
                  name='verifyMode'
                  rules={[{ required: true, message: t('devices.form.validation.checkModeRequired') }]}
                >
                  <Select
                    options={deviceData?.verifyModeItems || []}
                    fieldNames={{ label: 'name', value: 'id' }}
                    placeholder={t('devices.form.placeholders.selectCheckMode')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={12}>
                <FormItem label={t('devices.form.labels.dependentDevices')} name='dependentDoors'>
                  <Select
                    placeholder={t('devices.form.placeholders.selectDependentDevices')}
                    options={deviceData?.dependentDoorsIds || []}
                    fieldNames={{ label: 'name', value: 'id' }}
                    mode='multiple'
                    optionFilterProp='name'
                  />
                </FormItem>
              </Col>
            </Row>
          </Col>
        </Row>

        <h3 className='border-b py-4 text-base font-medium text-gray-800'>{t('devices.form.labels.mainDeviceInfo')}</h3>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.ipAddress')}
              name='ipAddress'
            >
              <Input placeholder={t('devices.form.placeholders.enterIpAddress')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.macAddress')}
              name='macAddress'
            >
              <Input placeholder={t('devices.form.placeholders.enterMacAddress')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.serverIp')}
              name='serverIp'
            >
              <Input placeholder={t('devices.form.placeholders.enterServerIp')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={
                <span>
                  {t('devices.form.labels.serverPort')}{' '}
                  <Tooltip title={t('devices.form.tooltips.serverPort')}>
                    <QuestionCircleOutlined className='text-yellow-500 ml-1' />
                  </Tooltip>
                </span>
              }
              name='serverPort'
            >
              <InputNumber max={65535} className='w-full' placeholder={t('devices.form.placeholders.enterServerPort')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.deviceAddress')}
              name='deviceAddress'
              rules={[
                { required: true, whitespace: true, message: t('devices.form.validation.deviceAddressRequired') },
                { max: 20, message: t('validation.maxLength', { field: t('devices.form.labels.deviceAddress'), max: 20 }) },
              ]}
            >
              <Input placeholder={t('devices.form.placeholders.enterDeviceAddress')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.deviceType')} name='deviceType'>
              <Select
                options={deviceData?.deviceTypeItems || []}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder={t('devices.form.placeholders.selectDeviceType')}
                showSearch
                optionFilterProp='name'
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.passback')} name='passback'>
              <Select
                options={deviceData?.passbackItems || []}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder={t('devices.form.placeholders.selectPassback')}
                showSearch
                optionFilterProp='name'
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.sensorType')} name='sensorType'>
              <Select
                options={deviceData?.sensorTypeItems || []}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder={t('devices.form.placeholders.selectSensorType')}
                showSearch
                optionFilterProp='name'
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.bioStationMode')} name='bioStationMode'>
              <Select
                options={deviceData?.bioStationModeItems || []}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder={t('devices.form.placeholders.selectBioStationMode')}
                showSearch
                optionFilterProp='name'
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.lockOpenDuration')}
              name='lockOpenDuration'
              rules={[{ required: true, message: t('devices.form.validation.lockOpenDurationRequired') }]}
            >
              <InputNumber
                min={1}
                max={254}
                className='w-full'
                placeholder={t('devices.form.placeholders.lockOpenDuration')}
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.maxOpenDuration')} name='maxOpenDuration'>
              <InputNumber
                min={1}
                max={254}
                className='w-full'
                placeholder={t('devices.form.placeholders.maxOpenDuration')}
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem label={t('devices.form.labels.sensorDuration')} name='sensorDuration'>
              <InputNumber
                min={1}
                max={254}
                className='w-full'
                placeholder={t('devices.form.placeholders.sensorDuration')}
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.mprCount')}
              name='mprCount'
              rules={[{ required: true, message: t('devices.form.validation.mprCountRequired') }]}
            >
              <InputNumber min={1} max={10} className='w-full' placeholder={t('devices.form.placeholders.mprCount')} />
            </FormItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FormItem
              label={t('devices.form.labels.mprInterval')}
              name='mprInterval'
              rules={[{ required: true, message: t('devices.form.validation.mprIntervalRequired') }]}
            >
              <InputNumber min={1} max={180} className='w-full' placeholder={t('devices.form.placeholders.mprInterval')} />
            </FormItem>
          </Col>
        </Row>

        {/* Các switch */}
        <Row gutter={16} className='mt-4'>
          <Col xs={12} sm={8} md={4}>
            <FormItem label={t('devices.form.labels.deviceBuzzer')} name='deviceBuzzer' valuePropName='checked'>
              <Switch checkedChildren='ON' unCheckedChildren='OFF' />
            </FormItem>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <FormItem label={t('devices.form.labels.alarm')} name='alarm' valuePropName='checked'>
              <Switch checkedChildren='ON' unCheckedChildren='OFF' />
            </FormItem>
          </Col>
          <Col xs={12} sm={8} md={5}>
            <FormItem label={t('devices.form.labels.useAlarmRelay')} name='useAlarmRelay' valuePropName='checked'>
              <Switch checkedChildren='ON' unCheckedChildren='OFF' />
            </FormItem>
          </Col>
          <Col xs={12} sm={8} md={5}>
            <FormItem label={t('devices.form.labels.closeReverseLock')} name='closeReverseLock' valuePropName='checked'>
              <Switch checkedChildren='ON' unCheckedChildren='OFF' />
            </FormItem>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <FormItem label={t('devices.form.labels.useCardReader')} name='useCardReader' valuePropName='checked'>
              <Switch checkedChildren='ON' unCheckedChildren='OFF' />
            </FormItem>
          </Col>
        </Row>

        {/* Nút hành động */}
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/quan-ly-ra-vao/diem-kiem-soat'>
            <Button variant='outlined' color='primary'>
              {t('buttons.cancel')}
            </Button>
          </Link>

          <Button type='primary' htmlType='submit' loading={mutation?.isPending}>
            {action === 'create' ? t('buttons.create') : t('buttons.save')}
          </Button>
        </div>
      </Form>
    </Spin>
  );
}
