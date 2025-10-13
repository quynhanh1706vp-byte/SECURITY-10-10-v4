'use client';

import { useState } from 'react';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { downloadFile } from '@lib/utils';
import { dataProvider } from '@providers/data-provider';
import { useTranslation } from '@refinedev/core';
import { Button, Form, Modal, notification, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Dragger } = Upload;

interface ModalImportExcelProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  importUrl?: string;
  exampleUrl?: string;
  fileName?: string;
  type?: 'xlsx' | 'csv';
  title?: string;
  width?: number;
  okText?: string;
  cancelText?: string;
  queryParams?: Record<string, any>;
}

export default function ModalImportExcel({
  open,
  onCancel,
  onSuccess,
  importUrl,
  exampleUrl,
  fileName = 'example',
  type = 'xlsx',
  title,
  width = 500,
  okText,
  cancelText,
  queryParams,
}: ModalImportExcelProps) {
  const { translate: t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const handleDownloadExample = async () => {
    if (exampleUrl && /\.[a-zA-Z0-9]+$/.test(exampleUrl)) {
      // Has file extension, open in new tab
      window.open(exampleUrl, '_blank');
      return;
    }

    setDownloading(true);
    try {
      const response = await dataProvider.custom({
        url: exampleUrl || '',
        method: 'get',
        query: {
          type: type === 'xlsx' ? 'excel' : 'csv',
          ...queryParams,
        },
        meta: {
          isDownload: true,
        },
      });

      downloadFile(response.data as Blob, `${fileName}.${type}`);
    } catch (error: any) {
      notification.error({
        message: t('common.error'),
        description: error?.response?.data?.message || error?.message || t('upload.errors.downloadTemplate'),
      });
    } finally {
      setDownloading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: type === 'xlsx' ? '.xlsx,.xls' : '.csv',
    fileList,
    beforeUpload(file) {
      // Kiểm tra file type
      const isValidType =
        type === 'xlsx'
          ? file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
          : file.type === 'text/csv' || file.name.endsWith('.csv');

      if (!isValidType) {
        notification.error({
          message: t('common.error'),
          description: t('upload.errors.invalidFileType', { type: type.toUpperCase() }),
        });
        return Upload.LIST_IGNORE;
      }

      // Kiểm tra file size (ví dụ: max 10MB)
      const isValidSize = file.size / 1024 / 1024 < 10;
      if (!isValidSize) {
        notification.error({
          message: t('common.error'),
          description: t('upload.errors.fileTooLarge', { size: '10MB' }),
        });
        return Upload.LIST_IGNORE;
      }

      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          originFileObj: file,
        },
      ]);

      return false; // không upload ngay lập tức
    },
    onRemove() {
      setFileList([]);
    },
    onChange(info) {
      console.log('Upload onChange:', info);
    },
  };

  const handleOk = async () => {
    if (fileList.length === 0) {
      notification.error({
        message: t('common.error'),
        description: t('upload.errors.noFileSelected'),
      });
      return;
    }

    const file = fileList[0];

    // Kiểm tra file có tồn tại không
    if (!file.originFileObj && !file) {
      notification.error({
        message: t('common.error'),
        description: t('upload.errors.invalidFile'),
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Ưu tiên originFileObj, nếu không có thì dùng file gốc
    const fileToUpload = file.originFileObj || file;

    if (fileToUpload instanceof File) {
      formData.append('file', fileToUpload);
    } else {
      notification.error({
        message: t('common.error'),
        description: t('upload.errors.invalidFile'),
      });
      setUploading(false);
      return;
    }

    try {
       await dataProvider.custom({
        url: importUrl || '',
        method: 'post',
        payload: formData,
        query: {
          type: type === 'xlsx' ? 'excel' : 'csv',
          ...queryParams,
        },
        meta: {
          isUpload: true,
        },
      });


      notification.success({
        message: t('common.success'),
        description: t('notifications.import_success'),
      });
      setFileList([]);
      form.resetFields();

      // Gọi callback success nếu có
      if (onSuccess) {
        onSuccess();
      }

      // Đóng modal
      onCancel();
    } catch (error: any) {
      notification.error({
        message: t('common.error'),
        description: error?.response?.data?.message || error?.message || t('upload.errors.uploadFailed'),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    // Reset form và file list khi đóng modal
    setFileList([]);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title || t('upload.modal.title')}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={width}
      okText={okText || t('buttons.save')}
      cancelText={cancelText || t('buttons.cancel')}
      confirmLoading={uploading}
      destroyOnHidden={true}
    >
      <Form form={form} layout='vertical'>
        <Dragger {...uploadProps} className=''>
          <div className='flex flex-col gap-5'>
            <p className='flex justify-center'>
              <InboxOutlined style={{ fontSize: 48, color: '#028661' }} />
            </p>
          </div>
          <p className='text-center text-base leading-6'>{t('upload.form.text.dragDropArea')}</p>
        </Dragger>

        <div className='mt-3 text-center text-sm leading-5'>
          <span>{t('upload.form.text.downloadTemplate')} </span>
          <Button
            type='link'
            size='small'
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownloadExample}
            className='h-auto p-0'
          >
            {t('upload.form.text.here')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
