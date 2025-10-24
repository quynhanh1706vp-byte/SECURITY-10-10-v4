'use client';

import Image from 'next/image';
import { CustomizeThemedSider } from '@components/elements/CustomizeThemedSider';
import { useTranslation } from '@refinedev/core';
import { ConfigProvider, theme, type ThemeConfig } from 'antd';

const CustomSider = () => {
  const { token } = theme.useToken();
  const { translate: t } = useTranslation();

  const themeConfig: ThemeConfig = {
    token: {
      colorBgContainer: token.colorPrimary,
      colorBgElevated: token.colorPrimary,

      colorText: '#ffffff',
    },
    components: {
      Menu: {
        itemColor: '#ffffff',
        itemSelectedColor: '#ffffff',
        subMenuItemSelectedColor: '#ffffff',
        itemHoverBg: '#006c47',
        itemSelectedBg: '#006c47',
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <CustomizeThemedSider
        Title={({ collapsed }) => (
          <div className='flex items-center justify-center gap-3 py-3'>
            <div className='shrink-0'>
              <Image src='/images/logo.png' width={32} height={32} alt='logo'></Image>
            </div>

            {!collapsed && <div className='text-lg font-bold text-white'>{t('common.appName')}</div>}
          </div>
        )}
        render={({ items, collapsed }) => {
          return <>{items}</>;
        }}
        fixed
      />
    </ConfigProvider>
  );
};

export default CustomSider;
