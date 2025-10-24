'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useModalForm } from '@refinedev/antd';
import { BaseKey, useCustom, useInvalidate, useTranslation } from '@refinedev/core';
import { TUser, TUserInit } from '@types';
import { Button, Spin, Table } from 'antd';

import DinhDanhForm from './DinhDanhForm';
import TraTheForm from './TraTheForm';
import { formatDateTime } from '@lib/datetime';

type DataType = TUser['cardList'][number];

const Column = Table.Column<DataType>;

export default function DinhDanhTable({ user }: { user: TUser | undefined }) {
  const { translate: t } = useTranslation();
  const { data: userInitRes } = useCustom<TUserInit>({
    url: 'users/init',
    method: 'get',
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
  });

  const userInit = useMemo(() => userInitRes?.data, [userInitRes]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<BaseKey[]>([]);
  const invalidate = useInvalidate();

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: showEditModal,
    close: closeEditModal,
    formLoading: editFormLoading,
  } = useModalForm<DataType>({
    resource: `users/${user?.id}/identification`,
    action: 'edit',
    onMutationSuccess: () => {
      invalidate({
        resource: 'users',
        id: user?.id,
        invalidates: ['detail'],
      });
    },
  });

  useEffect(() => {
    if ((editFormProps.form, editFormProps.initialValues?.note)) {
      editFormProps.form?.setFieldValue('description', editFormProps.initialValues.note);
    }
  }, [editFormProps.form, editFormProps.initialValues?.note]);

  const { modalProps, formProps, show } = useModalForm<DataType>({
    resource: `users/${user?.id}/identification`,
    action: 'create',
    invalidates: undefined,
    meta: {
      identifier: 'identification',
      resource: 'identification', // Override resource for translation
    },
    onMutationSuccess: () => {
      invalidate({
        resource: 'users',
        id: user?.id,
        invalidates: ['detail'],
      });
    },
  });

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='text-[16px] leading-[24px] font-medium'>
          {t('doi-tuong-ra-vao/nhan-vien.identification.title')}
        </div>

        <div className='flex gap-2'>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton resource={`users/${user?.id}/identification`} ids={selectedRowKeys as BaseKey[]} />
          )}

          <Button
            type='primary'
            onClick={() => {
              show();
            }}
          >
            {t('doi-tuong-ra-vao/nhan-vien.identification.buttons.add')}
          </Button>
        </div>
      </div>

      <Table<DataType>
        dataSource={user?.cardList}
        rowKey='id'
        className='mt-2.5'
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys as BaseKey[]);
          },
        }}
        scroll={{ x: 'max-content', scrollToFirstRowOnChange: true, y: '66vh' }}
        pagination={false}
      >
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.createdDate')}
          dataIndex='createdDate'
          width={170}
          render={(value) => formatDateTime(value)}
        />
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.cardType')}
          dataIndex='cardType'
          width={150}
          render={(value) => userInit?.cardTypes.find((item) => item.id === value)?.name}
        />
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.cardId')}
          width={150}
          ellipsis
          dataIndex='cardId'
        />
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.status')}
          dataIndex='cardStatus'
          width={150}
          render={(value) => userInit?.cardStatus.find((item) => item.id === value)?.name}
        />
        {/* <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.returnDate')}
          width={170}
          dataIndex='returnedAt'
        /> */}
        <Column
          title={t('doi-tuong-ra-vao/nhan-vien.identification.columns.actions')}
          key='action'
          width={200}
          render={(_, record) => (
            <div className='flex gap-2'>
              {record.cardStatus === 2 && (
                <Button
                  variant='link'
                  color='primary'
                  size='small'
                  onClick={() => {
                    showEditModal(record.id);
                  }}
                >
                  {t('doi-tuong-ra-vao/nhan-vien.identification.buttons.returnCard')}
                </Button>
              )}

              <DeleteButton
                resource={`users/${user?.id}/identification`}
                color='primary'
                variant='text'
                size='small'
                icon={null}
                recordItemId={record.id}
                confirmTitle={t('doi-tuong-ra-vao/nhan-vien.identification.confirmDelete.title')}
                confirmMessage={t('doi-tuong-ra-vao/nhan-vien.identification.confirmDelete.message')}
                accessControl={{ enabled: false }}
                onSuccess={() => {
                  invalidate({
                    resource: 'users',
                    id: user?.id,
                    invalidates: ['detail'],
                  });
                }}
              />
            </div>
          )}
        />
      </Table>

      <Modal
        {...modalProps}
        title={t('doi-tuong-ra-vao/nhan-vien.identification.modal.addTitle')}
        width={580}
        onCancel={(ev) => {
          modalProps?.onCancel?.(ev);
          formProps.form?.resetFields();
        }}
      >
        <DinhDanhForm {...formProps} />
      </Modal>

      <Modal
        {...editModalProps}
        title={t('doi-tuong-ra-vao/nhan-vien.identification.modal.returnTitle')}
        width={580}
        cancelText={t('buttons.cancel')}
        onCancel={() => {
          closeEditModal();
          editFormProps.form?.resetFields();
        }}
      >
        <Spin spinning={editFormLoading}>
          <TraTheForm id='tra-the-form' {...editFormProps} />
        </Spin>
      </Modal>
    </div>
  );
}
