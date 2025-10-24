import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Modal from '@components/ui/Modal';
import { useModalForm } from '@refinedev/antd';
import { useTranslation } from '@refinedev/core';
import { DatePicker, Form, InputNumber, Radio } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export type TOpenDoorModalRef = {
  show: (ids: number[]) => void;
};

type TFormValues = {
  openPeriod: number;
  openUntilTime: Dayjs;
};

const OpenDoorModal = forwardRef<TOpenDoorModalRef>((_, ref) => {
  const { translate: t } = useTranslation();
  const { modalProps, formProps, form, show, close, onFinish } = useModalForm<TFormValues>({
    resource: 'devices/send-device-instruction',
    action: 'create',
    successNotification: (data: any) => ({ type: 'success', message: data?.data?.message }),
    errorNotification: (data: any) => ({ type: 'error', message: data?.message }),
    onMutationSuccess: () => {
      close();
    },
  });

  const [ids, setIds] = useState<number[]>([]);

  useImperativeHandle(ref, () => ({
    show: (ids) => {
      setIds(ids);
      show();
    },
  }));

  const [mode, setMode] = useState<'openPeriod' | 'openUntilTime' | 'release'>('openPeriod');

  useEffect(() => {
    form.validateFields(['openPeriod']);
  }, [mode]);

  const handleSubmit = async (values: TFormValues) => {
    const payload = {
      ids,
      command: mode === 'release' ? 'release' : 'Open',
      openPeriod: mode === 'openPeriod' ? values.openPeriod : undefined,
      openUntilTime:
        mode === 'openUntilTime'
          ? values.openUntilTime.format('DDMMYYYYHHmmss') + values.openUntilTime.format('ZZ').replace(':', '')
          : undefined,
    };

    onFinish(payload);
  };

  return (
    <Modal
      {...modalProps}
      width={600}
      onCancel={(ev) => {
        modalProps?.onCancel?.(ev);
        form.resetFields();
        setMode('openPeriod');
      }}
    >
      <Form {...formProps} layout='vertical' onFinish={(values) => handleSubmit(values as TFormValues)}>
        <Form.Item
          name='openPeriod'
          label={
            <div className='flex items-center gap-2'>
              <Radio checked={mode === 'openPeriod'} onChange={() => setMode('openPeriod')}>
                {t('giam-sat/open-door-modal.labels.openPeriod')}
              </Radio>
            </div>
          }
          rules={[
            {
              validator: (_, value) => {
                if (mode === 'openPeriod' && !value) {
                  return Promise.reject(new Error(t('giam-sat/open-door-modal.validation.enterOpenTime')));
                }
                return Promise.resolve();
              },
            },
          ]}
          initialValue={3}
        >
          <InputNumber min={1} max={254} className='w-full' disabled={mode !== 'openPeriod'} />
        </Form.Item>

        <Form.Item
          name='openUntilTime'
          label={
            <div className='flex items-center gap-2'>
              <Radio checked={mode === 'openUntilTime'} onChange={() => setMode('openUntilTime')}>
                {t('giam-sat/open-door-modal.labels.openUntilTime')}
              </Radio>
            </div>
          }
          initialValue={dayjs().endOf('day')}
        >
          <DatePicker className='w-full' disabled={mode !== 'openUntilTime'} showTime format='DD/MM/YYYY HH:mm:ss' />
        </Form.Item>

        <div className='flex items-center gap-2'>
          <Radio checked={mode === 'release'} onChange={() => setMode('release')}>
            {t('giam-sat/open-door-modal.labels.releaseEmergency')}
          </Radio>
        </div>
      </Form>
    </Modal>
  );
});

OpenDoorModal.displayName = 'OpenDoorModal';

export default OpenDoorModal;
