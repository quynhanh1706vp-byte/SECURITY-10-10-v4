import { useParams } from 'next/navigation';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useCustomTable } from '@hooks';
import { useModal } from '@refinedev/antd';
import { useInvalidate, useTranslation, useUpdate } from '@refinedev/core';
import { Button, Input, Table, TableProps } from 'antd';

const { Search } = Input;

type DataType = any;

export default function NhanVien() {
  const { translate: t } = useTranslation();

  const params = useParams();
  const { id } = params as { id: string };

  const { tableProps, selectedRowKeys, handleDeleteSuccess } = useCustomTable({
    resource: `access-groups/${id}/users`,
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
    tableProps: unAssignedUsersTableProps,
    selectedRowKeys: unAssignedUsersRowKeys,
    resetTable: resetUnAssignedUsersTable,
    handleSearch: handleUnAssignedUsersSearch,
  } = useCustomTable({
    resource: `access-groups/${id}/unassigned-users`,
    sorters: {
      initial: [
        {
          field: 'firstName',
          order: 'asc',
        },
      ],
    },
  });

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('bao-cao/access-groups.accessGroups.table.name'),
      dataIndex: 'firstName',
      width: 200,
    },
    {
      title: t('bao-cao/access-groups.accessGroups.table.employeeNo'),
      dataIndex: 'employeeNo',
      width: 150,
    },
    {
      title: t('bao-cao/access-groups.accessGroups.table.departmentName'),
      dataIndex: 'departmentName',
      width: 150,
    },
    {
      title: t('bao-cao/access-groups.accessGroups.table.workTypeName'),
      dataIndex: 'workTypeName',
      width: 150,
    },
  ];

  const { modalProps, show, close } = useModal();

  const invalidate = useInvalidate();

  const { mutate, isLoading } = useUpdate({
    resource: `access-groups/${id}/assign-users`,
    id: '',
    meta: {
      method: 'post',
    },
    mutationOptions: {
      onSuccess: () => {
        invalidate({
          resource: `access-groups/${id}/users`,
          invalidates: ['list'],
        });

        invalidate({
          resource: `access-groups/${id}/unassigned-users`,
          invalidates: ['list'],
        });

        close();
        resetUnAssignedUsersTable();
      },
    },
  });

  return (
    <>
      <div className='flex items-center'>
        <div className='ml-auto flex gap-6'>
          <Button type='primary' onClick={() => show()}>
            {t('bao-cao/access-groups.accessGroups.assign.addUser')}
          </Button>

          {selectedRowKeys.length > 0 && (
            <MultipleDeleteButton
              resource={`access-groups/${id}/unassign-users`}
              ids={selectedRowKeys}
              onSuccess={() => {
                invalidate({
                  resource: `access-groups/${id}/users`,
                  invalidates: ['list'],
                });

                handleDeleteSuccess(selectedRowKeys);
              }}
              confirmTitle={t('access-groups.unassign-users.multipleDeleteConfirm.title')}
              confirmMessage={t('access-groups.unassign-users.multipleDeleteConfirm.message', {
                count: selectedRowKeys.length,
              })}
              disabled={false}
            />
          )}
        </div>
      </div>

      <Table {...tableProps} columns={columns} className='mt-4' scroll={{ y: '66vh' }} />

      <Modal
        {...modalProps}
        title={t('bao-cao/access-groups.accessGroups.assign.modal.assignUserTitle')}
        width={1000}
        destroyOnHidden
        okText={t('buttons.save')}
        cancelText={t('buttons.cancel')}
        okButtonProps={{
          loading: isLoading,
          onClick: () =>
            mutate({
              values: unAssignedUsersRowKeys,
            }),
        }}
        onCancel={() => {
          close();
          resetUnAssignedUsersTable();
        }}
      >
        <div className='flex gap-2.5'>
          <Search placeholder={t('common.search')} className='w-[264px]' onChange={handleUnAssignedUsersSearch} />
        </div>

        <Table
          {...unAssignedUsersTableProps}
          columns={columns}
          className='mt-4'
          scroll={{ x: 'max-content', y: '66vh' }}
        />
      </Modal>
    </>
  );
}
