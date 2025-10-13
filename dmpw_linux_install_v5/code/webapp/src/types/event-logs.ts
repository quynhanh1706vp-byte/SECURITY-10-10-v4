interface IListItem {
  id: number;
  name: string;
}

export interface IEventLog {
  id: number;
  eventLogId?: number;
  icuId: number;
  userId: number | null;
  avatar: string;
  visitId: number | null;
  accessTime: string;
  eventTime: string;
  userName: string | null;
  department: string;
  departmentName: string;
  parentDepartmentId: number;
  parent: any | null;
  cardId: string | null;
  isRegisteredCard: boolean;
  device: string;
  deviceAddress: string;
  doorName: string;
  building: string;
  verifyMode: string;
  cardType: string;
  cardTypeId: number;
  expireDate: string | null;
  type: number;
  inOut: string;
  inOutType: number;
  eventType: number;
  eventDetail: string;
  issueCount: number;
  cardStatus: string;
  imageCamera: string | null;
  otherCardId: string | null;
  resultCheckIn: any | null;
  videos: any | null;
  bodyTemperature: number;
  allowedBelonging: any | null;
  unixTime: number;
  userType: string | null;
  personTypeArmy: string | null;
  deviceManagerIds: number[];
  workType: string | null;
  workTypeName: string;
  memo: string | null;
  objectType: number; // 0: cảnh báo, 1: nhân viên, 2: khách
  visitTarget: string | null;
}

export interface IEventLogInit {
  accessDateFrom: string | null;
  accessDateTo: string | null;
  accessTimeFrom: string | null;
  accessTimeTo: string | null;
  eventType: number | null;
  userCode: string | null;
  userName: string | null;
  inOutType: number | null;
  cardId: string | null;
  doorName: string | null;
  cardType: string | null;
  company: string | null;
  inOutList: IListItem[];
  eventTypeList: IListItem[];
  verifyModeList: IListItem[];
  doorList: IListItem[];
  buildingList: IListItem[];
  departmentList: IListItem[];
  companyItems: any | null;
}

export interface IEventLogReportInit {
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
  inOutList: IListItem[];
  eventTypeList: IListItem[];
  verifyModeList: IListItem[] | null;
  doorList: IListItem[];
  buildingList: IListItem[];
  departmentList: IListItem[];
  companyItems: IListItem[] | null;
  cardTypeList: IListItem[];
  workTypeList: IListItem[];
}
