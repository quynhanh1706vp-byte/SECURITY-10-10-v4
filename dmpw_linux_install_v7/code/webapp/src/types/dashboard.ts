export type TAccessData = {
  doorStatus: {
    id: number;
    name: string;
  }[];

  eventChartData: Array<{
    doorName: string;
    buildingName: string;
    buildingId: number;
    deviceId: number;
    inData: number[];
    outData: number[];
  }>;

  totalAbnormalEvents: number;
  totalAccessEvents: number;
  totalDevices: number;
  totalOfflineDevices: number;
  totalOnlineDevices: number;
  totalUnknownPerson: number;
  totalUsers: number;
  totalUsersAccess: number;
  totalUsersIn: number;
  totalUsersOut: number;
  totalVisits: number;
  totalVisitsIn: number;
  totalVisitsOut: number;
};

export type TVisitData = {
  totalAwaitingVisitors: number;
  totalRegisteredVisitor: number;
  totalVisitorAccess: number;
};

export type TVehicleData = {
  totalVehicles: number;
  totalVehiclesIn: number;
  totalVehiclesOfUser: number;
  totalVehiclesOfVisit: number;
  totalVehiclesOut: number;
};
