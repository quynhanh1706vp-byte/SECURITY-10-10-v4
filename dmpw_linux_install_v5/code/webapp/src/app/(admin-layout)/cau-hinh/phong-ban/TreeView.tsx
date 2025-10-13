import { ExclamationCircleOutlined, MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useTree } from '@hooks';
import { useModalForm } from '@refinedev/antd';
import { useCan, useDelete, useTranslation } from '@refinedev/core';
import { Button, Dropdown, Empty, Input, Modal as ModalPrimitive, Pagination, Spin, Tree, Typography } from 'antd';

import PhongBanForm from './PhongBanForm';
import { $permissions } from '@constants/permmission';

const { Search } = Input;

type TreeViewProps = {
  onSelectDepartment?: (id: string) => void;
};

export default function TreeView({ onSelectDepartment }: TreeViewProps) {
  const { translate: t } = useTranslation();
  const { data: canCreate } = useCan({
    resource: 'departments',
    action: 'create',
    params: { authority: $permissions.ADD_DEPARTMENT },
  });

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

  const {
    treeProps,
    query: { data, refetch, isFetching },
    current,
    pageSize,
    checkedKeys,
    handleCheckedAll,
    handleUnCheckedAll,
    handleSearch,
    handleDeleteSuccess,
    setCurrent,
    setPageSize,
  } = useTree({
    resource: 'departments/get-department-tree',
    nodeLabel: 'departmentName',
    nodeValue: 'id',
  });

  const {
    modalProps: createModalProps,
    show: createModalShow,
    formProps: createFormProps,
  } = useModalForm({
    resource: 'departments',
    action: 'create',
    onMutationSuccess: () => {
      refetch();
    },
  });

  const {
    modalProps: editModalProps,
    show: editModalShow,
    formProps: editFormProps,
    formLoading: editFormLoading,
  } = useModalForm({
    resource: 'departments',
    action: 'edit',
    onMutationSuccess: () => {
      refetch();
    },
  });

  const { mutate: deleteMutate } = useDelete();
  const [modal, contextHolder] = ModalPrimitive.useModal();

  const handleDelete = (id: string) => {
    modal.confirm({
      title: t(`departments.deleteConfirm.title`),
      content: t(`departments.deleteConfirm.message`),
      icon: <ExclamationCircleOutlined />,
      okText: t('buttons.delete'),
      cancelText: t('buttons.cancel'),
      cancelButtonProps: { color: 'primary', variant: 'outlined' },
      onOk: () =>
        deleteMutate(
          { id, resource: 'departments' },
          {
            onSuccess: () => {
              handleDeleteSuccess(id);
            },
          },
        ),
    });
  };

  return (
    <Spin spinning={isFetching}>
      <div className='w-[356px] bg-white px-2.5 py-6 pb-4'>
        <div className='flex justify-between'>
          {canCreate?.can && (
            <Button type='primary' onClick={() => createModalShow()}>
              {t('cau-hinh/departments.departments.add')}
            </Button>
          )}

          <Button icon={<ReloadOutlined />} onClick={() => refetch()}></Button>
        </div>

        <div className='mt-2.5'>
          <Search
            placeholder={t('cau-hinh/departments.departments.search')}
            className='w-full'
            onChange={handleSearch}
          />
        </div>

        <div className='mt-4 flex h-8 items-center gap-4'>
          {checkedKeys.length > 0 && canDelete?.can && (
            <MultipleDeleteButton
              ids={checkedKeys}
              resource='departments'
              hideText
              onSuccess={() => {
                handleDeleteSuccess(checkedKeys);
              }}
            />
          )}

          <div className='ml-auto flex gap-6 font-medium'>
            {checkedKeys.length > 0 && (
              <div>{t('cau-hinh/departments.departments.selected', { count: checkedKeys.length })}</div>
            )}
            {!!data?.meta?.recordsTotal && (
              <div>{t('cau-hinh/departments.departments.total', { count: data.meta.recordsTotal })}</div>
            )}
          </div>
        </div>

        {data?.data?.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className='bg-[#F7F9FC] p-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  color='primary'
                  variant='outlined'
                  onClick={() => {
                    const keys = handleCheckedAll();
                    onSelectDepartment?.(keys[0] as string);
                  }}
                >
                  {t('actions.selectAll')}
                </Button>

                <Button
                  color='danger'
                  variant='outlined'
                  onClick={() => {
                    handleUnCheckedAll();
                    onSelectDepartment?.('');
                  }}
                >
                  {t('actions.unselectAll')}
                </Button>
              </div>

              <div className='mt-2.5 h-[calc(100vh-450px)] overflow-auto'>
                <Tree
                  {...treeProps}
                  titleRender={(department: any) => {
                    return (
                      <div className='flex'>
                        <div className='min-w-0 flex-1'>
                          <Typography.Text ellipsis={{ tooltip: department.departmentName }}>
                            {department.departmentName}
                          </Typography.Text>
                        </div>

                        {(canEdit?.can || canDelete?.can) && (
                          <>
                            <Dropdown
                              menu={{
                                items: [
                                  ...(canEdit?.can
                                    ? [
                                        {
                                          key: 'edit',
                                          label: t('buttons.edit'),
                                          onClick: () => {
                                            editModalShow(department.id);
                                          },
                                        },
                                      ]
                                    : []),
                                  ...(canDelete?.can
                                    ? [
                                        {
                                          key: 'delete',
                                          label: t('buttons.delete'),
                                          onClick: () => handleDelete(department.id),
                                        },
                                      ]
                                    : []),
                                ],
                                onClick: (ev) => ev.domEvent.stopPropagation(),
                              }}
                              placement='bottomRight'
                            >
                              <Button
                                type='text'
                                size='small'
                                onClick={(ev) => ev.stopPropagation()}
                                icon={<MoreOutlined className='rotate-90' />}
                                className='hover:bg-transparent!'
                              />
                            </Dropdown>
                          </>
                        )}
                      </div>
                    );
                  }}
                  onSelect={(keys) => {
                    treeProps.onSelect(keys);

                    if (keys.length > 0) {
                      onSelectDepartment?.(keys[0] as string);
                    }
                  }}
                  className='p-0'
                />
              </div>
            </div>

            <Pagination
              className='mt-4 flex-wrap justify-end gap-y-4'
              total={data?.total || 0}
              pageSize={pageSize}
              current={current}
              onChange={(page, pageSize) => {
                setCurrent(page);
                setPageSize(pageSize);
              }}
              showSizeChanger
            />
          </>
        )}
      </div>

      <Modal {...createModalProps} width={700}>
        <PhongBanForm {...createFormProps} />
      </Modal>

      <Modal {...editModalProps} width={700}>
        <Spin spinning={editFormLoading}>
          <PhongBanForm {...editFormProps} />
        </Spin>
      </Modal>

      {contextHolder}
    </Spin>
  );
}
