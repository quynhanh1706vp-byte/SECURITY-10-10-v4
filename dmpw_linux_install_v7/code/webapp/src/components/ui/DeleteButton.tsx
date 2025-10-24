'use client';

import React, { useCallback, useMemo } from 'react';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { DeleteButtonProps } from '@refinedev/antd';
import { useDeleteButton, useTranslate } from '@refinedev/core';
import { RefineButtonClassNames } from '@refinedev/ui-types';
import { Button } from 'antd';

import { useModal } from '@/contexts/modal';

type CustomDeleteButtonProps = DeleteButtonProps & {
  confirmMessage?: React.ReactNode;
  onConfirm?: () => void;
  isNeedConfirm?: boolean;
};

const DeleteButton: React.FC<CustomDeleteButtonProps> = ({
  resource: resourceNameFromProps,
  resourceNameOrRouteName: propResourceNameOrRouteName,
  recordItemId,
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
  onConfirm: onConfirmFromProps,
  isNeedConfirm = true,
  ...rest
}) => {
  const modal = useModal();
  const translate = useTranslate();

  const resource = resourceNameFromProps ?? propResourceNameOrRouteName;

  const {
    label,
    hidden,
    disabled,
    loading,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
    onConfirm,
  } = useDeleteButton({
    resource,
    id: recordItemId,
    dataProviderName,
    invalidates,
    meta,
    onSuccess,
    mutationMode: mutationModeProp,
    errorNotification,
    successNotification,
    accessControl,
  });

  const title = useMemo(
    () => confirmTitle ?? translate(`${resource}.deleteConfirm.title`),
    [confirmTitle, resource, translate],
  );
  const content = useMemo(
    () => confirmMessage ?? translate(`${resource}.deleteConfirm.message`),
    [confirmMessage, resource, translate],
  );

  const handleClick = useCallback(() => {
    if (isNeedConfirm) {
      modal.confirm({
        title,
        content,
        icon: <ExclamationCircleOutlined className='!text-[#FAAD14]' />,
        okText: confirmOkText ?? defaultConfirmOkLabel,
        cancelText: confirmCancelText ?? defaultCancelLabel,
        cancelButtonProps: { color: 'primary', variant: 'outlined' },
        onOk: onConfirmFromProps ?? onConfirm,
      });
    } else {
      onConfirmFromProps ?? onConfirm();
    }
  }, [
    modal,
    title,
    content,
    confirmOkText,
    defaultConfirmOkLabel,
    confirmCancelText,
    defaultCancelLabel,
    onConfirm,
    onConfirmFromProps,
    isNeedConfirm,
  ]);

  if (hidden || rest.hidden) return null;

  return (
    <Button
      danger
      loading={loading}
      title={title}
      disabled={disabled || rest.disabled}
      className={RefineButtonClassNames.DeleteButton}
      {...rest}
      onClick={handleClick}
    >
      {!hideText && (children ?? label)}
    </Button>
  );
};

export default React.memo(DeleteButton);
