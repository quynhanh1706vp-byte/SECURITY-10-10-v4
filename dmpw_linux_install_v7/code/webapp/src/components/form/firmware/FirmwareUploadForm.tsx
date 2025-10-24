'use client';

import { InboxOutlined } from '@ant-design/icons';
import { getValueFromEvent } from '@refinedev/antd';
import { useCustomMutation, useTranslation } from '@refinedev/core';
import { Col, Form, Input, Row, Select, Upload, notification } from 'antd';
import type { FormProps } from 'antd';

const { Dragger } = Upload;

interface IFirmwareFormValues {
  file: any;
  version: string;
  note: string;
  deviceType: number;
}

interface FirmwareUploadFormProps extends FormProps {
  deviceTypes: any[];
  onSuccess?: () => void;
}

export default function FirmwareUploadForm({ deviceTypes, onSuccess, ...formProps }: FirmwareUploadFormProps) {
  const { translate: t } = useTranslation();
  const { mutate: uploadFirmware, isPending: isUploading } = useCustomMutation();

  // Watch for file changes and auto-fill version
  const handleFileChange = (info: any) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0];
      const fileName = file.name;
      // Remove file extension
      const versionName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      // Set version field value
      formProps.form?.setFieldValue('version', versionName);
    }
  };

  const handleSubmit = async (values: IFirmwareFormValues) => {
    const formData = new FormData();

    const file = values.file?.[0]?.originFileObj;
    if (file) {
      formData.append('file', file);
    }

    // Nếu không có version thì lấy tên file làm version
    const version = values.version || file?.name || '';
    formData.append('version', version);
    formData.append('note', values.note || '');
    formData.append('deviceType', values.deviceType.toString());

    uploadFirmware(
      {
        url: 'firmware-version',
        method: 'post',
        values: formData,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      },
      {
        onSuccess: (res) => {
          notification.success({
            message: t('common.success'),
            description: res?.data?.message || t('firmware-version.messages.uploadSuccess'),
          });
          formProps.form?.resetFields();
          onSuccess?.();
        },
        onError: (error: any) => {
          notification.error({
            message: t('common.error'),
            description: error?.message || t('firmware-version.messages.uploadError'),
          })
        },
      }
    );
  };

  return (
    <Form {...formProps} layout='vertical' onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={t('firmware-version.form.fileLabel')}
            name='file'
            valuePropName='fileList'
            getValueFromEvent={getValueFromEvent}
            rules={[{ required: true, message: t('firmware-version.form.validation.fileRequired') }]}
          >
            <Dragger
              beforeUpload={() => false}
              maxCount={1}
              accept='*'
              onChange={handleFileChange}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined style={{ color: '#028661' }} />
              </p>
              <p className='ant-upload-text'>{t('firmware-version.form.uploadText')}</p>
              {/*<p className='ant-upload-hint'>{t('firmware-version.form.uploadHint')}</p>*/}
            </Dragger>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={t('firmware-version.form.versionLabel')}
            name='version'
            rules={[
              { required: true, message: t('firmware-version.form.validation.versionRequired') },
              { max: 100, message: t('firmware-version.form.validation.versionMaxLength', { max: 100 }) },
            ]}
          >
            <Input placeholder={t('firmware-version.form.versionPlaceholder')} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={t('firmware-version.form.deviceTypeLabel')}
            name='deviceType'
            rules={[{ required: true, message: t('firmware-version.form.validation.deviceTypeRequired') }]}
          >
            <Select
              options={deviceTypes}
              fieldNames={{ label: 'name', value: 'id' }}
              placeholder={t('firmware-version.form.deviceTypePlaceholder')}
              showSearch
              optionFilterProp='name'
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={t('firmware-version.form.noteLabel')}
            name='note'
            rules={[{ max: 1000, message: t('firmware-version.form.validation.noteMaxLength', { max: 1000 }) }]}
          >
            <Input.TextArea rows={4} placeholder={t('firmware-version.form.notePlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
