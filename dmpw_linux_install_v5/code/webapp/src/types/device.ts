interface IDeviceConfigItem {
  id: number;
  name: string;
}

export interface IDevice {
  activeTimezoneId?: number;
  activeTimezoneItems: IDeviceConfigItem[];
  alarm: boolean;
  autoAcceptVideoCall: boolean;
  backupPeriod: number;
  bioStationMode: number;
  bioStationModeItems: IDeviceConfigItem[];
  building?: string;
  buildingId?: number;
  buzzerReader0?: number;
  buzzerReader1?: number;
  closeReverseLock: boolean;
  companyId?: number;
  controllerId?: number;
  dependentDoors?: number[];
  dependentDoorsIds: IDeviceConfigItem[];
  deviceAddress?: string;
  deviceBuzzer: number;
  deviceManagerIds?: number[];
  deviceType: number;
  deviceTypeItems: IDeviceConfigItem[];
  doorName?: string;
  doorStatus?: string;
  doorStatusId?: number;
  doorActiveTimeZone?: string;
  enableVideoCall: boolean;
  id: number;
  image?: string;
  ipAddress?: string;
  isTwoPart: boolean;
  ledReader0?: number;
  ledReader1?: number;
  lockOpenDuration: number;
  macAddress?: string;
  maxOpenDuration?: number;
  mealServiceTimeId?: number;
  mprCount?: number;
  mprInterval: number;
  operationType: number;
  operationTypeItems: IDeviceConfigItem[];
  passageTimezoneId?: number;
  passback?: number;
  passbackItems: IDeviceConfigItem[];
  roleReader0?: number;
  roleReader1?: number;
  sensorDuration?: number;
  sensorType: number;
  sensorTypeItems: IDeviceConfigItem[];
  serverIp?: string;
  serverPort: number;
  twoPartTimeFrom?: string;
  twoPartTimeTo?: string;
  useAlarmRelay: boolean;
  useCardReader?: number;
  verifyMode: number;
  verifyModeItems: IDeviceConfigItem[];
  registerIdNumber: number;
  fromDbIdNumber: number;
  connectionStatus: number;
}

export interface IDeviceFormValues {
  doorName: string;
  buildingId?: number;
  operationType: number;
  activeTimezoneId: number;
  verifyMode: number;
  dependentDoors?: number[];
  ipAddress?: string;
  macAddress?: string;
  serverIp?: string;
  serverPort: number;
  deviceAddress: string;
  deviceType: number;
  passback?: number;
  sensorType: number;
  bioStationMode: number;
  lockOpenDuration?: number;
  maxOpenDuration?: number;
  sensorDuration?: number;
  mprCount: number;
  mprInterval?: number;
  deviceBuzzer: boolean;
  alarm: boolean;
  useAlarmRelay: boolean;
  closeReverseLock: boolean;
  useCardReader: boolean;
  uploadImage?: {
    url?: string;
    originFileObj?: File;
  }[];
}

export interface IDevicesInit {
  listCompany: Array<IDeviceConfigItem>;
  listConnection: Array<IDeviceConfigItem>;
  listDeviceType: Array<IDeviceConfigItem>;
  listOperationType: Array<IDeviceConfigItem>;
  lstVerifyMode: Array<IDeviceConfigItem>;
}

interface IDoorStatus {
  id: number;
  name: string;
  backgroundColor: string;
  fontColor: string;
}
export interface IDeviceInit {
  templateMonitoring: IDeviceConfigItem[];
  eventType: IDeviceConfigItem[];
  doorStatus: IDoorStatus[];
}
