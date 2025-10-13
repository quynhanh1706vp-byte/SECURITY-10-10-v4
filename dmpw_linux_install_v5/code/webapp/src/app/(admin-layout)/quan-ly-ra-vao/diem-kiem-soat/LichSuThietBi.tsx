'use client';

import { useCustomTable } from '@hooks';
import { useTranslation } from '@refinedev/core';
import { Table, TableColumnsType, Input } from 'antd';
import TruncatedText from '@components/ui/TruncatedText';
import { useState, useEffect } from 'react';

const getColumns = (t: any): TableColumnsType => [
  {
    title: t('quan-ly-ra-vao/diem-kiem-soat.history.columns.time'),
    dataIndex: 'eventTime',
    width: 170,
  },
  {
    title: t('quan-ly-ra-vao/diem-kiem-soat.history.columns.eventType'),
    dataIndex: 'eventType',
    width: 120,
  },
  {
    title: t('quan-ly-ra-vao/diem-kiem-soat.history.columns.operator'),
    dataIndex: 'operator',
    ellipsis: { showTitle: false },
    width: 200,
  },
  {
    title: t('quan-ly-ra-vao/diem-kiem-soat.history.columns.eventDetails'),
    dataIndex: 'eventDetails',
    ellipsis: { showTitle: false },
    render: (text: string) => {
      // Safely decode HTML entities and strip HTML tags without using DOM APIs
      const sanitizeAndDecode = (str: string): string => {
        return str
          .replace(/<br\s*\/?>/gi, ' ') // Convert <br> to space for inline display
          .replace(/<[^>]*>/g, '') // Strip all HTML tags
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec))
          .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
          .trim();
      };

      const sanitizedText = sanitizeAndDecode(text);

      return (
        <TruncatedText maxWidth={500} tooltipMaxWidth={600}>
          {sanitizedText}
        </TruncatedText>
      );
    },
  },
  {
    title: t('quan-ly-ra-vao/diem-kiem-soat.history.columns.operator'),
    dataIndex: 'operator',
    ellipsis: { showTitle: false },
    width: 200,
  },
];

type LichSuThietBiProps = {
  id?: number | string;
  isCamera?: boolean;
  open?: boolean;
};

export default function LichSuThietBi({ id, isCamera, open }: LichSuThietBiProps) {
  const { translate: t } = useTranslation();
  const columns = getColumns(t);
  const [inputValue, setInputValue] = useState('');
  const [searchText, setSearchText] = useState('');

  // Reset search khi đóng modal
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setSearchText('');
    }
  }, [open]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const { tableProps } = useCustomTable({
    resource: `devices/${id}/history`,
    queryOptions: {
      enabled: !!id && !isCamera,
    },
    filters: {
      permanent: !isCamera
        ? [
            {
              field: 'search',
              operator: 'eq',
              value: searchText,
            },
          ]
        : [],
    },
  });

  const { tableProps: cameraTableProps } = useCustomTable({
    resource: `cameras/${id}/history`,
    queryOptions: {
      enabled: !!id && isCamera === true,
    },
    filters: {
      permanent: isCamera
        ? [
            {
              field: 'search',
              operator: 'eq',
              value: searchText,
            },
          ]
        : [],
    },
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t('quan-ly-ra-vao/diem-kiem-soat.history.searchPlaceholder')}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        {...(isCamera ? cameraTableProps : tableProps)}
        columns={columns}
        rowSelection={undefined}
        scroll={{ x: 'max-content', y: '50vh' }}
        rowKey={(record) => record.id || record.eventTime}
      />
    </div>
  );
}
