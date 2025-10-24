import { TOptionItem } from './common';

export type TVisitReport = {
  id: number;
  visitId: number;
  accessTime: string; // "25/03/2025 14:52:19"
  userName: string;
  birthDay: string; // "27.12.1980"
  department: string | null;
  cardId: string;
  device: string;
  doorName: string;
  building: string | null;
  inOut: string; // "Vào"
  eventDetail: string;
  issueCount: number;
  cardStatus: string; // "0"
  cardType: string; // "QrCode"
  avatar: string;
  imageCamera: string | null;
  resultCheckIn: string | null;
  bodyTemperature: number;
  delayOpenDoorByCamera: number;
};

export type TVisitInitReport = {
  accessDateFrom: string | null;
  accessDateTo: string | null;
  accessTimeFrom: string | null;
  accessTimeTo: string | null;
  userName: string | null;
  birthDay: string | null;
  department: string | null;
  cardId: string | null;
  device: string | null;
  doorName: string | null;
  building: string | null;
  inOutType: string | null;
  eventDetails: string | null;
  issueCount: number;
  inOutList: TOptionItem[];
  eventTypeList: TOptionItem[];
  doorList: TOptionItem[];
  listCardStatus: TOptionItem[];
  buildingList: TOptionItem[];
  departmentList: TOptionItem[];
};
