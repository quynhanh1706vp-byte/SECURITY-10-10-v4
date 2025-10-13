export interface IDeviceReader {
  buildingName: string;
  deviceName: string;
  deviceType: string;
  icuDeviceId: number;
  id: number;
  ipAddress: string;
  macAddress: string;
  name: string;
  status: number;
  isCamera: boolean;
  cameraId: number;
  deviceReaderId: number;
}
