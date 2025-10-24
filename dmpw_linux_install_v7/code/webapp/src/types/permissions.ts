export interface IPermissions {
  dashBoard?: {
    viewDashBoard?: boolean;
  };
  monitoring?: {
    viewMonitoring?: boolean;
  };
  deviceMonitoring?: {
    viewDeviceMonitoring?: boolean;
    sendInstructionDeviceMonitoring?: boolean;
  };
  department?: {
    viewDepartment?: boolean;
    addDepartment?: boolean;
    editDepartment?: boolean;
    deleteDepartment?: boolean;
    viewUserDepartment?: boolean;
  };
  user?: {
    viewUser?: boolean;
    addUser?: boolean;
    editUser?: boolean;
    deleteUser?: boolean;
    exportUser?: boolean;
    setWorkingTimeUser?: boolean;
    approveUser?: boolean;
    updateUserSettingUser?: boolean;
  };
  deviceSetting?: {
    viewDeviceSetting?: boolean;
    editDeviceSetting?: boolean;
    copyDeviceSetting?: boolean;
    reinstallDeviceSetting?: boolean;
    viewHistoryDeviceSetting?: boolean;
  };
  building?: {
    viewBuilding?: boolean;
    addBuilding?: boolean;
    editBuilding?: boolean;
    deleteBuilding?: boolean;
    viewMasterBuilding?: boolean;
    regiMasterBuilding?: boolean;
  };
  report?: {
    viewReport?: boolean;
    viewAllReport?: boolean;
    exportReport?: boolean;
  };
  systemLog?: {
    viewSystemLog?: boolean;
    exportSystemLog?: boolean;
  };
  accessibleDoor?: {
    viewAccessibleDoor?: boolean;
    exportAccessibleDoor?: boolean;
  };
  registeredUser?: {
    viewRegisteredUser?: boolean;
    exportRegisteredUser?: boolean;
  };
  accessSchedule?: {
    viewAccessSchedule?: boolean;
    addAccessSchedule?: boolean;
    editAccessSchedule?: boolean;
    deleteAccessSchedule?: boolean;
  };
  deviceReader?: {
    viewDeviceReader?: boolean;
    addDeviceReader?: boolean;
    editDeviceReader?: boolean;
    deleteDeviceReader?: boolean;
  };
  accessGroup?: {
    viewAccessGroup?: boolean;
    addAccessGroup?: boolean;
    editAccessGroup?: boolean;
    deleteAccessGroup?: boolean;
  };
  timezone?: {
    viewTimezone?: boolean;
    addTimezone?: boolean;
    editTimezone?: boolean;
    deleteTimezone?: boolean;
  };
  holiday?: {
    viewHoliday?: boolean;
    addHoliday?: boolean;
    editHoliday?: boolean;
    deleteHoliday?: boolean;
  };
  accessSetting?: {
    editAccessSetting?: boolean;
  };
  vehicleManagement?: {
    viewVehicle?: boolean;
    addVehicle?: boolean;
    editVehicle?: boolean;
    deleteVehicle?: boolean;
  };
  vehicleAllocation?: {
    viewVehicleAllocation?: boolean;
    addVehicleAllocation?: boolean;
    editVehicleAllocation?: boolean;
    deleteVehicleAllocation?: boolean;
    runVehicleAllocation?: boolean;
  };
  timeAttendanceReport?: {
    viewAttendance?: boolean;
    editAttendance?: boolean;
    exportAttendance?: boolean;
    viewHistoryAttendance?: boolean;
    updateAttendanceSettingAttendance?: boolean;
  };
  workingTime?: {
    viewWorkingTime?: boolean;
    addWorkingTime?: boolean;
    editWorkingTime?: boolean;
    deleteWorkingTime?: boolean;
  };
  leaveRequest?: {
    viewLeaveRequest?: boolean;
    addLeaveRequest?: boolean;
    editLeaveRequest?: boolean;
    deleteLeaveRequest?: boolean;
    viewLeaveManagementLeaveRequest?: boolean;
    manageOwnRecordLeaveRequest?: boolean;
  };
  visitManagement?: {
    viewVisit?: boolean;
    addVisit?: boolean;
    editVisit?: boolean;
    deleteVisit?: boolean;
    exportVisit?: boolean;
    viewHistoryVisit?: boolean;
    approveVisit?: boolean;
    returnCardVisit?: boolean;
  };
  visitReport?: {
    viewVisitReport?: boolean;
    exportVisitReport?: boolean;
  };
  visitSetting?: {
    editVisitSetting?: boolean;
  };
}
