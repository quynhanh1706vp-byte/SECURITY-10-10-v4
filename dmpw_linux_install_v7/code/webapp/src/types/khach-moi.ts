import { IAccount } from './nguoi-dung';

export interface IKhachMoi {
  id: number;
  applyDate: string;
  visitorName: string;
  birthDay: string;
  visitorDepartment: string | null;
  position: string | null;
  startDate: string;
  endDate: string;
  visiteeId: number;
  visiteeSite: string;
  visitReason: string;
  visiteeName: string;
  phone: string;
  invitePhone: string | null;
  processStatus: string;
  approver1: string;
  approver2: string;
  rejectReason: string | null;
  cardId: string;
  accessGroupId: number;
  isDecision: boolean;
  avatar: string;
  visiteeAvatar: string | null;
  nationalIdNumber: string | null;
  bodyTemperature: number;
  allowedBelonging: string | null;
  createdOn: string;
  updatedOn: string;
  doors: string;
  statusCode: number;
  visitType: number;
  visitPlace: string | null;
  createdName: string | null;
  createdBy: number;
  autoApproved: boolean;
  roomNumber: string | null;
  roomDoorCode: string | null;
  address: string;
  sex: boolean;
  groupVisitors: string | null;
  visiteeDepartment: string | null;
}

export interface IVisitSetting {
  id: number;
  companyId: number;
  accessTimeId: number;
  firstApproverAccounts: string; // JSON string representing an array of numbers
  secondsApproverAccounts: string; // JSON string representing an array of numbers
  visitCheckManagerAccounts: string; // JSON string representing an array of numbers
  defaultDoors: number[];
  accessGroupId: number;
  groupDevices: string; // JSON string representing an array of objects
  approvalStepNumber: number;
  outSide: boolean;
  allowEmployeeInvite: boolean;
  enableCaptCha: boolean;
  enableAutoApproval: boolean;
  insiderAutoApproved: boolean;
  allowDeleteRecord: boolean;
  allowEditRecord: boolean;
  allLocationWarning: string;
  deviceIdCheckIn: number;
  listFieldsEnable: string; // JSON string representing an object
  visibleFields: string; // JSON string representing an object
  personalInvitationLink: string;
  onlyAccessSingleBuilding: boolean;
  firstApprovers: any[] | null; // Replace `any` with a specific type if known
  secondApprovers: any[] | null; // Replace `any` with a specific type if known
  visitCheckManagers: any[] | null; // Replace `any` with a specific type if known
  fieldRegisterLeft: string[];
  fieldRegisterRight: string[];
  fieldRequired: string[];
  allowGetUserTarget: boolean;
  allowSelectDoorWhenCreateNew: boolean;
  allowSendKakao: boolean;
  listVisitPurpose: any[] | null; // Replace `any` with a specific type if known
}

export interface IVisitStatus {
  id: number;
  name: string;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string | null;
  userCode: string;
  departmentName: string;
  accessGroupName: string;
  employeeNo: string;
  position: string;
  expiredDate: string;
  workTypeName: string;
  avatar: string;
  cardList: any[] | null;
  faceList: any[] | null;
  plateNumberList: any[] | null;
  categoryOptions: any[];
  approvalStatus: string;
  email: string;
  nationalIdNumber: string;
  homePhone: string;
  address: string | null;
  accountId: number;
  username: string;
}

export interface IVisitType {
  id: number;
  name: string;
}

export interface IVisitsInit {
  accounts: IAccount[];
  buildingFloors: any[];
  buildings: any[];
  exportCardQr: boolean;
  visitSetting: IVisitSetting;
  visitStatus: IVisitStatus[];
  visitTarget: IUser[];
  visitType: IVisitType[];
  identificationType: IVisitType[];
}

export interface ICardStatus {
  id: number;
  name: string;
}

export interface IFormVisit {
  visitTypes: IVisitType[];
  listCardStatus: ICardStatus[];
  id: number;
  visitorName: string | null;
  visitType: number;
  birthDay: string;
  visitorDepartment: string | null;
  visitorEmpNumber: string | null;
  position: string | null;
  startDate: string;
  endDate: string;
  visiteeSite: string | null;
  visitReason: string | null;
  visiteeId: number | null;
  visiteeName: string | null;
  visiteeDepartmentId: number | null;
  visiteeDepartment: string | null;
  visiteeEmpNumber: string | null;
  leaderId: number | null;
  leaderName: string | null;
  phone: string | null;
  invitePhone: string | null;
  email: string | null;
  address: string | null;
  isDecision: boolean;
  cardStatus: number;
  approverId1: number;
  approverId2: number;
  approverId: number;
  cardId: string | null;
  accessGroupId: number;
  processStatus: string | null;
  avatar: string;
  imageCardIdFont: string | null;
  imageCardIdBack: string | null;
  nationalIdNumber: string | null;
  dynamicQrCode: string | null;
  gReCaptchaResponse: string | null;
  doors: string; // JSON string representing an array of numbers
  floors: string; // JSON string representing an array of numbers
  covid19: string | null;
  buildingName: string;
  buildingAddress: string | null;
  statusCode: number;
  allowedBelonging: string | null;
  visiteeAvatar: string | null;
  gender: boolean;
  placeIssueIdNumber: string | null;
  dateIssueIdNumber: string;
  unitName: string | null;
  createdBy: number;
  visitPlace: string | null;
  sizeRotateAvatar: number;
  roomNumber: string | null;
  roomDoorCode: string | null;
  visiteePhone: string | null;
  visiteeEmail: string | null;
  cardList: string | null;
  nationalIdCard: string | null;
}
