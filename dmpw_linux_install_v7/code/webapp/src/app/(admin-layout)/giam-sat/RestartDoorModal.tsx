import { forwardRef, useImperativeHandle, useState } from 'react';
import { useModal } from '@refinedev/antd';
import { useCustomMutation, useTranslate } from '@refinedev/core';
import { Modal } from 'antd';

export type RestartDoorModalRef = {
  show: (ids: number[]) => void;
};

const RestartDoorModal = forwardRef<RestartDoorModalRef>((_, ref) => {
  const t = useTranslate();

  const [ids, setIds] = useState<number[]>([]);

  const { modalProps, show, close } = useModal();

  const { mutate, isPending } = useCustomMutation();

  useImperativeHandle(ref, () => ({
    show: (ids) => {
      setIds(ids);
      show();
    },
  }));

  const handleRestart = () => {
    mutate(
      {
        url: 'devices/send-device-instruction',
        method: 'post',
        values: { ids, command: 'Reset' },
        successNotification: (data: any) => ({ type: 'success', message: data?.data?.message }),
        errorNotification: (data: any) => ({ type: 'error', message: data?.message }),
      },
      {
        onSuccess: () => {
          close();
        },
      },
    );
  };

  return (
    <Modal
      {...modalProps}
      title={t('giam-sat/restart-door-modal.title')}
      width={600}
      okText={t('buttons.restart')}
      cancelText={t('buttons.cancel')}
      onOk={handleRestart}
      okButtonProps={{ loading: isPending }}
    >
      <p>{t('giam-sat/restart-door-modal.confirmMessage')}</p>
    </Modal>
  );
});

RestartDoorModal.displayName = 'RestartDoorModal';

export default RestartDoorModal;
