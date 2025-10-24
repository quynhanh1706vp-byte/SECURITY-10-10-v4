import React, { useEffect } from 'react';
import { ExclamationCircleOutlined, MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import Modal from '@components/ui/Modal';
import { MultipleDeleteButton } from '@components/ui/MultipleDeleteButton';
import { useTree } from '@hooks';
import { useModalForm } from '@refinedev/antd';
import { CanAccess, useDelete, useTranslation, useCan } from '@refinedev/core';
import { BaseKey } from '@refinedev/core';
import { Button, Dropdown, Empty, Input, Modal as ModalPrimitive, Pagination, Spin, Tree, Typography } from 'antd';

import DonViForm from './DonViForm';

const { Search } = Input;

type TreeViewProps = {
  onSelectBuilding: (ids: BaseKey[]) => void;
  onAssignDoor: (id: BaseKey) => void;
};

export default function TreeView({ onSelectBuilding, onAssignDoor }: TreeViewProps) {
  const { translate: t } = useTranslation();

  // Check permissions once at component level
  const { data: canEdit } = useCan({
    action: 'edit',
    params: { authority: 'building.editBuilding' },
  });

  const { data: canDelete } = useCan({
    action: 'delete',
    params: { authority: 'building.deleteBuilding' },
  });

  const { data: canAssign } = useCan({
    action: 'create',
    params: { authority: 'building.editBuilding' },
  });

  const {
    treeProps,
    query: { data, refetch, isFetching },
    current,
    pageSize,
    checkedKeys,
    selectedKeys,
    handleSearch,
    handleDeleteSuccess,
    setCurrent,
    setPageSize,
    handleCheckedAll,
    handleUnCheckedAll,
  } = useTree({
    resource: 'buildings/get-building-tree',
  });

  useEffect(() => {
    onSelectBuilding(selectedKeys);
  }, [selectedKeys]);

  const {
    modalProps: createModalProps,
    show: createModalShow,
    formProps: createFormProps,
  } = useModalForm({
    resource: 'buildings',
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
    id: editingId,
  } = useModalForm({
    resource: 'buildings',
    action: 'edit',
    warnWhenUnsavedChanges: false,
    onMutationSuccess: () => {
      refetch();
    },
  });

  const { mutate: deleteMutate } = useDelete();
  const [modal, contextHolder] = ModalPrimitive.useModal();

  const handleDelete = (id: string) => {
    modal.confirm({
      title: t(`buildings.deleteConfirm.title`),
      content: t(`buildings.deleteConfirm.message`),
      icon: <ExclamationCircleOutlined className='!text-[#FAAD14]' />,
      okText: t('buttons.delete'),
      cancelText: t('buttons.cancel'),
      cancelButtonProps: { color: 'primary', variant: 'outlined' },
      onOk: () =>
        deleteMutate(
          { id, resource: 'buildings' },
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
      <div className='w-[356px] bg-white px-2.5 py-6'>
        <div className='flex justify-between'>
          <CanAccess action='create' params={{ authority: 'building.addBuilding' }}>
            <Button type='primary' onClick={() => createModalShow()}>
              {t('quan-ly-ra-vao/don-vi.don-vi.buildings.buttons.add')}
            </Button>
          </CanAccess>

          <Button icon={<ReloadOutlined />} onClick={() => refetch()}></Button>
        </div>

        <div className='mt-2.5 mb-3'>
          <Search
            placeholder={t('quan-ly-ra-vao/don-vi.don-vi.buildings.search.placeholder')}
            className='w-full'
            onChange={handleSearch}
          />
        </div>

        <div className='mt-4 flex h-8 items-center gap-4'>
          <CanAccess action='delete' params={{ authority: 'building.deleteBuilding' }}>
            {checkedKeys.length > 0 && (
              <MultipleDeleteButton
                ids={checkedKeys}
                resource='buildings'
                hideText
                onSuccess={() => {
                  handleDeleteSuccess(checkedKeys);
                }}
              />
            )}
          </CanAccess>

          <div className='ml-auto flex gap-6 font-medium'>
            {checkedKeys.length > 0 && (
              <div>{t('quan-ly-ra-vao/don-vi.don-vi.buildings.selectedCount', { count: checkedKeys.length })}</div>
            )}
            {!!data?.meta?.recordsTotal && (
              <div>{t('quan-ly-ra-vao/don-vi.don-vi.buildings.totalCount', { count: data.meta.recordsTotal })}</div>
            )}
          </div>
        </div>

        {data?.data?.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className='bg-[#F7F9FC] p-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Button color='primary' variant='outlined' onClick={handleCheckedAll}>
                  {t('actions.selectAll')}
                </Button>

                <Button color='danger' variant='outlined' onClick={handleUnCheckedAll}>
                  {t('actions.unselectAll')}
                </Button>
              </div>

              <div className='mt-2.5 h-[calc(100vh-450px)] overflow-auto'>
                <Tree
                  {...treeProps}
                  titleRender={(building: any) => {
                    const menuItems = [];

                    // Only add items if user has permission
                    if (canEdit?.can) {
                      menuItems.push({
                        key: 'edit',
                        label: t('buttons.edit'),
                        onClick: () => {
                          editModalShow(building.id);
                        },
                      });
                    }

                    if (canDelete?.can) {
                      menuItems.push({
                        key: 'delete',
                        label: t('buttons.delete'),
                        onClick: () => handleDelete(building.id),
                      });
                    }

                    if (canAssign?.can) {
                      menuItems.push({
                        key: 'assign',
                        label: t('quan-ly-ra-vao/don-vi.don-vi.buildings.actions.assignAccessPoint'),
                        onClick: () => {
                          onAssignDoor(building.id);
                        },
                      });
                    }

                    return (
                      <div className='flex'>
                        <div className='min-w-0 flex-1'>
                          <Typography.Text ellipsis={{ tooltip: building.name }}>{building.name}</Typography.Text>
                        </div>

                        {menuItems.length > 0 && (
                          <Dropdown
                            menu={{
                              items: menuItems,
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
                            ></Button>
                          </Dropdown>
                        )}
                      </div>
                    );
                  }}
                  multiple
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
        <DonViForm {...createFormProps} />
      </Modal>

      <Modal {...editModalProps} width={700}>
        <Spin spinning={editFormLoading}>
          <DonViForm {...editFormProps} currentRecordId={editingId} />
        </Spin>
      </Modal>

      {contextHolder}
    </Spin>
  );
}
