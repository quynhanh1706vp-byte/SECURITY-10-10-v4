'use client';

import React, { FC, type PropsWithChildren, Suspense, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AimOutlined,
  BellOutlined,
  CloudServerOutlined,
  ControlOutlined,
  FileDoneOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AppIcon } from '@components/app-icon';
import { setUserLocale } from '@i18n';
import { fixAntdProLayerOrder } from '@lib/utils';
import { authProviderClient } from '@providers/auth-provider/auth-provider.client';
import { dataProvider } from '@providers/data-provider';
import { DevtoolsProvider } from '@providers/devtools';
import { useNotificationProvider } from '@refinedev/antd';
import { type I18nProvider, Refine, ResourceProps } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerProvider from '@refinedev/nextjs-router';
import { accessControlProvider } from '@providers/auth-provider/access-control-provider';
import { $permissions } from '@constants/permmission';

export const RefineContext: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();

  const i18nProvider: I18nProvider = {
    translate: (key: string, options: any) => t(key, options),
    getLocale: useLocale,
    changeLocale: setUserLocale,
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fixAntdProLayerOrder();
    }
  }, []);

  const resources: ResourceProps[] = [
    {
      name: 'dashboard',
      list: '/dashboard',
      meta: {
        label: t('menu.refine.dashboard'),
        icon: <HomeOutlined />,
        authority: {
          list: $permissions.VIEW_DASHBOARD,
        },
      },
    },
    {
      name: 'monitoring',
      list: '/giam-sat',
      meta: {
        label: t('menu.refine.monitoring'),
        icon: <SearchOutlined />,
        authority: {
          list: [$permissions.VIEW_MONITORING, $permissions.VIEW_DEVICE_MONITORING],
        },
      },
    },
    {
      name: 'quan-ly-ra-vao',
      meta: {
        label: t('menu.refine.accessManagement'),
        icon: <ControlOutlined />,
        authority: {
          list: [$permissions.VIEW_BUILDING, $permissions.VIEW_DEVICE_READER, $permissions.VIEW_DEVICE_SETTING],
        },
      },
    },
    {
      name: 'don-vi',
      list: '/quan-ly-ra-vao/don-vi',
      meta: {
        parent: 'quan-ly-ra-vao',
        label: t('menu.refine.unit'),
        authority: {
          list: $permissions.VIEW_BUILDING,
          create: $permissions.ADD_BUILDING,
          edit: $permissions.EDIT_BUILDING,
          delete: $permissions.DELETE_BUILDING,
        },
      },
    },
    {
      name: 'devices',
      list: '/quan-ly-ra-vao/diem-kiem-soat',
      edit: '/quan-ly-ra-vao/diem-kiem-soat/:id',
      meta: {
        parent: 'quan-ly-ra-vao',
        label: t('menu.refine.accessPoint'),
        authority: {
          list: $permissions.VIEW_DEVICE_SETTING,
          edit: $permissions.EDIT_DEVICE_SETTING,
        },
      },
    },
    {
      name: 'device-readers',
      list: '/quan-ly-ra-vao/thiet-bi',
      meta: {
        parent: 'quan-ly-ra-vao',
        label: t('menu.refine.device'),
        authority: {
          list: $permissions.VIEW_DEVICE_READER,
          create: $permissions.ADD_DEVICE_READER,
          edit: $permissions.EDIT_DEVICE_READER,
          delete: $permissions.DELETE_DEVICE_READER,
        },
      },
    },
    {
      name: 'doi-tuong-ra-vao',
      meta: {
        label: t('menu.refine.accessObject'),
        icon: <AimOutlined />,
        authority: {
          list: [$permissions.VIEW_VISIT, $permissions.VIEW_USER, $permissions.VIEW_VEHICLE],
        },
      },
    },
    {
      name: 'users',
      list: '/doi-tuong-ra-vao/nhan-vien',
      edit: '/doi-tuong-ra-vao/nhan-vien/:id',
      meta: {
        parent: 'doi-tuong-ra-vao',
        label: t('menu.refine.staff'),
        authority: {
          list: $permissions.VIEW_USER,
          create: $permissions.ADD_USER,
          edit: $permissions.EDIT_USER,
          delete: $permissions.DELETE_USER,
        },
      },
    },
    {
      name: 'visits',
      list: '/doi-tuong-ra-vao/khach-moi',
      edit: '/doi-tuong-ra-vao/khach-moi/:id',
      meta: {
        parent: 'doi-tuong-ra-vao',
        label: t('menu.refine.guest'),
        authority: {
          list: $permissions.VIEW_VISIT,
          create: $permissions.ADD_VISIT,
          edit: $permissions.EDIT_VISIT,
          delete: $permissions.DELETE_VISIT,
        },
      },
    },
    {
      name: 'vehicles',
      list: '/doi-tuong-ra-vao/phuong-tien',
      meta: {
        parent: 'doi-tuong-ra-vao',
        label: t('menu.refine.vehicle'),
        authority: {
          list: $permissions.VIEW_VEHICLE,
          create: $permissions.ADD_VEHICLE,
          edit: $permissions.EDIT_VEHICLE,
          delete: $permissions.DELETE_VEHICLE,
        },
      },
    },
    {
      name: 'cau-hinh',
      meta: {
        label: t('menu.refine.settings'),
        icon: <SettingOutlined />,
        authority: {
          list: [
            'accessSchedule:*',
            'accessGroup:*',
            'department:*',
            'accessSetting:*',
            'workingTime:*',
            'holiday:*',
            'visitSetting:*',
          ],
        },
      },
    },
    {
      name: 'access-groups',
      list: '/cau-hinh/nhom-quyen-truy-cap',
      edit: '/cau-hinh/nhom-quyen-truy-cap/:id',
      meta: {
        parent: 'cau-hinh',
        label: t('menu.refine.accessGroup'),
        authority: {
          list: $permissions.VIEW_ACCESS_GROUP,
          create: $permissions.ADD_ACCESS_GROUP,
          edit: $permissions.EDIT_ACCESS_GROUP,
          delete: $permissions.DELETE_ACCESS_GROUP,
        },
      },
    },
    {
      name: 'cau-hinh/truy-cap',
      list: '/cau-hinh/truy-cap',
      meta: {
        parent: 'cau-hinh',
        label: t('menu.refine.accessConfig'),
        authority: {
          list: [$permissions.VIEW_ACCESS_TIME, $permissions.VIEW_HOLIDAY, $permissions.EDIT_VISIT_SETTING],
        },
      },
    },
    {
      name: 'access-times',
      meta: {
        authority: {
          list: $permissions.VIEW_ACCESS_TIME,
          create: $permissions.ADD_ACCESS_TIME,
          edit: $permissions.EDIT_ACCESS_TIME,
          delete: $permissions.DELETE_ACCESS_TIME,
        },
      },
    },
    {
      name: 'holidays',
      meta: {
        authority: {
          list: $permissions.VIEW_HOLIDAY,
          create: $permissions.ADD_HOLIDAY,
          edit: $permissions.EDIT_HOLIDAY,
          delete: $permissions.DELETE_HOLIDAY,
        },
      },
    },
    {
      name: 'departments',
      list: '/cau-hinh/phong-ban',
      meta: {
        parent: 'cau-hinh',
        label: t('menu.refine.department'),
        authority: {
          list: $permissions.VIEW_DEPARTMENT,
          create: $permissions.ADD_DEPARTMENT,
          edit: $permissions.EDIT_DEPARTMENT,
          delete: $permissions.DELETE_DEPARTMENT,
        },
      },
    },
    {
      name: 'access-schedules',
      list: '/cau-hinh/ca-truc',
      meta: {
        parent: 'cau-hinh',
        label: t('menu.refine.shift'),
        authority: {
          list: $permissions.VIEW_ACCESS_SCHEDULE,
          create: $permissions.ADD_ACCESS_SCHEDULE,
          edit: $permissions.EDIT_ACCESS_SCHEDULE,
          delete: $permissions.DELETE_ACCESS_SCHEDULE,
        },
      },
    },
    {
      name: 'security',
      list: '/cau-hinh/bao-mat',
      meta: {
        parent: 'cau-hinh',
        label: t('menu.refine.security'),
        authority: {
          list: $permissions.VIEW_SETTING,
          edit: $permissions.EDIT_SETTING,
        },
      },
    },
    {
      name: 'work-shifts',
      meta: {
        authority: {
          list: $permissions.VIEW_WORKING_TIME,
          create: $permissions.BYPASS_PERMISSION,
          edit: $permissions.BYPASS_PERMISSION,
          delete: $permissions.BYPASS_PERMISSION,
        },
      },
    },
    {
      name: 'tai-khoan',
      meta: {
        label: t('menu.refine.account'),
        icon: <UserOutlined />,
      },
    },
    {
      name: 'accounts',
      list: '/tai-khoan/nguoi-dung',
      meta: {
        parent: 'tai-khoan',
        label: t('menu.refine.userManagement'),
      },
    },
    {
      name: 'tai-khoan/quyen-truy-cap',
      list: '/tai-khoan/quyen-truy-cap',
      meta: {
        parent: 'tai-khoan',
        label: t('menu.refine.userPermission'),
      },
    },
    {
      name: 'bao-cao',
      meta: {
        label: t('menu.refine.report'),
        icon: <FileDoneOutlined />,
        authority: {
          list: [$permissions.VIEW_REPORT, $permissions.VIEW_SYSTEM_LOG, $permissions.VIEW_VISIT_REPORT],
        },
      },
    },
    {
      name: 'access-report',
      list: '/bao-cao/bao-cao-truy-cap',
      meta: {
        parent: 'bao-cao',
        label: t('menu.refine.accessReport'),
        authority: {
          list: $permissions.VIEW_REPORT,
          export: $permissions.EXPORT_REPORT,
        },
      },
    },
    {
      name: 'visit-report',
      list: '/bao-cao/bao-cao-khach-moi',
      meta: {
        parent: 'bao-cao',
        label: t('menu.refine.guestReport'),
        authority: {
          list: $permissions.VIEW_VISIT_REPORT,
          export: $permissions.EXPORT_VISIT,
        },
      },
    },
    {
      name: 'vehicle-eventlog',
      list: '/bao-cao/bao-cao-phuong-tien',
      meta: {
        parent: 'bao-cao',
        label: t('menu.refine.vehicleReport'),
        authority: {
          list: $permissions.VIEW_REPORT,
          export: $permissions.EXPORT_REPORT,
        },
      },
    },
    {
      name: 'system-logs',
      list: '/bao-cao/bao-cao-log',
      meta: {
        parent: 'bao-cao',
        label: t('menu.refine.logReport'),
        authority: {
          list: $permissions.VIEW_SYSTEM_LOG,
          export: $permissions.EXPORT_SYSTEM_LOG,
        },
      },
    },
    {
      name: 'firmware-version',
      list: '/firmware',
      meta: {
        label: t('menu.refine.firmware'),
        icon: <CloudServerOutlined />,
        authority: {
          list: $permissions.VIEW_FIRMWARE_VERSION,
          create: $permissions.ADD_FIRMWARE_VERSION,
          edit: $permissions.EDIT_FIRMWARE_VERSION,
          delete: $permissions.DELETE_FIRMWARE_VERSION,
        },
      },
    },
    {
      name: 'notifications',
      list: '/thong-bao',
      meta: {
        label: t('menu.refine.notifications'),
        icon: <BellOutlined />,
        // authority: {
        //   list: $permissions.BYPASS_PERMISSION,
        // },
      },
    },
  ];

  return (
    <RefineKbarProvider>
      <DevtoolsProvider>
        <Refine
          routerProvider={routerProvider}
          dataProvider={dataProvider}
          notificationProvider={useNotificationProvider}
          authProvider={authProviderClient}
          accessControlProvider={accessControlProvider}
          i18nProvider={i18nProvider}
          resources={resources}
          options={{
            // syncWithLocation: true,
            // warnWhenUnsavedChanges: true,
            useNewQueryKeys: true,
            projectId: 'vF4Vvy-VWWqrq-lM3Fhz',
            title: { text: 'Quản lý ra vào', icon: <AppIcon /> },
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <RefineKbar />
        </Refine>
      </DevtoolsProvider>
    </RefineKbarProvider>
  );
};
