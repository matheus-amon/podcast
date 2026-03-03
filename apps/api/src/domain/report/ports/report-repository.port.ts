/**
 * Report Repository Port
 *
 * Interface que define o contrato para o repositório de Report
 * Focado em queries de leitura para relatórios
 */

import type {
  ReportFilters,
  ReportResult,
  FinancialMetrics,
  EpisodeMetrics,
  LeadMetrics,
  AgendaMetrics,
  DashboardMetrics,
} from '../types/report-data.types';
import { TimePeriod } from '../value-objects/time-period.enum';

/**
 * Report Repository Port
 */
export interface IReportRepository {
  // Relatórios específicos
  getFinancialMetrics(filters: ReportFilters): Promise<FinancialMetrics>;
  getEpisodeMetrics(filters: ReportFilters): Promise<EpisodeMetrics>;
  getLeadMetrics(filters: ReportFilters): Promise<LeadMetrics>;
  getAgendaMetrics(filters: ReportFilters): Promise<AgendaMetrics>;

  // Dashboard (métricas combinadas)
  getDashboardMetrics(filters?: ReportFilters): Promise<DashboardMetrics>;

  // Relatório customizado
  getCustomReport(filters: ReportFilters): Promise<ReportResult>;

  // Utilitários
  getDateRange(period: TimePeriod, customStart?: Date, customEnd?: Date): { start: Date; end: Date };
}
