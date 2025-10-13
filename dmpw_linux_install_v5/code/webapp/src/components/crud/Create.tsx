import React from 'react';
import type { CreateProps } from '@refinedev/antd';
import { Breadcrumb, PageHeader, SaveButton, type SaveButtonProps } from '@refinedev/antd';
import {
  useBack,
  useNavigation,
  useRefineContext,
  useResource,
  useRouterType,
  useTranslate,
  useUserFriendlyName,
} from '@refinedev/core';
import { Space, Spin } from 'antd';

/**
 * `<Create>` provides us a layout to display the page.
 * It does not contain any logic but adds extra functionalities like action buttons and giving titles to the page.
 *
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/components/basic-views/create} for more details.
 */
export const Create: React.FC<CreateProps> = ({
  title,
  saveButtonProps: saveButtonPropsFromProps,
  children,
  resource: resourceFromProps,
  isLoading = false,
  breadcrumb: breadcrumbFromProps,
  wrapperProps,
  headerProps,
  contentProps,
  headerButtonProps,
  headerButtons,
  footerButtonProps,
  footerButtons,
  goBack: goBackFromProps,
}) => {
  const translate = useTranslate();
  const { options: { breadcrumb: globalBreadcrumb } = {} } = useRefineContext();

  const routerType = useRouterType();
  const back = useBack();
  const { goBack } = useNavigation();
  const getUserFriendlyName = useUserFriendlyName();

  const { resource, action, identifier } = useResource(resourceFromProps);

  const breadcrumb = typeof breadcrumbFromProps === 'undefined' ? globalBreadcrumb : breadcrumbFromProps;

  const saveButtonProps: SaveButtonProps = {
    ...(isLoading ? { disabled: true } : {}),
    ...saveButtonPropsFromProps,
    htmlType: 'submit',
  };

  const defaultFooterButtons = (
    <>
      <SaveButton {...saveButtonProps} />
    </>
  );

  return (
    <div {...(wrapperProps ?? {})}>
      <PageHeader
        backIcon={goBackFromProps}
        onBack={
          action !== 'list' || typeof action !== 'undefined' ? (routerType === 'legacy' ? goBack : back) : undefined
        }
        title={
          title ??
          translate(
            `${identifier}.titles.create`,
            `Create ${getUserFriendlyName(
              resource?.meta?.label ?? resource?.options?.label ?? resource?.label ?? identifier,
              'singular',
            )}`,
          )
        }
        breadcrumb={typeof breadcrumb !== 'undefined' ? <>{breadcrumb}</> : <Breadcrumb />}
        extra={
          <Space wrap {...(headerButtonProps ?? {})}>
            {headerButtons
              ? typeof headerButtons === 'function'
                ? headerButtons({
                    defaultButtons: null,
                  })
                : headerButtons
              : null}
          </Space>
        }
        {...(headerProps ?? {})}
      >
        <Spin spinning={isLoading}>
          {children}
          <Space key='action-buttons' style={{ float: 'right', marginRight: 24 }} {...(footerButtonProps ?? {})}>
            {footerButtons
              ? typeof footerButtons === 'function'
                ? footerButtons({
                    defaultButtons: defaultFooterButtons,
                    saveButtonProps: saveButtonProps,
                  })
                : footerButtons
              : defaultFooterButtons}
          </Space>
        </Spin>
      </PageHeader>
    </div>
  );
};
