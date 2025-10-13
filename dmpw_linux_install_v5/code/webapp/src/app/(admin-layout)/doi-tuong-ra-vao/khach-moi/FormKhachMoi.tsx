'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { UploadOutlined } from '@ant-design/icons';
import { useForm, useSelect } from '@refinedev/antd';
import { useCustom, useOne, useTranslation } from '@refinedev/core';
import { IFormVisit, IVisitsInit } from '@types';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Typography,
  Upload,
  UploadProps,
  notification,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FormKhachMoi = () => {
  const { translate: t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const copyId = searchParams.get('copyId') || '';

  const id = params.id as string;
  const isEdit = !!id;

  const { data: copyData } = useOne<IFormVisit>({
    resource: 'visits',
    id: copyId,
    queryOptions: {
      enabled: !!copyId,
    },
  });

  const { formProps, onFinish, formLoading } = useForm<IFormVisit>({
    resource: 'visits',
    action: isEdit ? 'edit' : 'create',
    id,
    onMutationSuccess: () => {
      if (!isEdit) {
        setTimeout(() => {
          router.push('/doi-tuong-ra-vao/khach-moi');
        }, 100);
      }
    },
  });

  useEffect(() => {
    if (!formProps.form || !copyData) return;

    formProps.form.setFieldsValue({
      ...copyData.data,
      birthDay: copyData.data.birthDay ? dayjs.utc(copyData.data.birthDay, 'DD.MM.YYYY').local() : null,
      start_time: copyData.data.startDate ? dayjs.utc(copyData.data.startDate, 'DD.MM.YYYY HH:mm:ss').local() : null,
      end_time: copyData.data.endDate ? dayjs.utc(copyData.data.endDate, 'DD.MM.YYYY HH:mm:ss').local() : null,
    });
  }, [copyData, formProps.form]);

  const documentType = Form.useWatch('documentType', formProps.form);

  // State để lưu trữ base64 của các ảnh
  const [avatarBase64, setAvatarBase64] = useState<string>('');
  const [idFrontBase64, setIdFrontBase64] = useState<string>('');
  const [idBackBase64, setIdBackBase64] = useState<string>('');

  // State để lưu trữ file list cho Upload component
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
  const [idFrontFileList, setIdFrontFileList] = useState<any[]>([]);
  const [idBackFileList, setIdBackFileList] = useState<any[]>([]);

  const { data: defaultVisitData, isLoading: isLoadingDefaultVisitData } = useOne<IFormVisit>({
    resource: 'visits',
    id: 0,
    queryOptions: {
      enabled: !isEdit,
    },
  });

  const { data: dataInit, isLoading: isLoadingDataInit } = useCustom<IVisitsInit>({
    url: 'visits/init',
    method: 'get',
  });

  const { data: settingsData } = useCustom({
    url: 'settings/visit',
    method: 'get',
  });

  const approvalStepNumber = settingsData?.data?.approvalStepNumber;

  const { selectProps: selectPropsApprover } = useSelect({
    resource: 'settings/visit/first-approver',
    optionLabel: 'email',
    optionValue: 'accountId',
    onSearch: (value) => [
      {
        field: 'search',
        operator: 'eq',
        value,
      },
    ],
    queryOptions: {
      enabled: approvalStepNumber === 1,
    },
  });

  const selectOptionsVisitTarget = useMemo(() => {
    if (isLoadingDataInit || !dataInit) return [];
    return dataInit.data.visitTarget.map((item) => ({
      label: item.firstName,
      value: item.id,
    }));
  }, [isLoadingDataInit, dataInit]);

  useEffect(() => {
    if ((isEdit && !formProps.initialValues) || (!isEdit && !defaultVisitData?.data)) return;

    const { avatar, imageCardIdBack, imageCardIdFont, ...rest } = (
      isEdit ? formProps.initialValues : { ...defaultVisitData?.data, approverId1: undefined }
    ) as IFormVisit;

    setAvatarBase64(avatar || '');
    if (avatar) {
      setAvatarFileList([
        {
          uid: 'avatar',
          name: 'avatar.jpg',
          status: 'done',
          url: avatar,
        },
      ]);
    }

    setIdFrontBase64(imageCardIdFont || '');
    if (imageCardIdFont) {
      setIdFrontFileList([
        {
          uid: 'imageCardIdFont',
          name: 'imageCardIdFont.jpg',
          status: 'done',
          url: imageCardIdFont,
        },
      ]);
    }
    setIdBackBase64(imageCardIdBack || '');
    if (imageCardIdBack) {
      setIdBackFileList([
        {
          uid: 'imageCardIdBack',
          name: 'imageCardIdBack.jpg',
          status: 'done',
          url: imageCardIdBack,
        },
      ]);
    }

    const formValues = {
      ...rest,
      start_time: isEdit
        ? dayjs.utc(rest.startDate, 'DD.MM.YYYY HH:mm:ss').local()
        : dayjs(rest.startDate, 'DD.MM.YYYY HH:mm:ss'),
      end_time: isEdit
        ? dayjs.utc(rest.endDate, 'DD.MM.YYYY HH:mm:ss').local()
        : dayjs(rest.endDate, 'DD.MM.YYYY HH:mm:ss'),
    };

    formProps.form?.setFieldsValue(formValues);
  }, [isEdit, defaultVisitData, formProps.initialValues]);

  // Hàm chuyển đổi file thành base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Hàm xử lý upload ảnh avatar
  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      if (file instanceof File) {
        // Kiểm tra kích thước file (giới hạn 5MB)
        if (file.size > 5 * 1024 * 1024) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.fileTooLarge'),
          });
          onError?.(new Error(t('validation.file.tooLarge')));
          return;
        }

        // Kiểm tra định dạng file
        if (!file.type.startsWith('image/')) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.invalidFileType'),
          });
          onError?.(new Error(t('validation.file.invalidType')));
          return;
        }

        const base64 = await convertToBase64(file);
        setAvatarBase64(base64);
        formProps.form?.setFieldValue('avatar', base64);

        // Update file list
        setAvatarFileList([
          {
            uid: 'avatar',
            name: file.name,
            status: 'done',
            url: base64,
          },
        ]);

        onSuccess?.(base64);
        notification.success({
          message: t('common.success'),
          description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadAvatarSuccess'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('common.error'),
        description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadAvatarFailed'),
      });
      onError?.(error as Error);
    }
  };

  const handleIdFrontUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      if (file instanceof File) {
        if (file.size > 5 * 1024 * 1024) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.fileTooLarge'),
          });
          onError?.(new Error(t('validation.file.tooLarge')));
          return;
        }

        if (!file.type.startsWith('image/')) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.invalidFileType'),
          });
          onError?.(new Error(t('validation.file.invalidType')));
          return;
        }

        const base64 = await convertToBase64(file);
        setIdFrontBase64(base64);
        formProps.form?.setFieldValue('imageCardIdFont', base64);

        // Update file list
        setIdFrontFileList([
          {
            uid: 'imageCardIdFont',
            name: file.name,
            status: 'done',
            url: base64,
          },
        ]);

        onSuccess?.(base64);
        notification.success({
          message: t('common.success'),
          description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadFrontSuccess'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('common.error'),
        description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadFrontFailed'),
      });
      onError?.(error as Error);
    }
  };

  // Hàm xử lý upload ảnh mặt sau CCCD
  const handleIdBackUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      if (file instanceof File) {
        if (file.size > 5 * 1024 * 1024) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.fileTooLarge'),
          });
          onError?.(new Error(t('validation.file.tooLarge')));
          return;
        }

        if (!file.type.startsWith('image/')) {
          notification.error({
            message: t('common.error'),
            description: t('doi-tuong-ra-vao/khach-moi.form.errors.invalidFileType'),
          });
          onError?.(new Error(t('validation.file.invalidType')));
          return;
        }

        const base64 = await convertToBase64(file);
        setIdBackBase64(base64);
        formProps.form?.setFieldValue('imageCardIdBack', base64);

        // Update file list
        setIdBackFileList([
          {
            uid: 'imageCardIdBack',
            name: file.name,
            status: 'done',
            url: base64,
          },
        ]);

        onSuccess?.(base64);
        notification.success({
          message: t('common.success'),
          description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadBackSuccess'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('common.error'),
        description: t('doi-tuong-ra-vao/khach-moi.form.messages.uploadBackFailed'),
      });
      onError?.(error as Error);
    }
  };

  // Hàm xử lý khi xóa ảnh
  const handleRemoveAvatar = () => {
    setAvatarBase64('');
    setAvatarFileList([]);
    formProps.form?.setFieldValue('avatar', '');
  };

  const handleRemoveIdFront = () => {
    setIdFrontBase64('');
    setIdFrontFileList([]);
    formProps.form?.setFieldValue('imageCardIdFont', '');
  };

  const handleRemoveIdBack = () => {
    setIdBackBase64('');
    setIdBackFileList([]);
    formProps.form?.setFieldValue('imageCardIdBack', '');
  };

  const handleFinish = (values: any) => {
    const { start_time, end_time, birthDay, ...rest } = values;
    const visiteeName = selectOptionsVisitTarget.find((item) => item.value === values.visiteeId)?.label || '';

    const formattedValues = {
      ...(isEdit ? formProps.initialValues : defaultVisitData?.data),
      ...rest,
      visiteeName,
      birthDay: birthDay ? dayjs(birthDay).utc().format('DD.MM.YYYY') : undefined,
      startDate: start_time ? dayjs(start_time).utc().format('DD.MM.YYYY HH:mm:ss') : undefined,
      endDate: end_time ? dayjs(end_time).utc().format('DD.MM.YYYY HH:mm:ss') : undefined,
      avatar: avatarBase64,
      imageCardIdFont: idFrontBase64,
      imageCardIdBack: idBackBase64,
    };
    onFinish?.(formattedValues);
  };

  return (
    <Spin spinning={formLoading}>
      <Form {...formProps} layout='vertical' className='p-5' onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitorName')}
              name='visitorName'
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.visitorNameRequired'),
                },
                {
                  max: 100,
                  message: t('validation.maxLength', {
                    max: 100,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.visitorName'),
                  }),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.visitorName')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.visiteeDepartment')}
              name='visiteeDepartment'
              rules={[
                {
                  max: 100,
                  message: t('validation.maxLength', {
                    max: 100,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.visiteeDepartment'),
                  }),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.visiteeDepartment')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.phone')}
              name='phone'
              rules={[
                {
                  pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.phoneInvalid'),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.phone')} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.documentType')}
              name='documentType'
              rules={[
                { required: true, message: t('doi-tuong-ra-vao/khach-moi.form.validation.documentTypeRequired') },
              ]}
              initialValue={0}
            >
              <Select
                placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.documentType')}
                options={dataInit?.data.identificationType || []}
                fieldNames={{ label: 'name', value: 'id' }}
                loading={isLoadingDataInit}
              />
            </Form.Item>
          </Col>

          {documentType === 3 && (
            <Col span={8}>
              <Form.Item
                label={t('doi-tuong-ra-vao/khach-moi.form.fields.documentLabel')}
                name='documentLabel'
                initialValue=''
                rules={[
                  {
                    max: 100,
                    message: t('validation.maxLength', {
                      max: 100,
                      field: t('doi-tuong-ra-vao/khach-moi.form.fields.documentLabel'),
                    }),
                  },
                ]}
              >
                <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.documentLabel')} />
              </Form.Item>
            </Col>
          )}

          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.documentNumber')}
              name='documentNumber'
              initialValue=''
              rules={[
                {
                  max: 100,
                  message: t('validation.maxLength', {
                    max: 100,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.documentNumber'),
                  }),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.documentNumber')} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.email')}
              name='email'
              rules={[{ type: 'email', message: t('doi-tuong-ra-vao/khach-moi.form.validation.emailInvalid') }]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.email')} />
            </Form.Item>
          </Col>
        </Row>

        {/* Thông tin lịch hẹn */}
        <Title level={4} className='mb-0 py-4'>
          {t('doi-tuong-ra-vao/khach-moi.form.sections.appointmentInfo')}
        </Title>
        <hr className='w-full' />
        <Row gutter={16} className='pt-6'>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.visiteeId')}
              name='visiteeId'
              rules={[
                {
                  required: true,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.visiteeIdRequired'),
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp='label'
                placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.visiteeId')}
                options={selectOptionsVisitTarget}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitorDepartment')}
              name='visitorDepartment'
              rules={[
                {
                  max: 100,
                  message: t('validation.maxLength', {
                    max: 100,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.visitorDepartment'),
                  }),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.visitorDepartment')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.roomNumber')}
              name='roomNumber'
              rules={[
                {
                  max: 50,
                  message: t('validation.maxLength', {
                    max: 50,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.roomNumber'),
                  }),
                },
              ]}
            >
              <Input placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.roomNumber')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.startTime')}
              name='start_time'
              rules={[
                {
                  required: true,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.startTimeRequired'),
                },
              ]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.endTime')}
              name='end_time'
              rules={[
                {
                  required: true,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.endTimeRequired'),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('start_time');
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (dayjs(value).isAfter(dayjs(startTime))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('doi-tuong-ra-vao/khach-moi.form.validation.endTimeAfterStartTime')),
                    );
                  },
                }),
              ]}
              dependencies={['start_time']}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitReason')}
              name='visitReason'
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('doi-tuong-ra-vao/khach-moi.form.validation.visitReasonRequired'),
                },
                {
                  max: 1000,
                  message: t('validation.maxLength', {
                    max: 1000,
                    field: t('doi-tuong-ra-vao/khach-moi.form.fields.visitReason'),
                  }),
                },
              ]}
            >
              <TextArea rows={1} placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.visitReason')} />
            </Form.Item>
          </Col>

          {approvalStepNumber === 1 && (
            <Col span={8}>
              <Form.Item
                label={t('doi-tuong-ra-vao/khach-moi.form.fields.approverId')}
                name='approverId1'
                rules={[
                  {
                    required: true,
                    message: t('doi-tuong-ra-vao/khach-moi.form.validation.approverIdRequired'),
                  },
                ]}
              >
                <Select
                  {...selectPropsApprover}
                  placeholder={t('doi-tuong-ra-vao/khach-moi.form.placeholders.approverId')}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Thông tin bổ sung */}
        <Title level={4}>{t('doi-tuong-ra-vao/khach-moi.form.sections.additionalInfo')}</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.avatar')} name='avatar'>
              <Upload
                listType='picture-card'
                maxCount={1}
                customRequest={handleAvatarUpload}
                onRemove={handleRemoveAvatar}
                accept='image/*'
                fileList={avatarFileList}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {avatarFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>{t('doi-tuong-ra-vao/khach-moi.form.upload.avatar')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.idCardFront')} name='imageCardIdFont'>
              <Upload
                listType='picture-card'
                maxCount={1}
                customRequest={handleIdFrontUpload}
                onRemove={handleRemoveIdFront}
                accept='image/*'
                fileList={idFrontFileList}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {idFrontFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>{t('doi-tuong-ra-vao/khach-moi.form.upload.idCardFront')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.idCardBack')} name='imageCardIdBack'>
              <Upload
                listType='picture-card'
                maxCount={1}
                customRequest={handleIdBackUpload}
                onRemove={handleRemoveIdBack}
                accept='image/*'
                fileList={idBackFileList}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {idBackFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>{t('doi-tuong-ra-vao/khach-moi.form.upload.idCardBack')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row className='mt-4 flex justify-end'>
          <Button color='primary' variant='outlined' onClick={() => router.back()}>
            {t('doi-tuong-ra-vao/khach-moi.form.buttons.close')}
          </Button>
          <Button type='primary' htmlType='submit' className='ml-4' loading={formLoading}>
            {t('doi-tuong-ra-vao/khach-moi.form.buttons.save')}
          </Button>
        </Row>
      </Form>
    </Spin>
  );
};

export default FormKhachMoi;
