import React, { type CSSProperties, useContext, useState, useEffect } from 'react';
import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { RefineThemedLayoutV2SiderProps, ThemedTitleV2, useThemedLayoutContext } from '@refinedev/antd';
import {
  CanAccess,
  type ITreeMenu,
  pickNotDeprecated,
  useActiveAuthProvider,
  useIsExistAuthentication,
  useLink,
  useLogout,
  useMenu,
  useRefineContext,
  useRouterContext,
  useRouterType,
  useTitle,
  useTranslate,
  useWarnAboutChange,
  useGetIdentity,
} from '@refinedev/core';
import { Button, ConfigProvider, Drawer, Grid, Layout, Menu, theme, Skeleton } from 'antd';
import { AUTH_PERMISSION_KEY } from '@constants/constant';
import { getSecureCookie } from '@utils/cookieConfig';
const drawerButtonStyles: CSSProperties = {
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  position: 'fixed',
  top: 12,
  left: 5,
  zIndex: 999,
  color: 'rgba(0, 0, 0, 0.88)',
};

export const CustomizeThemedSider: React.FC<RefineThemedLayoutV2SiderProps> = ({
  Title: TitleFromProps,
  render,
  meta,
  fixed,
  activeItemDisabled = false,
}) => {
  const { token } = theme.useToken();
  const { siderCollapsed, setSiderCollapsed, mobileSiderOpen, setMobileSiderOpen } = useThemedLayoutContext();
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false);

  const isExistAuthentication = useIsExistAuthentication();
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;
  const routerType = useRouterType();
  const NewLink = useLink();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const { Link: LegacyLink } = useRouterContext();
  const Link = routerType === 'legacy' ? LegacyLink : NewLink;
  const TitleFromContext = useTitle();
  const translate = useTranslate();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  const breakpoint = Grid.useBreakpoint();
  const { hasDashboard } = useRefineContext();
  const authProvider = useActiveAuthProvider();
  const { mutate: mutateLogout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity();

  const isMobile = typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;

  useEffect(() => {
    const checkPermissions = async () => {
      if (!isIdentityLoading && identity) {
        const permissions = getSecureCookie(AUTH_PERMISSION_KEY);
        if (permissions) {
          setIsPermissionsLoaded(true);
        } else {
          setTimeout(() => {
            const delayedPermissions = getSecureCookie(AUTH_PERMISSION_KEY);
            setIsPermissionsLoaded(!!delayedPermissions);
          }, 100);
        }
      }
    };

    checkPermissions();
  }, [identity, isIdentityLoading]);

  const RenderToTitle = TitleFromProps ?? TitleFromContext ?? ThemedTitleV2;

  const renderTreeView = (tree: ITreeMenu[], selectedKey?: string) => {
    return tree.map((item: ITreeMenu) => {
      const { icon, label, route, key, name, children, parentName, meta, options } = item;

      if (children.length > 0) {
        return (
          <CanAccess
            key={item.key}
            resource={name}
            action='list'
            params={{
              resource: item,
            }}
          >
            <Menu.SubMenu key={item.key} icon={icon ?? <UnorderedListOutlined />} title={label}>
              {renderTreeView(children, selectedKey)}
            </Menu.SubMenu>
          </CanAccess>
        );
      }
      const isSelected = key === selectedKey;
      const isRoute = !(
        pickNotDeprecated(meta?.parent, options?.parent, parentName) !== undefined && children.length === 0
      );

      const linkStyle: React.CSSProperties = activeItemDisabled && isSelected ? { pointerEvents: 'none' } : {};

      return (
        <CanAccess
          key={item.key}
          resource={name}
          action='list'
          params={{
            resource: item,
          }}
        >
          <Menu.Item key={item.key} icon={icon ?? (isRoute && <UnorderedListOutlined />)} style={linkStyle}>
            <Link to={route ?? ''} style={linkStyle}>
              {label}
            </Link>
            {!siderCollapsed && isSelected && <div className='ant-menu-tree-arrow' />}
          </Menu.Item>
        </CanAccess>
      );
    });
  };

  const handleLogout = () => {
    if (warnWhen) {
      const confirm = window.confirm(
        translate('warnWhenUnsavedChanges', 'Are you sure you want to leave? You have unsaved changes.'),
      );

      if (confirm) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  };

  const logout = isExistAuthentication && (
    <Menu.Item key='logout' onClick={() => handleLogout()} icon={<LogoutOutlined />}>
      {translate('buttons.logout', 'Logout')}
    </Menu.Item>
  );

  const dashboard = hasDashboard ? (
    <Menu.Item key='dashboard' icon={<DashboardOutlined />}>
      <Link to='/'>{translate('dashboard.title', 'Dashboard')}</Link>
      {!siderCollapsed && selectedKey === '/' && <div className='ant-menu-tree-arrow' />}
    </Menu.Item>
  ) : null;

  const items = renderTreeView(menuItems, selectedKey);

  const renderSider = () => {
    if (render) {
      return render({
        dashboard,
        items,
        logout,
        collapsed: siderCollapsed,
      });
    }
    return (
      <>
        {dashboard}
        {items}
        {logout}
      </>
    );
  };

  const renderMenu = () => {
    if (isIdentityLoading || !isPermissionsLoaded) {
      return (
        <div style={{ padding: '16px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      );
    }

    return (
      <Menu
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        mode='inline'
        style={{
          paddingTop: '8px',
          border: 'none',
          overflow: 'auto',
          height: 'calc(100% - 70px)',
        }}
        onClick={() => {
          setMobileSiderOpen(false);
        }}
      >
        {renderSider()}
      </Menu>
    );
  };

  const renderDrawerSider = () => {
    return (
      <>
        <Drawer
          open={mobileSiderOpen}
          onClose={() => setMobileSiderOpen(false)}
          placement={direction === 'rtl' ? 'right' : 'left'}
          closable={false}
          width={220}
          styles={{
            body: {
              padding: 0,
            },
          }}
          maskClosable={true}
        >
          <Layout>
            <Layout.Sider
              width={220}
              style={{
                height: '100vh',
                backgroundColor: token.colorBgContainer,
                borderRight: `1px solid ${token.colorBgElevated}`,
                width: '220px',
              }}
            >
              <div
                style={{
                  width: '220px',
                  padding: '0 16px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  height: '64px',
                  backgroundColor: token.colorBgElevated,
                }}
              >
                <RenderToTitle collapsed={false} />
              </div>
              {renderMenu()}
            </Layout.Sider>
          </Layout>
        </Drawer>
        <Button
          type='text'
          style={drawerButtonStyles}
          size='large'
          onClick={() => setMobileSiderOpen(true)}
          icon={<MenuFoldOutlined />}
        />
      </>
    );
  };

  if (isMobile) {
    return renderDrawerSider();
  }

  const siderStyles: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBgElevated}`,
  };

  if (fixed) {
    siderStyles.position = 'fixed';
    siderStyles.top = 0;
    siderStyles.height = '100vh';
    siderStyles.zIndex = 999;
  }

  const renderClosingIcons = () => {
    const iconProps = { style: { color: token.colorPrimary, paddingLeft: '10px' } };
    const OpenIcon = direction === 'rtl' ? MenuUnfoldOutlined : MenuFoldOutlined;
    const CollapsedIcon = direction === 'rtl' ? MenuFoldOutlined : MenuUnfoldOutlined;
    const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;

    return <IconComponent {...iconProps} />;
  };

  return (
    <>
      {fixed && (
        <div
          style={{
            width: siderCollapsed ? '70px' : '220px',
            transition: 'all 0.2s',
          }}
        />
      )}
      <Layout.Sider
        style={siderStyles}
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          if (type === 'clickTrigger') {
            setSiderCollapsed(collapsed);
          }
        }}
        width={220}
        collapsedWidth={70}
        breakpoint='lg'
        trigger={
          <Button
            type='text'
            className='flex justify-start'
            style={{
              borderRadius: 0,
              height: '100%',
              width: '100%',
              backgroundColor: token.colorBgElevated,
            }}
          >
            {renderClosingIcons()}
          </Button>
        }
      >
        <div
          style={{
            width: siderCollapsed ? '70px' : '220px',
            padding: siderCollapsed ? '0' : '0 16px',
            display: 'flex',
            justifyContent: siderCollapsed ? 'center' : 'flex-start',
            alignItems: 'center',
            height: '64px',
            backgroundColor: token.colorBgElevated,
            fontSize: '14px',
          }}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        {renderMenu()}
      </Layout.Sider>
    </>
  );
};
