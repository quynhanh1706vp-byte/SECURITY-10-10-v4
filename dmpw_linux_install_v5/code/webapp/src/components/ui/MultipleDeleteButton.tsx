import React from 'react';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMultipleDeleteButton } from '@hooks';
import type { DeleteButtonProps } from '@refinedev/antd';
import { BaseKey, useTranslate } from '@refinedev/core';
import { RefineButtonClassNames } from '@refinedev/ui-types';
import { Button, Modal, ModalFuncProps, Popconfirm } from 'antd';

type MultipleDeleteButtonProps = Omit<DeleteButtonProps, 'recordItemId'> & {
  ids: BaseKey[]; // Array of record IDs to delete
  confirmMessage?: React.ReactNode;
};

export const MultipleDeleteButton: React.FC<MultipleDeleteButtonProps> = ({
  resource: resourceNameFromProps,
  resourceNameOrRouteName: propResourceNameOrRouteName,
  ids,
  onSuccess,
  mutationMode: mutationModeProp,
  children,
  successNotification,
  errorNotification,
  hideText = false,
  accessControl,
  metaData,
  meta,
  dataProviderName,
  confirmTitle,
  confirmMessage,
  confirmOkText,
  confirmCancelText,
  invalidates,
  ...rest
}) => {
  const resource = resourceNameFromProps ?? propResourceNameOrRouteName;

  const {
    label,
    loading,
    disabled,
    // confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
    onConfirm,
  } = useMultipleDeleteButton({
    resource: resourceNameFromProps ?? propResourceNameOrRouteName,
    ids,
    dataProviderName,
    invalidates,
    meta,
    onSuccess,
    mutationMode: mutationModeProp,
    errorNotification,
    successNotification,
    accessControl,
  });

  const translate = useTranslate();
  const [modal, contextHolder] = Modal.useModal();

  const modalConfirmConfig: ModalFuncProps = {
    title: confirmTitle ?? translate(`${resource}.multipleDeleteConfirm.title`),
    content: confirmMessage ?? translate(`${resource}.multipleDeleteConfirm.message`, { count: ids.length }),
    icon: <ExclamationCircleOutlined className='!text-[#FAAD14]' />,
    okText: confirmOkText ?? defaultConfirmOkLabel,
    cancelText: confirmCancelText ?? defaultCancelLabel,
    cancelButtonProps: { color: 'primary', variant: 'outlined' },
    onOk: onConfirm,
  };

  const isDisabled = rest.disabled || disabled;
  const isHidden = rest.hidden;

  if (isHidden) return null;

  return (
    <>
      <Button
        danger
        loading={loading}
        icon={<DeleteOutlined />}
        disabled={isDisabled}
        className={RefineButtonClassNames.DeleteButton}
        {...rest}
        onClick={() => modal.confirm(modalConfirmConfig)}
      >
        {!hideText && (children ?? label)}
      </Button>

      {contextHolder}
    </>
  );
};
