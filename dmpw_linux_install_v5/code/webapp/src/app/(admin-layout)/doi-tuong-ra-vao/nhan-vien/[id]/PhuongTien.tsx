'use client';

import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import PhuongTienForm from '@components/form/doi-tuong-ra-vao/PhuongTienForm';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { useModal, useModalForm } from '@refinedev/antd';
import { useCustomMutation, useTranslation } from '@refinedev/core';
import { TUser } from '@types';
import { Button, Form, FormProps, Table } from 'antd';

type DataType = any;

const Column = Table.Column<DataType>;

export default function PhuongTien({ user }: { user: TUser | undefined }) {
  const { translate: t } = useTranslation();
  const {
    tableProps,
    selectedRowKeys,
    tableQuery: { refetch },
    handleDeleteSuccess,
  } = useCustomTable<DataType>({
    resource: `users/${user?.id}/vehicles`,
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: showCreate,
  } = useModalForm<DataType>({
    resource: `users/${user?.id}/vehicles`,
    action: 'create',
  });

  const { modalProps: editModalProps, show: showEdit, close: closeEdit } = useModal();

  const { mutate: updateVehicle, isPending: isUpdating } = useCustomMutation<DataType>();
  const [form] = Form.useForm();

  const [selectedVehicle, setSelectedVehicle] = useState<DataType | undefined>();

  const editFormProps: FormProps = {
    form,
    onFinish: (values: any) => {
      updateVehicle(
        {
          url: `users/${user?.id}/vehicles?vehicleId=${selectedVehicle?.id}`,
          method: 'put',
          values,
          successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
          errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
        },
        {
          onSuccess: () => {
            refetch();
            closeEdit();
            form.resetFields();
          },
        },
      );
    },
  };

  const { mutate: deleteVehicle, isPending: isDeleting } = useCustomMutation();

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='text-[16px] font-medium'>{t('doi-tuong-ra-vao/nhan-vien.vehicles.title')}</div>

        <div className='flex gap-2'>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='vehicles'
              ids={selectedRowKeys}
              onSuccess={() => {
                handleDeleteSuccess(selectedRowKeys);
                refetch();
              }}
              confirmTitle={t('doi-tuong-ra-vao/nhan-vien.vehicles.multipleDeleteConfirm.title')}
              confirmMessage={t('doi-tuong-ra-vao/nhan-vien.vehicles.multipleDeleteConfirm.message', {
                count: selectedRowKeys.length,
              })}
              disabled={false}
              accessControl={{ enabled: false }}
            />
          )}

          <Button
            type='primary'
            onClick={() => {
              showCreate();
            }}
          >
            {t('doi-tuong-ra-vao/nhan-vien.vehicles.buttons.add')}
          </Button>
        </div>
      </div>

      <Table<DataType> {...tableProps} className='mt-2.5' scroll={{ x: 'max-content', y: '66vh' }}>
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.vehicles.columns.vehicleType')}
          dataIndex='vehicleType'
          render={(_, record) => t(`vehicles.vehicleType.${record.vehicleType === 0 ? 'car' : 'motorbike'}`)}
        />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.vehicles.columns.model')} dataIndex='model' />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.vehicles.columns.plateNumber')} dataIndex='plateNumber' />
        <Column title={t('doi-tuong-ra-vao/nhan-vien.vehicles.columns.color')} dataIndex='color' />
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.vehicles.columns.actions')}
          dataIndex='thaoTac'
          render={(_, record) => (
            <div className='flex gap-1'>
              <Button
                color='primary'
                variant='text'
                size='small'
                onClick={() => {
                  setSelectedVehicle(record);
                  form.setFieldsValue(record);
                  showEdit();
                }}
              >
                {t('buttons.edit')}
              </Button>

              <DeleteButton
                color='primary'
                variant='text'
                size='small'
                icon={null}
                confirmTitle={t('doi-tuong-ra-vao/nhan-vien.vehicles.confirmDelete.title')}
                confirmMessage={t('doi-tuong-ra-vao/nhan-vien.vehicles.confirmDelete.message')}
                onConfirm={() => {
                  deleteVehicle(
                    {
                      url: `users/${user?.id}/vehicles?vehicleId=${record.id}`,
                      method: 'delete',
                      values: {},
                      successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
                      errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
                    },
                    {
                      onSuccess: () => {
                        refetch();
                        handleDeleteSuccess(record.id);
                      },
                    },
                  );
                }}
              />
            </div>
          )}
        />
      </Table>

      <Modal {...createModalProps} title={t('doi-tuong-ra-vao/nhan-vien.vehicles.modal.addTitle')} width={596}>
        <PhuongTienForm objectType='user' {...createFormProps} initialValues={{ userId: user?.id }} />
      </Modal>

      <Modal
        {...editModalProps}
        title={t('doi-tuong-ra-vao/nhan-vien.vehicles.modal.editTitle')}
        width={596}
        onCancel={(e) => {
          editModalProps.onCancel?.(e);
          form.resetFields();
        }}
        okButtonProps={{
          loading: isUpdating,
          onClick: () => {
            form.submit();
          },
        }}
      >
        <PhuongTienForm objectType='user' {...editFormProps} initialValues={{ userId: user?.id }} />
      </Modal>
    </div>
  );
}
