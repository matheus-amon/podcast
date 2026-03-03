/**
 * Report Type Enum
 *
 * Define os tipos de relatórios disponíveis
 */

export enum ReportType {
  FINANCIAL = 'FINANCIAL',
  EPISODE = 'EPISODE',
  LEAD = 'LEAD',
  AGENDA = 'AGENDA',
  CUSTOM = 'CUSTOM',
}

/**
 * Verifica se um valor é um ReportType válido
 */
export function isValidReportType(value: string): value is ReportType {
  return Object.values(ReportType).includes(value as ReportType);
}
