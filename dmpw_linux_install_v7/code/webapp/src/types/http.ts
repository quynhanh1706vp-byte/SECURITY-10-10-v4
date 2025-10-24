type Meta = {
  recordsTotal: number;
  recordsFiltered: number;
  totalUnRead: number;
  totalAmount: number;
};

export type BaseResponse<TData = any> = {
  data: TData;
  meta?: Meta;
  message?: string;
};

export type BaseQuery = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: string;
};
