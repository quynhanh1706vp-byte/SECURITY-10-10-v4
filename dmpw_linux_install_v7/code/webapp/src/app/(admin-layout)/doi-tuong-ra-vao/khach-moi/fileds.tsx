import { IVisitStatus } from '@types';
import { useTranslation } from '@refinedev/core';

interface StatusColorItem {
  color: string;
  text: string;
}

type StatusColorMap = Record<number, StatusColorItem>;

export const fileds = () => {
  const { translate: t } = useTranslation();
  
  const STATUS_COLOR_MAP = {
    0: { color: 'orange', text: t('doi-tuong-ra-vao/khach-moi.status.pendingApproval') },
    1: { color: 'blue', text: t('doi-tuong-ra-vao/khach-moi.status.firstApproval') },
    2: { color: 'green', text: t('doi-tuong-ra-vao/khach-moi.status.approved') },
    3: { color: 'red', text: t('doi-tuong-ra-vao/khach-moi.status.rejected') },
    4: { color: 'cyan', text: t('doi-tuong-ra-vao/khach-moi.status.cardIssued') },
    5: { color: 'purple', text: t('doi-tuong-ra-vao/khach-moi.status.completed') },
    6: { color: 'volcano', text: t('doi-tuong-ra-vao/khach-moi.status.completedNoCardReturn') },
    7: { color: 'geekblue', text: t('doi-tuong-ra-vao/khach-moi.status.cardRevoked') },
    8: { color: 'lime', text: t('doi-tuong-ra-vao/khach-moi.status.autoApproved') },
    9: { color: 'gold', text: t('doi-tuong-ra-vao/khach-moi.status.specialGuest') },
  } as const;

  const mapStatusData = (statusArray: IVisitStatus[]): StatusColorMap => {
    const statusColors = {
      0: 'orange',
      1: 'blue',
      2: 'green',
      3: 'red',
      4: 'cyan',
      5: 'purple',
      6: 'volcano',
      7: 'geekblue',
      8: 'lime',
      9: 'gold',
    };

    return statusArray.reduce((acc, item) => {
      acc[item.id] = {
        color: statusColors[item.id as keyof typeof statusColors] || 'gray',
        text: item.name,
      };
      return acc;
    }, {} as StatusColorMap);
  };

  return {
    STATUS_COLOR_MAP,
    mapStatusData,
  };
};
