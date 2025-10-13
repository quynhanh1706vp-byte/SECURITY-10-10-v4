import { TOptionItem } from './common';

export type TUser = {
  id: number;
  firstName: string;
  lastName: string | null;
  userCode: string;
  departmentId: number;
  departmentName: string;
  accessGroupId: number;
  accessGroupName: string;
  accessGroups: TAccessGroup[];
  employeeNo: string | null;
  position: string | null;
  expiredDate: string; // Format: "dd.MM.yyyy HH:mm:ss"
  workTypeName: string;
  avatar: string;
  approvalStatus: string;
  email: string;
  nationalIdNumber: string | null;
  homePhone: string | null;
  address: string | null;
  accountId: number;
  status: boolean;
  birthDay: string;

  cardList: TCardInfo[];
  faceList: TCardInfo[];
  plateNumberList: TCardInfo[];
  gender: boolean,

  effectiveDate: string; // Format: "dd.MM.yyyy HH:mm:ss" => 2021-02-03 19:49:33
  workType: number;
};

export type TCardInfo = {
  id: number;
  cardId: string;
  issueCount: number;
  cardStatus: number;
  cardType: number;
  description: string | null;
  faceData: unknown;         // Có thể điều chỉnh thành string | null nếu có định dạng cụ thể
  fingerPrintData: unknown;  // Có thể điều chỉnh thành string | null nếu có định dạng cụ thể
};

export type TAccessTimeUser = {
  id: number;
  accessTimeName: string;
  remark: string | null;
  position: number;
};

export type TWorkingDay = {
  End: string;
  Name: string;
  Type: string;
  Start: string;
  StartTimeWorking?: string;
};

export type TWorkingType = {
  id: number;
  name: string;
  workingDay: string; // có thể parse thành TWorkingDay[] nếu cần
  isDefault: boolean;
};

export type TAccessSetting = {
  firstApproverAccounts: string;
  secondApproverAccounts: string;
  approvalStepNumber: number;
  enableAutoApproval: boolean;
  allowDeleteRecord: boolean;
  allLocationWarning: string | null;
  deviceIdCheckIn: number;
  listFieldsEnable: string | null;
};

export type TAccount = {
  id: number;
  accountId: number;
  email: string;
  userName: string;
  firstName: string;
  typeId: number;
  role: string | null;
  companyId: number;
  companyName: string | null;
  timeZone: string | null;
  department: string;
  departmentName: string;
  position: string | null;
};

export type TDevice = {
  id: number;
  name: string;
  deviceAddress: string;
};

export type TCategory = {
  id: number;
  name: string;
  options: TOptionItem[];
  children: TCategory[] | null;
};

export type TDoor = {
  id: number;
  doorName: string;
  deviceAddress: string;
  deviceType: string;
  activeTz: string;
  passageTz: string | null;
  connectionStatus: number;
  operationType: number;
  doorStatus: string | null;
  doorStatusId: number;
  image: string | null;
  version: string | null;
  lastCommunicationTime: string | null;
  autoAcceptVideoCall: boolean;
  enableVideoCall: boolean;
};

export type TBuilding = {
  id: number;
  name: string;
  address: string | null;
  timeZone: string;
  children: TBuilding[];
  parentId: number;
  parentName: string | null;
  doorList: TDoor[];
};

export type TNamedItem = {
  id: number;
  name: string;
};

export type TAccessGroup = TNamedItem & {
  isDefault: boolean;
  type: number;
  id: number;
  name: string;
};

export type TUserInit = {
  userCode: string;
  accessTimes: TAccessTimeUser[];
  workingTypes: TWorkingType[];
  accessSetting: TAccessSetting;
  firstApprovalAccounts: TAccount[];
  secondApprovalAccounts: TAccount[];
  deviceFingerprints: TDevice[];
  deviceFaces: TDevice[];
  faceAndIrisType: TNamedItem[];
  deviceEbkns: TDevice[];
  deviceAratek: TDevice[];
  deviceTBVision: TDevice[];
  cardTypes: TNamedItem[];
  cameras: TDevice[];
  departments: TNamedItem[];
  genders: TNamedItem[];
  permissionTypes: TNamedItem[];
  passTypes: TNamedItem[];
  userStatus: TNamedItem[];
  workTypes: TNamedItem[];
  accessGroups: TAccessGroup[];
  cardStatus: TNamedItem[];
  categories: TCategory[];
  buildings: TBuilding[];
};
