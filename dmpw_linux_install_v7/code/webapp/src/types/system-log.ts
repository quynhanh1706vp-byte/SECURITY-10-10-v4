export type TSystemLog = {
  uuid?: string; // UUID duy nhất cho mỗi log
  id: number;
  operationTime: string; // ví dụ: "21.06.2025 12:58:57"
  userAccount: string;
  operationType: string;
  action: string;
  operationAction: string;
  message: string;
  details: string; // có thể chứa HTML (ví dụ có <br />)
  htmlparse: boolean;
};
