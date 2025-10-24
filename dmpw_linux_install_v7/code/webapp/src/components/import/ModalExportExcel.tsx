import Modal from '@components/ui/Modal';
import { downloadFile } from '@lib/utils';
import { dataProvider } from '@providers/data-provider';
import { useNotification, useTranslation } from '@refinedev/core';
import { ButtonProps, ModalProps, Radio } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

type ModalExportExcelProps = ModalProps & {
  exportUrl: string;
  fileName: string;
  queryParams?: Record<string, any>;
  onSuccess?: () => void;
};

export default function ModalExportExcel({
  exportUrl,
  queryParams,
  fileName = 'Export_Data',
  onSuccess,
  ...modalProps
}: ModalExportExcelProps) {
  const { translate: t } = useTranslation();

  const [exportType, setExportType] = useState<'excel' | 'csv'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const { open } = useNotification();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await dataProvider.custom({
        url: exportUrl,
        method: 'get',
        query: {
          exportType,
          ...queryParams,
        },
        meta: {
          isDownload: true,
        },
      });

      downloadFile(
        response.data as Blob,
        `${fileName}_${dayjs().format('DDMMYYYYhhmmss')}.${exportType === 'excel' ? 'xlsx' : 'csv'}`,
      );

      onSuccess?.();
    } catch (error: any) {
      open?.({
        message:
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          t('export.errors.exportFailed'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      {...modalProps}
      title={t('export.modal.title')}
      okText={t('export.modal.okText')}
      onOk={handleExport}
      okButtonProps={{ loading: isExporting }}
    >
      <div className='flex items-center gap-2'>
        <span>{t('export.form.label.fileFormat')}</span>
        <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
          <Radio value='excel'>Excel</Radio>
          <Radio value='csv'>CSV</Radio>
        </Radio.Group>
      </div>
    </Modal>
  );
}
