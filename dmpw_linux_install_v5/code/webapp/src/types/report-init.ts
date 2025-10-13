import { TBuilding, TDoor } from './user';

export type TInOutType = {
  id: number;
  name: string;
};

export type TEventType = {
  id: number;
  name: string;
};


export type TDepartment = {
  id: number;
  name: string;
};

export type TCardType = {
  id: number;
  name: string;
};

export type TWorkType = {
  id: number;
  name: string;
};

export type TAccessFilterRequest = {
  accessDateFrom: string | null;
  accessDateTo: string | null;
  accessTimeFrom: string | null;
  accessTimeTo: string | null;
  fromDate: string;
  toDate: string;
  eventType: number | null;
  userCode: string | null;
  userName: string | null;
  inOutType: number | null;
  cardId: string | null;
  doorName: string | null;
  cardType: number | null;
  company: string | null;

  inOutList: TInOutType[];
  eventTypeList: TEventType[];
  verifyModeList: never[] | null; // Nếu cần cụ thể hóa, bạn cung cấp thêm cấu trúc phần tử
  doorList: TDoor[];
  buildingList: TBuilding[];
  departmentList: TDepartment[];
  companyItems: never[] | null;
  cardTypeList: TCardType[];
  workTypeList: TWorkType[];
};
