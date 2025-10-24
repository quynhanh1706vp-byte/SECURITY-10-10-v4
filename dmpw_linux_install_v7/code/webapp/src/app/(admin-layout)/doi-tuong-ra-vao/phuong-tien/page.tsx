'use client';

import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import PhuongTienForm from '@components/form/doi-tuong-ra-vao/PhuongTienForm';
import ModalImportExcel from '@components/import/ModalImportExcel';
import DeleteButton from '@components/ui/DeleteButton';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { List, useModal, useModalForm } from '@refinedev/antd';
import { BaseKey, CanAccess, useCan, useCreate, useCustomMutation, useNotification, useTranslation } from '@refinedev/core';
import { IVehicle } from '@types';
import { Avatar, Button, Dropdown, Form, Input, Menu, Spin, Table, Tabs } from 'antd';
import { $permissions } from '@constants/permmission';
import ModalExportExcel from '@components/import/ModalExportExcel';

const { Search } = Input;
const Column = Table.Column<IVehicle>;

type DataType = IVehicle;

export default function Page() {
  const { translate: t } = useTranslation();

  const { data: canEdit } = useCan({
    resource: 'vehicles',
    action: 'edit',
    params: { authority: $permissions.EDIT_VEHICLE },
  });

  const { data: canDelete } = useCan({
    resource: 'vehicles',
    action: 'delete',
    params: { authority: $permissions.DELETE_VEHICLE },
  });

  const hasActionPermission = canEdit?.can || canDelete?.can;

  const {
    tableProps,
    selectedRowKeys,
    handleDeleteSuccess,
    handleSearch,
    setFilters,
    tableQuery: { refetch },
    filters,
  } = useCustomTable<DataType>({
    resource: 'vehicles',
    filters: {
      initial: [{ field: 'isUser', operator: 'eq', value: true }],
    },
  });

  const isUser = filters.find((filter) => filter.operator === 'eq' && filter.field === 'isUser')?.value;
  console.log('🚀 ~ Page ~ isUser:', isUser);

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: showCreateModal,
    close: closeCreateModal,
  } = useModalForm<IVehicle>({
    action: 'create',
    resource: 'vehicles',
  });

  const [tab, setTab] = useState<'user' | 'visitor'>('user');

  const createUserId = Form.useWatch('userId', createFormProps.form);
  const createVisitId = Form.useWatch('visitId', createFormProps.form);

  const { open } = useNotification();

  const { mutate: createVehicle, isPending: isCreating } = useCreate({
    resource: tab === 'user' ? `users/${createUserId}/vehicles` : `visits/${createVisitId}/vehicles`,
    mutationOptions: {
      onSuccess: (data) => {
        open?.({ type: 'success', message: data?.data?.message });
        refetch();
        closeCreateModal();
        createFormProps.form?.resetFields();
      },
    },
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: showEditModal,
    close: closeEditModal,
    query: editQuery,
  } = useModalForm<IVehicle>({
    action: 'edit',
    resource: 'vehicles',
  });

  const { mutate: updateMutate, isPending: isUpdating } = useCustomMutation();

  const updateVehicle = (values: IVehicle) => {
    const userId = editFormProps.initialValues?.userId;
    const visitId = editFormProps.initialValues?.visitId;

    updateMutate(
      {
        url: `${userId ? 'users' : 'visits'}/${userId ? userId : visitId}/vehicles?vehicleId=${editFormProps.initialValues?.id}`,
        method: 'put',
        values,
      },
      {
        onSuccess: (data) => {
          open?.({ type: 'success', message: data?.data?.message });
          refetch();
          closeEditModal();
          editFormProps.form?.resetFields();
        },
      },
    );
  };

  const { show: showImport, close: closeImport, modalProps: importModalProps } = useModal();

  const handleAddFromExcel = () => {
    showImport();
  };

  const dropdownMenu = (
    <Menu>
      <Menu.Item key='form' onClick={() => showCreateModal()}>
        {t('doi-tuong-ra-vao/phuong-tien.buttons.addFromForm')}
      </Menu.Item>
      <Menu.Item key='excel' onClick={handleAddFromExcel}>
        {t('doi-tuong-ra-vao/phuong-tien.buttons.importExcel')}
      </Menu.Item>
    </Menu>
  );

  const { mutate: deleteVehicle, isPending: isDeleting } = useCustomMutation();
  const [deleteVehicleId, setDeleteVehicleId] = useState<BaseKey | null>(null);

  const { show: showExport, close: closeExport, modalProps: exportModalProps } = useModal();

  return (
    <List
      resource='vehicles'
      title={t('doi-tuong-ra-vao/phuong-tien.title')}
      headerButtons={() => (
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource='vehicles'
              ids={selectedRowKeys}
              onSuccess={() => handleDeleteSuccess(selectedRowKeys)}
              accessControl={{ hideIfUnauthorized: true }}
            />
          )}

          <Button color='primary' variant='outlined' onClick={showExport}>
            {t('doi-tuong-ra-vao/phuong-tien.buttons.export')}
          </Button>

          <CanAccess resource='vehicles' action='create' params={{ authority: $permissions.ADD_VEHICLE }}>
            <Dropdown overlay={dropdownMenu}>
              <Button type='primary'>{t('doi-tuong-ra-vao/phuong-tien.buttons.addVehicle')}</Button>
            </Dropdown>
          </CanAccess>
        </div>
      )}
    >
      <Tabs
        activeKey={tab}
        items={[
          {
            key: 'user',
            label: t('doi-tuong-ra-vao/phuong-tien.tabs.employee'),
          },
          {
            key: 'visitor',
            label: t('doi-tuong-ra-vao/phuong-tien.tabs.visitor'),
          },
        ]}
        onChange={(key) => {
          setTab(key as 'user' | 'visitor');
          createFormProps.form?.setFieldValue('objectType', key);
          setFilters([{ field: 'isUser', operator: 'eq', value: key === 'user' }]);
        }}
      />

      <div className='w-[210px]'>
        <Search placeholder={t('doi-tuong-ra-vao/phuong-tien.placeholders.search')} onChange={handleSearch} />
      </div>

      <Table<DataType>
        {...tableProps}
        rowSelection={canDelete?.can ? tableProps.rowSelection : undefined}
        className='mt-2.5'
        scroll={{ y: '66vh', scrollToFirstRowOnChange: true }}
      >
        <Column
          title={t('doi-tuong-ra-vao/phuong-tien.columns.owner')}
          dataIndex='userName'
          width={200}
          render={(_, record) => (
            <div className='flex items-center gap-2'>
              <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} size={24} />
              {record.userName}
            </div>
          )}
        />
        <Column
          title={t('doi-tuong-ra-vao/phuong-tien.columns.vehicleType')}
          dataIndex='vehicleType'
          width={100}
          render={(_, record) => t(`vehicles.vehicleType.${record.vehicleType === 0 ? 'car' : 'motorbike'}`)}
        />
        <Column title={t('doi-tuong-ra-vao/phuong-tien.columns.model')} dataIndex='model' width={150} ellipsis />
        <Column
          title={t('doi-tuong-ra-vao/phuong-tien.columns.plateNumber')}
          dataIndex='plateNumber'
          width={150}
          ellipsis
        />
        <Column title={t('doi-tuong-ra-vao/phuong-tien.columns.color')} dataIndex='color' width={100} ellipsis />
        {hasActionPermission && (
          <Column
            title={t('doi-tuong-ra-vao/phuong-tien.columns.actions')}
            dataIndex='action'
            width={100}
            render={(_, record) => (
              <div className='flex gap-1'>
                <CanAccess resource='vehicles' action='edit' params={{ authority: $permissions.EDIT_VEHICLE }}>
                  <Button color='primary' variant='text' size='small' onClick={() => showEditModal(record.id)}>
                    {t('buttons.edit')}
                  </Button>
                </CanAccess>

                <DeleteButton
                  color='primary'
                  variant='text'
                  size='small'
                  loading={isDeleting && deleteVehicleId === record.id}
                  confirmTitle={t('doi-tuong-ra-vao/phuong-tien.confirmDelete.title')}
                  confirmMessage={t('doi-tuong-ra-vao/phuong-tien.confirmDelete.message')}
                  onConfirm={() => {
                    setDeleteVehicleId(record.id);
                    deleteVehicle(
                      {
                        url: record.userId
                          ? `users/${record.userId}/vehicles?vehicleId=${record.id}`
                          : `visits/${record.visitId}/vehicles?vehicleId=${record.id}`,
                        method: 'delete',
                        values: {},
                        successNotification: (data) => ({ type: 'success', message: data?.data?.message }),
                        errorNotification: (error) => ({ type: 'error', message: error?.data?.message }),
                      },
                      {
                        onSuccess: () => {
                          refetch();
                          handleDeleteSuccess(record.id);
                          setDeleteVehicleId(null);
                        },
                      },
                    );
                  }}
                  accessControl={{ hideIfUnauthorized: true }}
                />
              </div>
            )}
          />
        )}
      </Table>

      <Modal
        {...createModalProps}
        width={628}
        okButtonProps={{ ...createModalProps.okButtonProps, loading: isCreating }}
        onCancel={(ev) => {
          createModalProps.onCancel?.(ev);
          createFormProps.form?.resetFields();
        }}
      >
        <PhuongTienForm
          {...createFormProps}
          onFinish={(values) => {
            createVehicle({ values });
          }}
          objectType={tab}
        />
      </Modal>

      <Modal {...editModalProps} width={628} okButtonProps={{ ...editModalProps.okButtonProps, loading: isUpdating }}>
        <Spin spinning={editQuery?.isFetching}>
          <PhuongTienForm
            {...editFormProps}
            onFinish={(values) => {
              updateVehicle(values);
            }}
            objectType={tab}
          />
        </Spin>
      </Modal>

      <ModalImportExcel
        open={importModalProps.open as boolean}
        onCancel={closeImport}
        fileName='Vehicles_Template'
        importUrl='vehicles/import'
        exampleUrl='vehicles/import-template'
        type='xlsx'
        title={t('doi-tuong-ra-vao/phuong-tien.modal.importTitle')}
        width={500}
        queryParams={{ isUser }}
        onSuccess={() => {
          refetch();
        }}
      />

      <ModalExportExcel
        {...exportModalProps}
        exportUrl='vehicles/export'
        fileName='Vehicles'
        queryParams={{ isUser }}
        onSuccess={closeExport}
      />
    </List>
  );
}
