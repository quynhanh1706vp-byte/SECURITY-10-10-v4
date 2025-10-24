export interface IPermission {
  title: string;
  permissionName: string;
  description: string;
  isEnabled: boolean;
}

export interface IPermissionGroup {
  title: string;
  groupName: string;
  permissions: IPermission[];
}

export interface IRole {
  id: number;
  roleName: string;
  isDefault: boolean;
  enableDepartmentLevel: boolean;
  roleSettingDefault: boolean;
  description: string;
  userCount: number;
  permissionGroups: IPermissionGroup[] | null;
}
