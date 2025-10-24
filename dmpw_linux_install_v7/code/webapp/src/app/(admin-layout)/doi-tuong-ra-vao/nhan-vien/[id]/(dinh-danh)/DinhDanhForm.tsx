'use client';

import { useMemo } from 'react';
import { useCustom, useTranslation } from '@refinedev/core';
import { TUserInit } from '@types';
import { Form, FormProps, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';

export default function DinhDanhForm(formProps: FormProps) {
  const { translate: t } = useTranslation();
  const { data: userInitRes } = useCustom<TUserInit>({
    url: 'users/init',
    method: 'get',
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
  });

  const userInit = useMemo(() => userInitRes?.data, [userInitRes]);

  const cardType = Form.useWatch('cardType', formProps.form);

  return (
    <Form {...formProps} layout='vertical'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Form.Item
          label={t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.cardType')}
          name='cardType'
          initialValue={userInit?.cardTypes[0].id}
        >
          <Select options={userInit?.cardTypes} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>

        {(cardType === 0 || cardType === 1) && (
          <Form.Item
            label={t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.cardId')}
            name='cardId'
            rules={
              cardType === 0
                ? [
                    {
                      required: true,
                      whitespace: true,
                      message: t('doi-tuong-ra-vao/nhan-vien.identification.form.validation.cardId'),
                    },
                    {
                      max: 40,
                      message: t('validation.maxLength', {
                        max: 40,
                        field: t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.cardId'),
                      }),
                    },
                    {
                      pattern: /^[a-zA-Z0-9]+$/,
                      message: t('doi-tuong-ra-vao/nhan-vien.identification.form.validation.cardIdPattern'),
                    }
                  ]
                : []
            }
          >
            <Input placeholder={t('doi-tuong-ra-vao/nhan-vien.identification.form.placeholders.cardId')} />
          </Form.Item>
        )}
      </div>

      <Form.Item label={t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.note')} name='description'>
        <TextArea
          placeholder={t('doi-tuong-ra-vao/nhan-vien.identification.form.placeholders.note')}
          showCount
          maxLength={100}
          autoSize={{ minRows: 2, maxRows: 3 }}
        />
      </Form.Item>

      {cardType === 0 && (
        <Form.Item
          label={t('doi-tuong-ra-vao/nhan-vien.identification.form.fields.cardStatus')}
          name='cardStatus'
          initialValue={userInit?.cardStatus[0].id}
        >
          <Select options={userInit?.cardStatus} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
      )}
    </Form>
  );
}
