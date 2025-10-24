'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@refinedev/core';
import Link from 'next/link';
import { useAccessibleResource } from '@hooks/useAccessibleRoute';

export default function ForbiddenPage() {
  const { translate: t } = useTranslation();

  const accessibleResource = useAccessibleResource();

  // Show 403 page
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <Result
        status='403'
        title='403'
        subTitle={t('pages.error.403')}
        extra={
          <Link href={(accessibleResource?.list as string) || '/'}>
            <Button type='primary' size='large'>
              {t('pages.error.backHome')}
            </Button>
          </Link>
        }
      />
    </div>
  );
}
