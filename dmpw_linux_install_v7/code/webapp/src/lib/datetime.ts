import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

/**
 * Formats a date string from one format to another.
 * @param date - The date string to format.
 * @param dateFormat - The format of the input date string. Default is `DD.MM.YYYY HH:mm:ss`.
 * @param format - The desired output format for the date string. Default is `DD/MM/YYYY`.
 */
export const formatDate = (date: string, dateFormat = 'DD.MM.YYYY HH:mm:ss', format = 'DD/MM/YYYY'): string => {
  return dayjs.utc(date, dateFormat).local().format(format);
};

export const formatDateTime = (
  date: string,
  dateFormat = 'DD.MM.YYYY HH:mm:ss',
  format = 'DD/MM/YYYY HH:mm:ss',
): string => {
  return dayjs.utc(date, dateFormat).local().format(format);
};

export const standardFullDateTimeFormat = (date: string, dateFormat = 'DD.MM.YYYY HH:mm:ss', strDefault = ''): string => {
  if (!date) {
    return strDefault;
  }

  return dayjs.utc(date, dateFormat).local().format("DD/MM/YYYY HH:mm:ss");
};

/**
 * Formats an ISO 8601 timestamp to local time.
 * @param isoDate - The ISO 8601 date string (e.g., "2025-07-04T14:09:29.308974Z").
 * @param format - The desired output format. Default is `DD/MM/YYYY HH:mm:ss`.
 * @returns Formatted local time string.
 */
export const formatISODateTime = (isoDate: string, format = 'DD/MM/YYYY HH:mm:ss'): string => {
  return dayjs(isoDate).local().format(format);
};

export const formatTime = (timestamp: number, format = 'hh:mm:ss'): string => {
  return dayjs(timestamp * 1000).format(format);
};
