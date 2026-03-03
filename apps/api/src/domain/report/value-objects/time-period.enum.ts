/**
 * Time Period Enum
 *
 * Define os períodos de tempo para relatórios
 */

export enum TimePeriod {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

/**
 * Verifica se um valor é um TimePeriod válido
 */
export function isValidTimePeriod(value: string): value is TimePeriod {
  return Object.values(TimePeriod).includes(value as TimePeriod);
}

/**
 * Retorna as datas de início e fim para um período
 */
export function getDateRange(period: TimePeriod, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date();
  const end = customEnd ?? now;
  let start: Date;

  switch (period) {
    case TimePeriod.TODAY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case TimePeriod.WEEK:
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case TimePeriod.MONTH:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case TimePeriod.QUARTER:
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case TimePeriod.YEAR:
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case TimePeriod.CUSTOM:
      start = customStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}
