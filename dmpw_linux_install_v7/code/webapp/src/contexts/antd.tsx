'use client';

import { FC, type PropsWithChildren, useMemo } from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useTranslation } from '@refinedev/core';
import { App as AntdApp, ConfigProvider, type ThemeConfig } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';

export const AntdContext: FC<PropsWithChildren> = ({ children }) => {
  const themeConfig = useMemo<ThemeConfig>(() => {
    return {
      // cssVar: true,

      token: {
        colorPrimary: '#028661',

        borderRadius: 2,
        fontFamily: 'var(--font-roboto-sans)',
      },
    };
  }, []);

  const { getLocale } = useTranslation();

  const locale = getLocale();

  return (
    <AntdRegistry>
      <StyleProvider layer>
        <ConfigProvider theme={themeConfig} locale={locale === 'en' ? enUS : viVN}>
          <AntdApp>{children}</AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  );
};
