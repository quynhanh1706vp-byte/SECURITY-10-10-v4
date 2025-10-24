import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import DeleteButton from '@components/ui/DeleteButton';
import { useCustomTable } from '@hooks';
import { formatDateTime } from '@lib/datetime';
import { useModal } from '@refinedev/antd';
import { BaseKey, useCan, useTranslation, useUpdate } from '@refinedev/core';
import { Button, Input, Table, Tabs } from 'antd';
import { $permissions } from '@constants/permmission';
import { useModal as useConfirmModal } from '@/contexts/modal';

const { Column } = Table;

type DanhSachNhanVienProps = {
  departmentId?: string;
};

export default function DanhSachNhanVien({ departmentId }: DanhSachNhanVienProps) {
  const { translate: t } = useTranslation();
  const confirmModal = useConfirmModal();

  const { data: canDelete } = useCan({
    resource: 'departments',
    action: 'delete',
    params: { authority: $permissions.DELETE_DEPARTMENT },
  });

  const { data: canEdit } = useCan({
    resource: 'departments',
    action: 'edit',
    params: { authority: $permissions.EDIT_DEPARTMENT },
  });

  const { tableProps, selectedRowKeys, tableQuery, handleDeleteSuccess, setSelectedRowKeys } = useCustomTable({
    resource: 'users-dept-assign',
    filters: {
      permanent: [
        {
          field: 'departmentId',
          operator: 'eq',
          value: departmentId,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: 'firstName',
          order: 'asc',
        },
      ],
    },
  });

  const {
    tableProps: unAssignTableProps,
    selectedRowKeys: unAssignSelectedRowKeys,
    tableQuery: unAssignTableQuery,
    handleSearch: unAssignHandleSearch,
    resetTable: resetUnAssignTable,
  } = useCustomTable({
    resource: 'users-dept-unassign',
    filters: {
      permanent: [
        {
          field: 'departmentId',
          operator: 'eq',
          value: departmentId,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: 'firstName',
          order: 'asc',
        },
      ],
    },
  });

  const { mutate: unAssignMutate, isLoading: isUnAssignLoading } = useUpdate({
    resource: `departments/${departmentId}/un-assign`,
    id: '',
    meta: { method: 'post' },
    mutationOptions: {
      onSuccess: (_, variables) => {
        tableQuery.refetch();
        unAssignTableQuery.refetch();
        setSelectedRowKeys([]);

        handleDeleteSuccess(variables?.values as BaseKey[]);
      },
    },
  });

  const { modalProps, show, close } = useModal();

  const { mutate: assignMutate, isLoading: isAssignLoading } = useUpdate({
    resource: `departments/${departmentId}/assign`,
    id: '',
    meta: {
      method: 'post',
    },
    mutationOptions: {
      onSuccess: () => {
        tableQuery.refetch();
        unAssignTableQuery.refetch();
        close();
      },
    },
  });

  const TabContent = () => {
    return (
      <div>
        <div className='flex items-center gap-4'>
          {selectedRowKeys.length > 0 && (
            <div>{t('cau-hinh/departments.departments.selected', { count: selectedRowKeys.length })}</div>
          )}

          <div className='ml-auto flex gap-6'>
            {canEdit?.can && (
              <Button type='primary' onClick={() => show()}>
                {t('cau-hinh/departments.departments.buttons.assign')}
              </Button>
            )}

            {selectedRowKeys.length > 0 && canDelete?.can && (
              <Button
                variant='outlined'
                color='danger'
                icon={<DeleteOutlined />}
                onClick={() => {
                  confirmModal.confirm({
                    title: t('cau-hinh/departments.departments.multipleDeleteConfirm.title'),
                    content: t('cau-hinh/departments.departments.multipleDeleteConfirm.message', {
                      count: selectedRowKeys.length,
                    }),
                    icon: <ExclamationCircleOutlined className='!text-[#FAAD14]' />,
                    okText: t('buttons.delete'),
                    cancelText: t('buttons.cancel'),
                    cancelButtonProps: { color: 'primary', variant: 'outlined' },
                    onOk: () => unAssignMutate({ values: selectedRowKeys }),
                  });
                }}
              >
                {t('buttons.delete')}
              </Button>
            )}
          </div>
        </div>

        <Table
          {...tableProps}
          className='mt-4'
          loading={tableProps.loading || isUnAssignLoading}
          scroll={{ y: '66vh' }}
        >
          <Column title={t('cau-hinh/departments.departments.columns.name')} dataIndex='firstName' width={150} />
          <Column title={t('cau-hinh/departments.departments.columns.employeeNo')} dataIndex='employeeNo' width={120} />
          <Column
            title={t('cau-hinh/departments.departments.columns.departmentName')}
            dataIndex='departmentName'
            width={120}
          />
          <Column
            title={t('cau-hinh/departments.departments.columns.effectiveDate')}
            dataIndex='effectiveDate'
            render={(value) => <div>{formatDateTime(value)}</div>}
            width={180}
          />
          <Column
            title={t('cau-hinh/departments.departments.columns.expiredDate')}
            dataIndex='expiredDate'
            render={(value) => <div>{formatDateTime(value)}</div>}
            width={180}
          />
          {(canEdit?.can || canDelete?.can) && (
            <Column
              title={t('cau-hinh/departments.departments.columns.actions')}
              width={150}
              render={(_, record) => (
                <div className='flex gap-1'>
                  {canEdit?.can && (
                    <Button
                      color='primary'
                      variant='text'
                      size='small'
                      href={`/doi-tuong-ra-vao/nhan-vien/${record.id}`}
                      target='_blank'
                    >
                      {t('buttons.edit')}
                    </Button>
                  )}

                  {canDelete?.can && (
                    <DeleteButton
                      resource={`departments/${departmentId}/un-assign`}
                      color='primary'
                      variant='text'
                      size='small'
                      icon={null}
                      recordItemId={record.id}
                      confirmTitle={t('cau-hinh/departments.departments.deleteConfirm.title')}
                      confirmMessage={t('cau-hinh/departments.departments.deleteConfirm.message')}
                      onConfirm={() => unAssignMutate({ values: [record.id] })}
                      disabled={false}
                    />
                  )}
                </div>
              )}
            />
          )}
        </Table>
      </div>
    );
  };

  if (!departmentId) {
    return;
  }

  return (
    <div className='min-w-0 flex-1 bg-white p-2.5'>
      <Tabs
        items={[
          {
            key: '1',
            label: t('cau-hinh/departments.departments.tabs.employees'),
            children: <TabContent />,
          },
        ]}
      ></Tabs>

      <Modal
        {...modalProps}
        centered
        title={t('cau-hinh/departments.departments.assignModalTitle')}
        width={1000}
        okText={t('buttons.save')}
        okButtonProps={{ loading: isAssignLoading, onClick: () => assignMutate({ values: unAssignSelectedRowKeys }) }}
        cancelText={t('buttons.cancel')}
        onCancel={(ev) => {
          modalProps.onCancel?.(ev);
          resetUnAssignTable();
        }}
      >
        <Input.Search placeholder={t('common.search')} className='w-[400px]' onChange={unAssignHandleSearch} />

        <Table {...unAssignTableProps} className='mt-4' scroll={{ y: '40vh' }}>
          <Column title={t('cau-hinh/departments.departments.columns.name')} dataIndex='firstName' width={150} />
          <Column title={t('cau-hinh/departments.departments.columns.employeeNo')} dataIndex='employeeNo' width={120} />
          <Column
            title={t('cau-hinh/departments.departments.columns.departmentName')}
            dataIndex='departmentName'
            width={120}
          />
          <Column
            title={t('cau-hinh/departments.departments.columns.effectiveDate')}
            dataIndex='effectiveDate'
            render={(value) => <div>{formatDateTime(value)}</div>}
            width={180}
          />
          <Column
            title={t('cau-hinh/departments.departments.columns.expiredDate')}
            dataIndex='expiredDate'
            render={(value) => <div>{formatDateTime(value)}</div>}
            width={180}
          />
        </Table>
      </Modal>
    </div>
  );
}
