'use client';

import React, { useEffect } from 'react';
import { BellOutlined, DeleteOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { RefineThemedLayoutV2HeaderProps } from '@refinedev/antd';
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidate,
  useList,
  useNotification,
  useTranslation,
  useUpdate,
} from '@refinedev/core';
import { useLogout } from '@refinedev/core';
import {
  Avatar,
  Dropdown,
  Layout as AntdLayout,
  MenuProps,
  notification,
  Popover,
  Switch,
  Typography,
  Button,
  Empty,
} from 'antd';
import clsx from 'clsx';

import { setUserLocale } from '@i18n';
import { useRouter } from 'next/navigation';
import { INotification, IWsNotification, TSaveAuthUser } from '@types';
import DeleteButton from '@components/ui/DeleteButton';
import dayjs from 'dayjs';
import { eventEmitter } from '@lib/event-emitter';

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({ sticky = true }) => {
  const { data: user } = useGetIdentity<TSaveAuthUser>();
  const { changeLocale, getLocale, translate: t } = useTranslation();
  const { mutate: logout } = useLogout();
  const router = useRouter();

  const { data: notifications, refetch } = useList<INotification>({
    resource: 'notifications',
    sorters: [
      {
        field: '1',
        order: 'desc',
      },
    ],
    queryOptions: {
      enabled: !!user,
    },
  });

  const invalidate = useInvalidate();

  const onChangeLanguage: MenuProps['onClick'] = async ({ key }) => {
    changeLocale(key);
    await setUserLocale(key as string);

    // Invalidate all queries to refresh the data after changing the language
    invalidate({ invalidates: ['all'] });
  };

  const items: MenuProps['items'] = [
    {
      label: 'English',
      key: 'en',
      icon: <Avatar className='mr-1' src='/images/flags/en.svg' alt='English' size={20} />,
    },
    {
      label: 'Tiếng Việt',
      key: 'vi',
      icon: <Avatar className='mr-1' src='/images/flags/vi.svg' alt='Tiếng Việt' size={20} />,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('auth.menu.profile'),
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('auth.menu.logout'),
      icon: <LogoutOutlined />,
    },
  ];

  const onChangeUserProfile: MenuProps['onClick'] = async (info) => {
    if (info.key === 'logout') {
      logout();
      notification.success({
        message: t('common.success'),
        description: t('auth.logout.success'),
      });
    } else if (info.key === 'profile') {
      router.push('/profile');
    }
  };

  const { open } = useNotification();

  useEffect(() => {
    const handleNotification = (notification: IWsNotification) => {
      const message = notification.message || (notification as any).content;
      const notificationType = notification.notificationType || (notification as any).type;

      if (message && notificationType && (notificationType.includes('Transmit data success') || notificationType.includes('Transmit data error'))) {
        open?.({
          type: notification.messageType,
          message: 'NOTIFICATION',
          description: message,
        });
      }
      refetch();
    };

    eventEmitter.on('ws:notification', handleNotification);

    return () => {
      eventEmitter.off('ws:notification', handleNotification);
    };
  }, []);

  return (
    <AntdLayout.Header
      className={clsx('flex items-center justify-end gap-6 bg-white px-6 py-3', { 'sticky top-0 z-[1]': sticky })}
    >
      {user && (
        <>
          <Dropdown menu={{ items: userMenuItems, onClick: onChangeUserProfile }}>
            <a onClick={(e) => e.preventDefault()}>
              <div className='flex cursor-pointer items-center gap-2 text-black'>
                {user?.avatar ? (
                  <Avatar src={user?.avatar} alt={user?.username} size={24} />
                ) : (
                  <Avatar icon={<UserOutlined />} size={24} />
                )}
                {<div className='font-bold'>{user?.username}</div>}
              </div>
            </a>
          </Dropdown>

          <Popover
            className='flex items-center'
            trigger={['click']}
            content={<NotificationContent data={notifications?.data || []} refetch={refetch} />}
            classNames={{
              body: 'p-0',
            }}
          >
            <BellOutlined className='text-primary text-[24px]' />
          </Popover>
        </>
      )}

      <Dropdown menu={{ items, onClick: onChangeLanguage }}>
        <a onClick={(e) => e.preventDefault()}>
          <Avatar src={`/images/flags/${getLocale()}.svg`} alt='avatar' size={24} />
        </a>
      </Dropdown>
    </AntdLayout.Header>
  );
};

const NotificationContent = ({ data, refetch }: { data: INotification[]; refetch: () => void }) => {
  const { translate: t } = useTranslation();

  const { mutate: readAllMutate, isPending: isReadAllPending } = useCustomMutation();

  const { mutate: updateMutate } = useUpdate({
    resource: 'notifications',
  });

  const { mutate: deleteAllMutate, isPending: isDeleteAllPending } = useCustomMutation();

  if (data.length === 0) {
    return (
      <div className='p-4'>
        <Empty />
      </div>
    );
  }

  return (
    <div className='max-h-[calc(100vh-100px)] overflow-y-auto'>
      <div className='divide-y'>
        <div className='grid grid-cols-2 gap-4 p-4'>
          <Button
            onClick={() =>
              readAllMutate(
                {
                  method: 'put',
                  url: 'read-all-notifications',
                  values: {},
                },
                {
                  onSuccess: () => {
                    refetch();
                  },
                },
              )
            }
            loading={isReadAllPending}
          >
            {t('notifications-system.buttons.markAsRead')}
          </Button>

          <Button
            danger
            onClick={() =>
              deleteAllMutate(
                {
                  method: 'delete',
                  url: 'delete-all-notifications',
                  values: {},
                },
                {
                  onSuccess: () => {
                    refetch();
                  },
                },
              )
            }
            loading={isDeleteAllPending}
          >
            {t('notifications-system.buttons.deleteRead')}
          </Button>
        </div>

        {data.map((item) => (
          <div key={item.id} className='space-y-2 p-4'>
            <div className='flex gap-2'>
              <div className='min-w-0 flex-1 text-base font-medium'>{item.transType}</div>

              <div className='flex items-center gap-1'>
                <Switch
                  size='small'
                  checked={!item.status}
                  onChange={() =>
                    updateMutate({
                      id: item.id,
                      values: {
                        status: !item.status,
                      },
                      successNotification: false,
                    })
                  }
                />

                <DeleteButton
                  resource='notifications'
                  recordItemId={item.id}
                  confirmTitle={t('notifications-system.deleteConfirm.title')}
                  confirmMessage={t('notifications-system.deleteConfirm.message')}
                  variant='text'
                  size='small'
                  hideText
                  icon={<DeleteOutlined className='text-[20px]' />}
                  className='border-0 leading-0'
                  isNeedConfirm={false}
                  successNotification={false}
                />
              </div>
            </div>

            <Typography.Paragraph ellipsis={{ rows: 3, tooltip: item.content }} className='max-w-[400px]'>
              {item.content}
            </Typography.Paragraph>

            <div className='text-xs italic'>
              {t('notifications-system.dayAgo', { count: dayjs().diff(dayjs(item.createdOn), 'day') })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
