export type DayDetail = {
  from: number;
  to: number;
};

export type DayKeys =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'holidayType1'
  | 'holidayType2'
  | 'holidayType3';

export type TAccessTime = {
  id: string;
  name?: string | null;
  remarks?: string | null;
  createdBy: number;
  createdOn: string; // ISO date-time string
  updatedBy: number;
  updatedOn: string; // ISO date-time string;
} & {
  [K in DayKeys]?: DayDetail[];
};
