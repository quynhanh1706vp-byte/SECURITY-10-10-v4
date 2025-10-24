'use client';

import React, { useState } from 'react';
import { List } from '@refinedev/antd';
import { useTranslation, useGetIdentity } from '@refinedev/core';
import { Avatar, Tag, Card, Row, Col, Descriptions, Divider } from 'antd';
import { ChangePasswordForm } from '@components/profile/ChangePasswordForm';
import { TSaveAuthUser } from '@types';

const getRandomColor = () => {
  const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8', '#4ade80'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function Page() {
  const { translate: t } = useTranslation();
  const { data: user } = useGetIdentity<TSaveAuthUser>();
  const [bgColor] = useState(getRandomColor());

  return (
    <List title={t('profile.title', 'Profile')}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className='h-full'>
            <div className='flex flex-col items-center'>
              {user?.avatar ? (
                <Avatar size={120} src={user.avatar} className='mb-4' />
              ) : (
                <div
                  className='mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-full text-4xl font-semibold text-white select-none'
                  style={{ backgroundColor: bgColor }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}

              <h2 className='text-xl font-bold mb-2'>{user?.fullName || user?.username}</h2>
              <Tag color='blue' className='mb-4'>{user?.role}</Tag>

              <Divider />

              <div className='w-full'>
                <Descriptions column={1} labelStyle={{ fontWeight: 500, width: '120px' }}>
                  <Descriptions.Item label={t('profile.fields.fullName', 'Name')}>
                    {user?.fullName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.fields.username', 'Username')}>
                    {user?.username}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('profile.fields.role', 'Role')}>
                    {user?.role || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <div className='flex items-center justify-between'>
                <span>{t('profile.sections.password', 'Change Password')}</span>
              </div>
            }
            className='h-full'
          >
            <ChangePasswordForm />
          </Card>
        </Col>
      </Row>
    </List>
  );
}
