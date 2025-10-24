'use client';

import React from 'react';
import { formatDateTime } from '@lib/datetime';
import { useOne, useTranslation } from '@refinedev/core';
import { Descriptions, Spin, Typography } from 'antd';

export default function ThongTinChung({ id }: { id: number }) {
  const { translate: t } = useTranslation();

  const { data: visitData, isLoading } = useOne({
    resource: 'visits',
    id,
  });

  const data = visitData?.data || {};

  return (
    <Spin spinning={isLoading}>
      <Descriptions column={2} layout='horizontal' bordered={false} size='middle' labelStyle={{ fontWeight: 'bold' }}>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitorName')}>
          <strong>{data.visitorName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.visiteeId')}>
          <strong>{data.visiteeName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.documentNumber')}>
          <strong>{data.documentNumber}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitorDepartment')}>
          <strong>{data.visitorDepartment}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.phone')}>
          <strong>{data.phone}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.roomNumber')}>
          <strong>{data.roomNumber}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.visiteeDepartment')}>
          <strong>{data.visiteeDepartment}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.visitReason')}>
          <div className='max-h-[300px] overflow-y-auto'>
            <strong>{data.visitReason}</strong>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.startTime')}>
          <strong>{formatDateTime(data.startDate, 'DD/MM/YYYY HH:mm:ss')}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={t('doi-tuong-ra-vao/khach-moi.form.fields.endTime')}>
          <strong>{formatDateTime(data.endDate, 'DD/MM/YYYY HH:mm:ss')}</strong>
        </Descriptions.Item>
      </Descriptions>
    </Spin>
  );
}
