'use client';

import { useEffect, useMemo } from 'react';
import { useCustom, useTranslation } from '@refinedev/core';
import { Form, FormProps, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TUserInit } from '@types';

export default function TraTheForm(formProps: FormProps) {
  const { translate: t } = useTranslation();

  const { data: userInitRes } = useCustom<TUserInit>({
    url: 'users/init',
    method: 'get',
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
  });

  const userInit = useMemo(() => userInitRes?.data, [userInitRes]);

  return (
    <Form {...formProps} layout='vertical'>
      <Form.Item label={t('doi-tuong-ra-vao/nhan-vien.identification.returnForm.fields.cardId')} name='cardId'>
        <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.identification.returnForm.placeholders.cardId')} disabled />
      </Form.Item>

      <Form.Item label={t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.cardStatus')} name='cardStatus'>
        <Select options={userInit?.cardStatus} fieldNames={{ label: 'name', value: 'id' }} />
      </Form.Item>

      <Form.Item
        label={t('doi-tuong-ra-vao/nhan-vien.identification.returnForm.fields.reason')}
        name='description'
        rules={[
          {
            max: 100,
            message: t('validation.maxLength', {
              max: 100,
              field: t('doi-tuong-ra-vao/nhan-vien.identification.returnForm.fields.reason'),
            }),
          },
        ]}
      >
        <TextArea
          placeholder={t('doi-tuong-ra-vao/nhan-vien.identification.returnForm.placeholders.reason')}
          allowClear
          style={{ resize: 'vertical', minHeight: 20 }}
        />
      </Form.Item>
    </Form>
  );
}
