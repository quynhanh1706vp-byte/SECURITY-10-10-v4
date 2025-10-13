export interface IAccount {
  id: number;
  accountId: number;
  email: string;
  userName: string;
  firstName: string;
  role: string;
  status: string | null;
  companyName: string;
  companyNames: string | null;
  timeZone: string | null;
  department: string | null;
  departmentName: string | null;
  position: string | null;
}

export interface IFormAccount {
  id: number;
  username: string | null;
  password: string | null;
  confirmPassword: string | null;
  companyId: number;
  rootFlag: boolean;
  role: number;
  status: number;
  timeZone: string | null;
  isCurrentAccount: boolean;
  companyIdList: number[] | null;
  roleList: {
    id: number;
    name: string;
  }[];
  statusList: any | null;
  avatar: string | null;
  allLanguage: any[] | null;
  preferredSystem: string | number | null;
  language: string | null;
}
