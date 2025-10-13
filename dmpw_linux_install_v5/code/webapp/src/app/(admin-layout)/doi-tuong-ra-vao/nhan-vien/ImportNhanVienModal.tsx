import { forwardRef, useImperativeHandle, useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { Form, GetProp, Upload, UploadProps } from 'antd';

const FormItem = Form.Item;
const Dragger = Upload.Dragger;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export type ImportNhanVienModalRef = {
  show: () => void;
};

const ImportNhanVienModal = forwardRef<ImportNhanVienModalRef>((_, ref) => {
  const { translate: t } = useTranslation();
  const [type, setType] = useState<'excel' | 'csv'>('excel');

  const { modalProps, formProps, form, show, close } = useModalForm({
    resource: 'users/import',
    action: 'create',
    meta: {
      params: { type },
    },
    successNotification: (data: any) => ({ type: 'success', message: data?.data?.message }),
    errorNotification: (data: any) => ({ type: 'error', message: data?.data?.message }),
  });

  useImperativeHandle(ref, () => ({
    show,
  }));

  const uploadFile = Form.useWatch<{ file: FileType }>('file', formProps.form);

  const validateFile = (file: FileType) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isCsv = file.type === 'text/csv';

    if (isExcel) {
      setType('excel');
      return Promise.resolve();
    } else if (isCsv) {
      setType('csv');
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(t('doi-tuong-ra-vao/nhan-vien.import.errors.fileType')));
    }
  };

  const handleFinish = (values: any) => {
    const formData = new FormData();
    formData.append('file', values.file.file);

    formProps.onFinish?.(formData);
  };

  return (
    <Modal
      {...modalProps}
      width={600}
      onCancel={(ev) => {
        modalProps.onCancel?.(ev);
        form.resetFields();
      }}
    >
      <Form {...formProps} onFinish={handleFinish} layout='vertical'>
        <FormItem
          name='file'
          rules={[
            {
              validator: (_, { file }) => {
                return validateFile(file);
              },
            },
          ]}
        >
          <Dragger accept='.xlsx,.csv' beforeUpload={() => false} maxCount={1} showUploadList={false}>
            <p className='ant-upload-drag-icon text-primary'>
              <InboxOutlined />
            </p>

            {uploadFile?.file?.name ? (
              <p className='ant-upload-text'>{uploadFile?.file?.name}</p>
            ) : (
              <>
                <p className='ant-upload-text'>{t('doi-tuong-ra-vao/nhan-vien.import.upload.text')}</p>
                <p className='ant-upload-hint'>{t('doi-tuong-ra-vao/nhan-vien.import.upload.hint')}</p>
              </>
            )}
          </Dragger>
        </FormItem>
      </Form>
    </Modal>
  );
});

ImportNhanVienModal.displayName = 'ImportNhanVienModal';

export default ImportNhanVienModal;
