'use client';

import { Checkbox, Form, FormProps } from 'antd';
import { useTranslation } from '@refinedev/core';
import { v4 as uuidv4 } from 'uuid';

type DongBoDuLieuFormProps = FormProps & {
  ids: number[];
};

export default function DongBoDuLieuForm({ ids, ...formProps }: DongBoDuLieuFormProps) {
  const { translate: t } = useTranslation();
  const transmitIds = Form.useWatch('transmitIds', formProps.form);

  const handleTransmitData = (values: any) => {
    const devices = ids.map((id) => ({ deviceId: id, processId: uuidv4() }));

    const data = {
      devices,
      transmitIds: values.transmitIds,
      isDeleteAllUser: true,
    };

    formProps.onFinish?.(data);
  };

  const transmitItems = [
    {
      id: 1,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.currentTime'),
    },
    {
      id: 2,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.deviceConfig'),
    },
    {
      id: 3,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.timezone'),
    },
    {
      id: 4,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.holiday'),
    },
    {
      id: 5,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.userInfo'),
    },
    {
      id: 6,
      name: t('quan-ly-ra-vao/diem-kiem-soat.dataSync.options.message'),
    },
  ];

  return (
    <Form {...formProps} onFinish={handleTransmitData}>
      <Checkbox
        onChange={(e) => {
          formProps.form?.setFieldValue('transmitIds', e.target.checked ? transmitItems.map((item) => item.id) : []);
        }}
        checked={transmitIds?.length === transmitItems.length}
        className='mb-6'
      >
        {t('quan-ly-ra-vao/diem-kiem-soat.dataSync.selectAll')}
      </Checkbox>

      <Form.Item name='transmitIds' className='mb-0' initialValue={transmitItems.map((item) => item.id)}>
        <Checkbox.Group>
          <div className='grid gap-6 md:grid-cols-2'>
            {transmitItems.map((item) => (
              <Checkbox key={item.id} value={item.id}>
                {item.name}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>
    </Form>
  );
}
