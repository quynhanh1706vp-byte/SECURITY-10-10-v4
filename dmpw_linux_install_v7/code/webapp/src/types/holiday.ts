type EnumModel = {
  id: number;
  name?: string | null;
};

export type THoliday = {
  id: string;
  name?: string | null; // Holiday name
  companyId: number;
  type: number; // Holiday type
  startDate?: string | null; // Start date
  endDate?: string | null; // End date
  recursive: boolean;
  remarks?: string | null;
  holidayTypeItems?: EnumModel[] | null;
};
