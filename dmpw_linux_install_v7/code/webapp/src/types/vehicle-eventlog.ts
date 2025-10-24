export interface IVehicleEventLog {
  id: number;
  icuId: number;
  eventTime: string;
  unixTime: number;
  plateNumber: string;
  model: string | null;
  doorName: string;
  userName: string;
  departmentName: string;
  inOut: string;
  eventDetailCode: number;
  eventDetail: string;
  userId: number | null;
  visitId: number | null;
  vehicleType: string | null;
  vehicleImage: string | null;
  categoryOptions: unknown | null;
  deviceManagerIds: number[];
  objectType: number; // 0: Cảnh báo, 1: Nhân viên, 2: Khách
  eventType: number;
  resultCheckIn?: string;
  eventLogId?: number;
  cardId: string;
  cardType: string;
  cardTypeId: number;
  building: string;
}

interface IListItem {
  id: number;
  name: string;
}

interface IItemLists {
  inOutList: IListItem[];
  eventTypeList: IListItem[];
  vehicleClassificationList: IListItem[];
  approveList: IListItem[];
  buildingList: IListItem[];
  doorList: IListItem[];
  departmentList: IListItem[];
}

export interface IVehicleEventLogInit {
  accessDateFrom: string;
  accessDateTo: string;
  accessTimeFrom: string;
  accessTimeTo: string;
  userName: string | null;
  plateNumber: string | null;
  eventType: number | null;
  inOut: number | null;
  departmentId: number | null;
  isApproved: number | null;
  buildingId: number | null;
  vehicleClassificationId: number | null;
  itemLists: IItemLists;
}