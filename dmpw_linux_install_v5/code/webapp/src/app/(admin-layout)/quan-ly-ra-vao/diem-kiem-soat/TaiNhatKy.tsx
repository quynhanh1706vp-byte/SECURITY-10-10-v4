import { useState } from 'react';
import { useCustomTable } from '@hooks';
import { useCustom, useCustomMutation, useTranslate } from '@refinedev/core';
import { IDevice } from '@types';
import { Button, Spin, Table } from 'antd';

type TaiNhatKyProps = {
  device?: IDevice;
  onClose: () => void;
};

export default function TaiNhatKy({ device, onClose }: TaiNhatKyProps) {
  const t = useTranslate();

  const { tableProps } = useCustomTable({
    resource: `devices/file-logs`,
    filters: {
      permanent: [{ field: 'deviceId', operator: 'eq', value: device?.id }],
    },
    queryOptions: {
      enabled: !!device,
    },
  });

  const fileLogs = tableProps.dataSource;

  const [needRequestFileLogs, setNeedRequestFileLogs] = useState(false);

  const { data, isFetching: isRequestingFileLogs } = useCustom({
    method: 'get',
    url: `devices/${device?.id}/request-file-logs`,
    queryOptions: {
      enabled: needRequestFileLogs,
      retry: false,
      onSettled: () => {
        setNeedRequestFileLogs(false);
      },
    },
  });

  return (
    <Spin spinning={tableProps.loading as boolean}>
      {!fileLogs?.length && (
        <div>
          {t('quan-ly-ra-vao/diem-kiem-soat.log.noData')}
        </div>
      )}

      {/* <Table {...tableProps} /> */}

      <div className='mt-4 flex gap-4'>
        <Button type='primary' loading={isRequestingFileLogs} onClick={() => setNeedRequestFileLogs(true)}>
          {t('quan-ly-ra-vao/diem-kiem-soat.buttons.getNewLog')}
        </Button>

        <Button type='primary' disabled={!fileLogs?.length} onClick={() => {}}>
          {t('quan-ly-ra-vao/diem-kiem-soat.buttons.downloadAll')}
        </Button>

        <Button variant='outlined' color='primary' onClick={onClose}>
          {t('buttons.cancel')}
        </Button>
      </div>
    </Spin>
  );
}
